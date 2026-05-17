/**
 * Stripe Checkout Session creator for Hoursmith Premium.
 *
 * `POST /api/checkout` with `{ priceId: 'monthly' | 'yearly' }` and a Supabase
 * JWT in the `Authorization: Bearer ...` header. Returns `{ url }` pointing at
 * Stripe-hosted Checkout. The frontend (ADA-257) redirects there. Webhook
 * (ADA-261) is what actually flips the subscription to `active` later.
 *
 * Idempotency: we look up `stripe_customer_id` on the user's `subscriptions`
 * row first. If present, reuse it. If absent, create a Stripe Customer with
 * `metadata.user_id`, then pre-insert a `subscriptions` row in `incomplete`
 * status so the webhook has somewhere to land.
 *
 * Logging discipline (compliance-critical):
 *   DO log:    timestamp, user_id, stripe customer_id, success/error code.
 *   DO NOT log: full Stripe Session, request body, Authorization header.
 *
 * Linear: ADA-260.
 */

import type Stripe from 'stripe';
import { createStripeClient } from '../_lib/stripeClient';
import {
	type SupabaseAdminClient,
	createSupabaseAdmin,
} from '../_lib/supabaseAdmin';

// Pin to Frankfurt for GDPR residency. Mirrors vercel.json.
export const config = {
	runtime: 'nodejs',
	regions: ['fra1'],
};

export type PriceTier = 'monthly' | 'yearly';

export interface CheckoutDeps {
	/** Inject Supabase admin client (tests). */
	supabase?: SupabaseAdminClient;
	/** Inject Stripe client (tests). */
	stripe?: Stripe;
	/** Inject env reader (tests). Defaults to `process.env`. */
	env?: Partial<Record<string, string | undefined>>;
}

const PRICE_ENV: Record<PriceTier, string> = {
	monthly: 'STRIPE_PRICE_PREMIUM_MONTHLY',
	yearly: 'STRIPE_PRICE_PREMIUM_YEARLY',
};

export default async function handler(request: Request): Promise<Response> {
	return handleCheckout(request);
}

/**
 * Exported for unit tests so they can inject mocked Stripe/Supabase clients
 * without re-implementing the Vercel handler signature.
 */
export async function handleCheckout(
	request: Request,
	deps: CheckoutDeps = {},
): Promise<Response> {
	const start = Date.now();
	const env = deps.env ?? process.env;

	if (request.method !== 'POST') {
		return jsonResponse(405, { error: 'method_not_allowed' });
	}

	// 1. Auth: verify the Supabase JWT. We don't need an active subscription
	//    (the user is about to create one), only a valid logged-in identity.
	const token = extractBearer(request.headers.get('authorization'));
	if (!token) {
		logCheckout({
			userId: null,
			customerId: null,
			code: 'missing_token',
			status: 401,
			durationMs: Date.now() - start,
		});
		return jsonResponse(401, { error: 'missing_token' });
	}

	let supabase: SupabaseAdminClient;
	try {
		supabase = createSupabaseAdmin({ client: deps.supabase });
	} catch {
		logCheckout({
			userId: null,
			customerId: null,
			code: 'server_misconfigured',
			status: 500,
			durationMs: Date.now() - start,
		});
		return jsonResponse(500, { error: 'server_misconfigured' });
	}

	const userId = await supabase.getUserIdFromToken(token);
	if (!userId) {
		logCheckout({
			userId: null,
			customerId: null,
			code: 'invalid_token',
			status: 401,
			durationMs: Date.now() - start,
		});
		return jsonResponse(401, { error: 'invalid_token' });
	}

	// 2. Parse body and validate priceId.
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		body = null;
	}
	const priceTier = parsePriceTier(body);
	if (!priceTier) {
		logCheckout({
			userId,
			customerId: null,
			code: 'invalid_price_id',
			status: 400,
			durationMs: Date.now() - start,
		});
		return jsonResponse(400, { error: 'invalid_price_id' });
	}

	// 3. Resolve env-driven config.
	const stripePriceId = env[PRICE_ENV[priceTier]];
	const appUrl = env.APP_URL;
	if (!stripePriceId || !appUrl) {
		logCheckout({
			userId,
			customerId: null,
			code: 'server_misconfigured',
			status: 500,
			durationMs: Date.now() - start,
		});
		return jsonResponse(500, { error: 'server_misconfigured' });
	}

	// 4. Stripe client.
	let stripe: Stripe;
	try {
		stripe = deps.stripe ?? createStripeClient();
	} catch {
		logCheckout({
			userId,
			customerId: null,
			code: 'server_misconfigured',
			status: 500,
			durationMs: Date.now() - start,
		});
		return jsonResponse(500, { error: 'server_misconfigured' });
	}

	// 5. Idempotent customer lookup. Either reuse the existing customer id or
	//    create a new Stripe Customer + stub subscriptions row.
	let customerId: string;
	try {
		const existing = await supabase.getSubscriptionByUserId(userId);
		if (existing?.stripe_customer_id) {
			customerId = existing.stripe_customer_id;
		} else {
			const email = (await supabase.getProfileEmail(userId)) ?? undefined;
			const customer = await stripe.customers.create({
				email,
				metadata: { user_id: userId },
			});
			customerId = customer.id;
			await supabase.insertIncompleteSubscription({
				userId,
				stripeCustomerId: customerId,
			});
		}
	} catch (err) {
		logCheckout({
			userId,
			customerId: null,
			code: 'customer_provisioning_failed',
			status: 502,
			durationMs: Date.now() - start,
			detail: (err as Error).message,
		});
		return jsonResponse(502, { error: 'customer_provisioning_failed' });
	}

	// 6. Create the Checkout Session.
	let session: Stripe.Checkout.Session;
	try {
		session = await stripe.checkout.sessions.create({
			mode: 'subscription',
			customer: customerId,
			line_items: [{ price: stripePriceId, quantity: 1 }],
			subscription_data: { metadata: { user_id: userId } },
			success_url: `${appUrl.replace(/\/+$/, '')}/account?upgrade=success`,
			cancel_url: `${appUrl.replace(/\/+$/, '')}/account?upgrade=cancel`,
			automatic_tax: { enabled: true },
			tax_id_collection: { enabled: true },
		});
	} catch (err) {
		logCheckout({
			userId,
			customerId,
			code: 'stripe_session_failed',
			status: 502,
			durationMs: Date.now() - start,
			detail: (err as Error).message,
		});
		return jsonResponse(502, { error: 'stripe_session_failed' });
	}

	if (!session.url) {
		logCheckout({
			userId,
			customerId,
			code: 'stripe_session_missing_url',
			status: 502,
			durationMs: Date.now() - start,
		});
		return jsonResponse(502, { error: 'stripe_session_failed' });
	}

	logCheckout({
		userId,
		customerId,
		code: 'ok',
		status: 200,
		durationMs: Date.now() - start,
	});
	return jsonResponse(200, { url: session.url });
}

function parsePriceTier(body: unknown): PriceTier | null {
	if (!body || typeof body !== 'object') return null;
	const raw = (body as { priceId?: unknown }).priceId;
	return raw === 'monthly' || raw === 'yearly' ? raw : null;
}

function extractBearer(header: string | null): string | null {
	if (!header) return null;
	const match = header.match(/^Bearer\s+(.+)$/i);
	if (!match) return null;
	const token = match[1].trim();
	return token.length > 0 ? token : null;
}

function jsonResponse(status: number, body: Record<string, unknown>): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

interface CheckoutLogFields {
	userId: string | null;
	customerId: string | null;
	code: string;
	status: number;
	durationMs: number;
	detail?: string;
}

/**
 * Structured log line. Explicitly scrubbed: no headers, no request body, no
 * Stripe session object. `customer_id` is intentionally logged — per Stripe's
 * own guidance it is not PII and is essential for cross-system debugging.
 */
function logCheckout(fields: CheckoutLogFields): void {
	const line = {
		ts: new Date().toISOString(),
		svc: 'hoursmith-checkout',
		user_id: fields.userId,
		stripe_customer_id: fields.customerId,
		code: fields.code,
		status: fields.status,
		duration_ms: fields.durationMs,
		...(fields.detail ? { detail: fields.detail } : {}),
	};
	console.log(JSON.stringify(line));
}
