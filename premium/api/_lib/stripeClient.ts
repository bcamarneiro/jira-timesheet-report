/**
 * Stripe SDK factory.
 *
 * Centralised so the API version + secret-key plumbing stays consistent across
 * every Vercel Function that talks to Stripe (Checkout, webhook, account
 * delete, etc.). Tests mock this module's `defaultStripe()` and never reach
 * the network.
 *
 * Linear: ADA-263.
 */

import Stripe from 'stripe';

/**
 * Minimal Stripe surface used by GDPR endpoints. Keeping this an interface
 * (rather than reaching for `Stripe` directly in call sites) lets unit tests
 * inject a hand-rolled mock without faking the entire SDK.
 */
export interface StripeLikeClient {
	subscriptions: {
		cancel(
			id: string,
			params?: { invoice_now?: boolean; prorate?: boolean },
		): Promise<{ id: string; status: string }>;
	};
}

export function defaultStripe(): StripeLikeClient {
	const secret = process.env.STRIPE_SECRET_KEY;
	if (!secret) {
		throw new Error('STRIPE_SECRET_KEY must be set.');
	}
	return new Stripe(secret, {
		// Pin the API version so behaviour does not drift under our feet.
		apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
	}) as unknown as StripeLikeClient;
}
