/**
 * Stripe webhook handler for Hoursmith Premium.
 *
 * Receives subscription lifecycle events from Stripe and keeps the
 * `public.subscriptions` table in sync. This is the only place outside
 * the Checkout function (ADA-260) that writes to `subscriptions`.
 *
 * Linear: ADA-261.
 *
 * Endpoint: POST /api/stripe/webhook  (Vercel routes premium/api/stripe/webhook.ts)
 * Region:   fra1 (GDPR residency, matches `vercel.json`).
 *
 * Security model:
 *   1. Read the RAW body (`req.text()`). Parsing first would break HMAC verify.
 *   2. Verify the `Stripe-Signature` header against `STRIPE_WEBHOOK_SECRET`.
 *   3. Only then act on the event. Verification failures return 400 with no
 *      detail and no DB write.
 *
 * Idempotency:
 *   - All upserts are on `subscriptions.user_id` (PK), so replay is safe.
 *   - We compare `event.created` to the row's `updated_at`; older events are
 *     skipped to defend against out-of-order delivery.
 *   - Stripe retries non-2xx for 3 days, so the handler must always return
 *     2xx unless the event is genuinely unprocessable (bad signature).
 *
 * Logging discipline (compliance-critical):
 *   DO log:    timestamp, event id, event type, user_id, resulting status,
 *              outcome code.
 *   DO NOT log: raw body, signature header, payment method data, customer
 *               email, or anything else customer-facing.
 */

import type Stripe from 'stripe';
import {
	constructStripeEvent,
	type StripeEventVerifier,
} from '../_lib/stripeClient.js';
import {
	defaultSupabaseAdmin,
	type SubscriptionUpsert,
	type SupabaseAdminClient,
} from '../_lib/supabaseAdmin.js';

// Pin to Frankfurt for GDPR residency. Mirrors vercel.json.
//
// Edge runtime: Stripe SDK is configured with `createFetchHttpClient()` and
// signatures are verified with `constructEventAsync` (Web Crypto), so the
// webhook is fully edge-compatible. Raw body access uses `request.text()`.
export const config = {
	runtime: 'edge',
	regions: ['fra1'],
};

/** Outcome codes used for structured logging only — never returned to Stripe. */
type Outcome =
	| 'ok'
	| 'ignored_unknown_event'
	| 'ignored_stale_event'
	| 'logged_payment_failure'
	| 'missing_signature'
	| 'invalid_signature'
	| 'server_misconfigured'
	| 'missing_user_id'
	| 'upsert_failed';

export interface WebhookDeps {
	supabase?: SupabaseAdminClient;
	verifier?: StripeEventVerifier;
	now?: () => Date;
}

export default async function handler(request: Request): Promise<Response> {
	return handleWebhook(request);
}

/**
 * Exported for unit tests. Production callers go through {@link handler},
 * which lets Vercel inject the platform `Request`.
 */
export async function handleWebhook(
	request: Request,
	deps: WebhookDeps = {},
): Promise<Response> {
	if (request.method !== 'POST') {
		return jsonResponse(405, { error: 'method_not_allowed' });
	}

	const signature = request.headers.get('stripe-signature');
	if (!signature) {
		logWebhook({
			eventId: null,
			eventType: null,
			userId: null,
			outcome: 'missing_signature',
			status: 400,
		});
		return jsonResponse(400, { error: 'invalid_signature' });
	}

	const secret = process.env.STRIPE_WEBHOOK_SECRET;
	if (!secret) {
		// Programmer/ops error — surface as 500 so Stripe retries until fixed.
		logWebhook({
			eventId: null,
			eventType: null,
			userId: null,
			outcome: 'server_misconfigured',
			status: 500,
		});
		return jsonResponse(500, { error: 'server_misconfigured' });
	}

	// Raw body MUST be the unparsed string — parsing breaks HMAC verification.
	const rawBody = await request.text();

	let event: Stripe.Event;
	try {
		event = await constructStripeEvent(
			rawBody,
			signature,
			secret,
			deps.verifier,
		);
	} catch (_err) {
		logWebhook({
			eventId: null,
			eventType: null,
			userId: null,
			outcome: 'invalid_signature',
			status: 400,
		});
		return jsonResponse(400, { error: 'invalid_signature' });
	}

	let supabase: SupabaseAdminClient;
	try {
		supabase = deps.supabase ?? defaultSupabaseAdmin();
	} catch (_err) {
		logWebhook({
			eventId: event.id,
			eventType: event.type,
			userId: null,
			outcome: 'server_misconfigured',
			status: 500,
		});
		return jsonResponse(500, { error: 'server_misconfigured' });
	}

	try {
		return await dispatch(event, supabase);
	} catch (err) {
		logWebhook({
			eventId: event.id,
			eventType: event.type,
			userId: null,
			outcome: 'upsert_failed',
			status: 500,
			note: (err as Error).message,
		});
		// Return 500 so Stripe retries — the upsert is idempotent.
		return jsonResponse(500, { error: 'internal_error' });
	}
}

async function dispatch(
	event: Stripe.Event,
	supabase: SupabaseAdminClient,
): Promise<Response> {
	switch (event.type) {
		case 'customer.subscription.created':
		case 'customer.subscription.updated':
			return handleSubscriptionUpsert(event, supabase, { canceled: false });
		case 'customer.subscription.deleted':
			return handleSubscriptionUpsert(event, supabase, { canceled: true });
		case 'invoice.payment_failed':
			return handleInvoicePaymentFailed(event);
		default:
			logWebhook({
				eventId: event.id,
				eventType: event.type,
				userId: null,
				outcome: 'ignored_unknown_event',
				status: 200,
			});
			return jsonResponse(200, { received: true });
	}
}

async function handleSubscriptionUpsert(
	event: Stripe.Event,
	supabase: SupabaseAdminClient,
	options: { canceled: boolean },
): Promise<Response> {
	const subscription = event.data.object as Stripe.Subscription;
	const stripeCustomerId = asCustomerId(subscription.customer);

	const userId = await resolveUserId(subscription, supabase);
	if (!userId) {
		// Without a user_id we can't write anything sensible. Log and 200 —
		// returning non-2xx would just make Stripe retry forever.
		logWebhook({
			eventId: event.id,
			eventType: event.type,
			userId: null,
			outcome: 'missing_user_id',
			status: 200,
		});
		return jsonResponse(200, { received: true });
	}

	// Defend against out-of-order delivery: if the existing row was updated
	// AFTER `event.created`, the event is stale and we drop it.
	const eventCreatedMs = secondsToMs(event.created);
	const existing = await supabase.getSubscription(userId);
	if (existing && Date.parse(existing.updated_at) > eventCreatedMs) {
		logWebhook({
			eventId: event.id,
			eventType: event.type,
			userId,
			outcome: 'ignored_stale_event',
			status: 200,
		});
		return jsonResponse(200, { received: true });
	}

	const upsert: SubscriptionUpsert = options.canceled
		? {
				user_id: userId,
				stripe_customer_id: stripeCustomerId,
				stripe_subscription_id: subscription.id,
				tier: 'free',
				status: 'canceled',
				current_period_end: null,
			}
		: {
				user_id: userId,
				stripe_customer_id: stripeCustomerId,
				stripe_subscription_id: subscription.id,
				tier: 'premium',
				status: normaliseStatus(subscription.status),
				current_period_end: secondsToIso(extractCurrentPeriodEnd(subscription)),
			};

	await supabase.upsertSubscription(upsert);

	logWebhook({
		eventId: event.id,
		eventType: event.type,
		userId,
		outcome: 'ok',
		status: 200,
		resultingStatus: upsert.status,
		resultingTier: upsert.tier,
	});
	return jsonResponse(200, { received: true });
}

function handleInvoicePaymentFailed(event: Stripe.Event): Response {
	// We deliberately do NOT write the DB here. The follow-up
	// `customer.subscription.updated` carries the canonical status change
	// (typically `past_due`). Logging the failure is enough for ops visibility.
	// Cast through `unknown` to a permissive shape: Stripe's invoice payload
	// has reorganised `subscription_details` across API versions and we
	// only need user_id for logging, so we read defensively.
	const invoice = event.data.object as unknown as {
		metadata?: Record<string, string | undefined> | null;
		subscription_details?: {
			metadata?: Record<string, string | undefined> | null;
		} | null;
	};
	const userId =
		invoice.metadata?.user_id ||
		invoice.subscription_details?.metadata?.user_id ||
		null;
	logWebhook({
		eventId: event.id,
		eventType: event.type,
		userId,
		outcome: 'logged_payment_failure',
		status: 200,
	});
	return jsonResponse(200, { received: true });
}

/**
 * Resolve `user_id` for a subscription event. Stripe Checkout (ADA-260) sets
 * `metadata.user_id` on the subscription; we treat that as the source of
 * truth. Fall back to looking up the row by `stripe_customer_id` so the
 * handler still works on subscriptions that were created out-of-band (e.g.
 * via the Stripe dashboard during incident recovery).
 */
async function resolveUserId(
	subscription: Stripe.Subscription,
	supabase: SupabaseAdminClient,
): Promise<string | null> {
	const fromMetadata = subscription.metadata?.user_id;
	if (fromMetadata) return fromMetadata;

	const stripeCustomerId = asCustomerId(subscription.customer);
	const existing = await supabase.getSubscriptionByCustomerId(stripeCustomerId);
	return existing?.user_id ?? null;
}

/**
 * Stripe API 2025-06+ removed `current_period_end` from the top-level
 * subscription and moved it onto each subscription item. To stay forward-
 * compatible we check both shapes via an unknown cast: top-level first, then
 * fall back to `items.data[0].current_period_end`.
 */
function extractCurrentPeriodEnd(
	subscription: Stripe.Subscription,
): number | null {
	const sub = subscription as unknown as {
		current_period_end?: number | null;
		items?: {
			data?: Array<{ current_period_end?: number | null }>;
		} | null;
	};
	if (typeof sub.current_period_end === 'number') {
		return sub.current_period_end;
	}
	const first = sub.items?.data?.[0]?.current_period_end;
	return typeof first === 'number' ? first : null;
}

function asCustomerId(
	customer: string | Stripe.Customer | Stripe.DeletedCustomer,
): string {
	return typeof customer === 'string' ? customer : customer.id;
}

/**
 * Stripe's `subscription.status` is a superset of what the
 * `subscriptions_status_check` constraint accepts. Map anything unexpected
 * (`paused`, `incomplete_expired`) onto the closest legal value.
 */
function normaliseStatus(
	status: Stripe.Subscription.Status,
): SubscriptionUpsert['status'] {
	switch (status) {
		case 'active':
		case 'past_due':
		case 'canceled':
		case 'incomplete':
		case 'trialing':
		case 'unpaid':
			return status;
		case 'incomplete_expired':
			return 'canceled';
		case 'paused':
			return 'past_due';
		default:
			return 'incomplete';
	}
}

function secondsToIso(seconds: number | null | undefined): string | null {
	if (seconds == null) return null;
	return new Date(secondsToMs(seconds)).toISOString();
}

function secondsToMs(seconds: number): number {
	return seconds * 1000;
}

function jsonResponse(status: number, body: Record<string, unknown>): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

interface WebhookLogFields {
	eventId: string | null;
	eventType: string | null;
	userId: string | null;
	outcome: Outcome;
	status: number;
	resultingStatus?: SubscriptionUpsert['status'];
	resultingTier?: SubscriptionUpsert['tier'];
	note?: string;
}

/**
 * Structured log line. Explicitly scrubbed: no raw body, no signature, no PII.
 * TODO: replace with Sentry/Logflare once observability is wired.
 */
function logWebhook(fields: WebhookLogFields): void {
	const line = {
		ts: new Date().toISOString(),
		svc: 'hoursmith-stripe-webhook',
		event_id: fields.eventId,
		event_type: fields.eventType,
		user_id: fields.userId,
		outcome: fields.outcome,
		status: fields.status,
		...(fields.resultingStatus
			? { resulting_status: fields.resultingStatus }
			: {}),
		...(fields.resultingTier ? { resulting_tier: fields.resultingTier } : {}),
		...(fields.note ? { note: fields.note } : {}),
	};
	console.log(JSON.stringify(line));
}
