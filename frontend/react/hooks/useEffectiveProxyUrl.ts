/**
 * Resolve the effective CORS proxy URL for the current user.
 *
 *   - Free build, or signed-out / non-subscribed Premium user
 *       → returns `config.corsProxy` verbatim (existing behaviour).
 *   - Premium build + active subscription + no user override
 *       → returns the hosted proxy URL (e.g. `https://hoursmith.io/api/proxy`).
 *
 * The subscription state is pushed into `proxyUrlBridge` by the Premium auth
 * code (`useSubscription`) so this hook itself never touches /premium/ and
 * stays buildable in the Free tier (CI guard:
 * `scripts/check-premium-boundary.cjs`).
 *
 * Linear: ADA-273.
 */

import { useSyncExternalStore } from 'react';
import {
	getProxyOverrideState,
	resolveProxyUrl,
	subscribe,
} from '../../services/proxyUrlBridge';
import { useConfigStore } from '../../stores/useConfigStore';

export function useEffectiveProxyUrl(): string {
	const userConfiguredProxy = useConfigStore((s) => s.config.corsProxy);
	// We don't need the full state — only re-render when the resolved URL
	// would change. useSyncExternalStore with a derived selector keeps that tight.
	useSyncExternalStore(subscribe, getProxyOverrideState, getProxyOverrideState);
	return resolveProxyUrl(userConfiguredProxy);
}
