/**
 * Settings-UI hook for the Proxy URL section (ADA-273).
 *
 * Exposes:
 *   - `mode`             — `'hosted'` when the hosted Premium proxy is active,
 *                          `'self-hosted'` when the user provides their own
 *                          proxy (or `null` when empty),
 *                          `'direct'` when no proxy is set.
 *   - `hostedUrl`        — the resolved hosted URL (read-only for display).
 *   - `userOverride`     — whether the escape hatch is on.
 *   - `setUserOverride`  — toggle the escape hatch.
 *
 * The component renders a badge + override link based on these.
 */

import { useSyncExternalStore } from 'react';
import {
	getProxyOverrideState,
	setUserOverride,
	subscribe,
} from '../../services/proxyUrlBridge';
import { useConfigStore } from '../../stores/useConfigStore';

export interface ProxyBadgeView {
	mode: 'hosted' | 'self-hosted' | 'direct';
	hostedUrl: string | null;
	userOverride: boolean;
	canOverride: boolean;
	setUserOverride: (enabled: boolean) => void;
}

export function useProxyBadge(): ProxyBadgeView {
	const userConfiguredProxy = useConfigStore((s) => s.config.corsProxy);
	const bridge = useSyncExternalStore(
		subscribe,
		getProxyOverrideState,
		getProxyOverrideState,
	);

	const canOverride = bridge.hostedProxyUrl !== null;
	let mode: ProxyBadgeView['mode'];
	if (bridge.hostedProxyUrl && !bridge.userOverride) {
		mode = 'hosted';
	} else if (userConfiguredProxy.trim()) {
		mode = 'self-hosted';
	} else {
		mode = 'direct';
	}

	return {
		mode,
		hostedUrl: bridge.hostedProxyUrl,
		userOverride: bridge.userOverride,
		canOverride,
		setUserOverride,
	};
}
