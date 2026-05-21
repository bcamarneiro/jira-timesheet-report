/**
 * Tests for `useEffectiveProxyUrl` (ADA-273).
 *
 * We can't easily flip the inlined `__BUILD_TIER__` define between test cases,
 * so the "free build" path is exercised by clearing the bridge — same
 * runtime effect (no hosted URL pushed in). The premium-build behaviour is
 * exercised by pushing a hosted URL into the bridge via
 * `setHostedProxyUrl`, which is what `useSubscription` does when it sees an
 * active sub. The boundary between the two is therefore the bridge state,
 * which is what `useEffectiveProxyUrl` actually reads from.
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
	__resetProxyBridgeForTests,
	setHostedProxyUrl,
	setUserOverride,
} from '../../../services/proxyUrlBridge';
import { useConfigStore } from '../../../stores/useConfigStore';
import { useEffectiveProxyUrl } from '../useEffectiveProxyUrl';

function setUserConfiguredProxy(value: string) {
	useConfigStore.getState().setConfig({
		...useConfigStore.getState().config,
		corsProxy: value,
	});
}

describe('useEffectiveProxyUrl', () => {
	afterEach(() => {
		__resetProxyBridgeForTests();
		setUserConfiguredProxy('');
	});

	it('returns the user-configured proxy when the bridge is empty (free build / signed out)', () => {
		setUserConfiguredProxy('http://localhost:8081');
		const { result } = renderHook(() => useEffectiveProxyUrl());
		expect(result.current).toBe('http://localhost:8081');
	});

	it('returns the user-configured proxy when the bridge has no hosted URL (signed-in, no active sub)', () => {
		setUserConfiguredProxy('http://localhost:8081');
		setHostedProxyUrl(null);
		const { result } = renderHook(() => useEffectiveProxyUrl());
		expect(result.current).toBe('http://localhost:8081');
	});

	it('returns the hosted URL when the bridge has one and override is off (active sub)', () => {
		setUserConfiguredProxy('http://localhost:8081');
		setHostedProxyUrl('https://hoursmith.io/api/proxy');
		const { result } = renderHook(() => useEffectiveProxyUrl());
		expect(result.current).toBe('https://hoursmith.io/api/proxy');
	});

	it('respects the user override and returns the user-configured proxy even when subscribed', () => {
		setUserConfiguredProxy('http://localhost:8081');
		setHostedProxyUrl('https://hoursmith.io/api/proxy');
		setUserOverride(true);
		const { result } = renderHook(() => useEffectiveProxyUrl());
		expect(result.current).toBe('http://localhost:8081');
	});

	it('re-renders when the bridge flips (subscription lapses mid-session)', () => {
		setUserConfiguredProxy('http://localhost:8081');
		setHostedProxyUrl('https://hoursmith.io/api/proxy');
		const { result } = renderHook(() => useEffectiveProxyUrl());
		expect(result.current).toBe('https://hoursmith.io/api/proxy');
		act(() => setHostedProxyUrl(null));
		expect(result.current).toBe('http://localhost:8081');
	});

	it('returns an empty string when the user has no proxy and is not subscribed', () => {
		setUserConfiguredProxy('');
		const { result } = renderHook(() => useEffectiveProxyUrl());
		expect(result.current).toBe('');
	});
});
