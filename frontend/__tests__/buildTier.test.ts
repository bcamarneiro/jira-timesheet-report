import { describe, expect, it } from 'vitest';
import { BUILD_TIER, isPremiumBuild } from '../buildTier';

describe('buildTier', () => {
	it('exposes a valid build tier', () => {
		expect(['free', 'premium']).toContain(BUILD_TIER);
	});

	it('defaults to free when BUILD_TIER is unset', () => {
		expect(BUILD_TIER).toBe('free');
	});

	it('isPremiumBuild reflects BUILD_TIER', () => {
		expect(isPremiumBuild()).toBe(BUILD_TIER === 'premium');
	});
});
