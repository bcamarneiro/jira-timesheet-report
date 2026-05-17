/**
 * Cross-tier bridge between Premium auth state and the network layer.
 *
 * The Free-tier bundle owns the proxy URL via `useConfigStore.config.corsProxy`.
 * Premium needs to override this with a hosted endpoint when the user has an
 * active subscription — but the Free-tier code can't import anything under
 * `/premium/` (see `scripts/check-premium-boundary.cjs`). This module is the
 * one-way seam:
 *
 *   premium auth ── setHostedProxyUrl()/clear() ──▶ this bridge ──▶ resolveProxyUrl()
 *
 * The bridge keeps state in module scope. `subscribe(listener)` lets React
 * hooks rerender when the hosted URL flips so the dashboard fetcher reconfigures
 * mid-session.
 *
 * Why not a Zustand store? We want this to be importable from anywhere
 * without dragging in React. The shape is too small to justify a store.
 *
 * Linear: ADA-273.
 */

export interface ProxyOverrideState {
	/**
	 * The fully-qualified hosted CORS proxy URL the user is entitled to, or
	 * `null` when the user is signed out / on Free / sub not active. Always
	 * normalised with no trailing slash so callers can append paths safely.
	 */
	hostedProxyUrl: string | null;
	/**
	 * When `true`, the user explicitly asked to keep their self-configured
	 * proxy URL even though they're entitled to the hosted one (escape hatch).
	 * Respected only when `hostedProxyUrl` is set.
	 */
	userOverride: boolean;
	/**
	 * Supabase access token of the currently signed-in user. The hosted
	 * proxy uses this to verify entitlement on each request. Held in memory
	 * only — never persisted.
	 */
	supabaseAccessToken: string | null;
}

const STATE: ProxyOverrideState = {
	hostedProxyUrl: null,
	userOverride: false,
	supabaseAccessToken: null,
};

// Cached frozen snapshot — returned by `getProxyOverrideState()` until a
// mutation triggers `emit()`. Required by `useSyncExternalStore`: the getter
// must return a stable reference between renders, otherwise React flags an
// infinite loop because every read produces a "new" value.
let snapshot: ProxyOverrideState = { ...STATE };

type Listener = (state: ProxyOverrideState) => void;
const listeners = new Set<Listener>();

function emit(): void {
	snapshot = { ...STATE };
	for (const listener of listeners) listener(snapshot);
}

/** Subscribe to bridge changes. Returns an unsubscribe function. */
export function subscribe(listener: Listener): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

/** Read the current snapshot (sync). Useful for `useSyncExternalStore`. */
export function getProxyOverrideState(): ProxyOverrideState {
	return snapshot;
}

/**
 * Premium pushes the hosted proxy URL here when the user has an active sub.
 * Pass `null` to clear (signed out, sub lapsed, free tier).
 */
export function setHostedProxyUrl(url: string | null): void {
	const normalised = url ? url.replace(/\/+$/, '') : null;
	if (STATE.hostedProxyUrl === normalised) return;
	STATE.hostedProxyUrl = normalised;
	emit();
}

/**
 * Toggle the user's "use my self-configured proxy anyway" escape hatch.
 * No-ops when the user isn't subscribed (override only matters then).
 */
export function setUserOverride(enabled: boolean): void {
	if (STATE.userOverride === enabled) return;
	STATE.userOverride = enabled;
	emit();
}

/** Premium pushes the current Supabase access token here. Pass `null` to clear. */
export function setSupabaseAccessToken(token: string | null): void {
	if (STATE.supabaseAccessToken === token) return;
	STATE.supabaseAccessToken = token;
	emit();
}

/**
 * Compute the effective proxy URL. Inputs:
 *   - `userConfiguredProxy` — the value of `config.corsProxy` from settings.
 *
 * Rules (mirrors ADA-273 spec):
 *   1. If the bridge has a hosted URL AND the user has NOT overridden →
 *      return the hosted URL.
 *   2. Otherwise → return the user-configured value verbatim.
 *
 * Note: returning an empty string is a valid result (means "no proxy, talk
 * to Jira directly"). Callers preserve that behaviour today.
 */
export function resolveProxyUrl(userConfiguredProxy: string): string {
	if (STATE.hostedProxyUrl && !STATE.userOverride) {
		return STATE.hostedProxyUrl;
	}
	return userConfiguredProxy;
}

/** Whether the network layer is currently routed through the hosted proxy. */
export function isUsingHostedProxy(): boolean {
	return STATE.hostedProxyUrl !== null && !STATE.userOverride;
}

/** Test-only — reset to defaults. */
export function __resetProxyBridgeForTests(): void {
	STATE.hostedProxyUrl = null;
	STATE.userOverride = false;
	STATE.supabaseAccessToken = null;
	snapshot = { ...STATE };
	listeners.clear();
}
