/**
 * Stripe SDK factory + webhook verifier for Hoursmith Premium.
 *
 * Centralised so API version + secret-key plumbing stay consistent across
 * every Vercel Function that talks to Stripe (Checkout, webhook, account
 * delete, etc.).
 *
 * Two surfaces:
 *   - `getStripe()`         — returns the full memoised SDK instance for
 *                             callers that need rich endpoints (Checkout
 *                             Sessions, Customers, Subscriptions API).
 *   - `defaultStripe()`     — returns the same instance typed as the
 *                             minimal `StripeLikeClient` interface so
 *                             GDPR-style call sites can stay narrow and
 *                             unit-mockable.
 *   - `constructStripeEvent()` — verifies a webhook signature and returns
 *                                the parsed event. Verifier is injectable
 *                                for tests.
 *
 * Linear: ADA-260, ADA-261, ADA-263.
 */

import Stripe from 'stripe';

let cached: Stripe | null = null;

/** Full Stripe SDK instance, memoised. Throws if `STRIPE_SECRET_KEY` is unset. */
export function getStripe(): Stripe {
	if (cached) return cached;
	const key = process.env.STRIPE_SECRET_KEY;
	if (!key) {
		throw new Error('STRIPE_SECRET_KEY must be set in the Vercel environment.');
	}
	cached = new Stripe(key, {
		apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
	});
	return cached;
}

/** Minimal Stripe surface used by GDPR endpoints. Keeps mocks tight. */
export interface StripeLikeClient {
	subscriptions: {
		cancel(
			id: string,
			params?: { invoice_now?: boolean; prorate?: boolean },
		): Promise<{ id: string; status: string }>;
	};
}

export function defaultStripe(): StripeLikeClient {
	return getStripe() as unknown as StripeLikeClient;
}

/** Injectable Stripe webhook signature verifier. */
export type StripeEventVerifier = (
	rawBody: string,
	signature: string,
	secret: string,
) => Stripe.Event;

const defaultVerifier: StripeEventVerifier = (rawBody, signature, secret) =>
	getStripe().webhooks.constructEvent(rawBody, signature, secret);

/**
 * Verify a Stripe webhook signature and return the parsed event. Throws on
 * bad signature — callers MUST translate that into a 400 response.
 */
export function constructStripeEvent(
	rawBody: string,
	signature: string,
	secret: string,
	verifier: StripeEventVerifier = defaultVerifier,
): Stripe.Event {
	return verifier(rawBody, signature, secret);
}

/** Reset the memoised client. Test-only. */
export function __resetStripeForTests(): void {
	cached = null;
}
