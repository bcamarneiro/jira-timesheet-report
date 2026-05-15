declare const __BUILD_TIER__: 'free' | 'premium';

export type BuildTier = 'free' | 'premium';

export const BUILD_TIER: BuildTier = __BUILD_TIER__;

export function isPremiumBuild(): boolean {
	return BUILD_TIER === 'premium';
}
