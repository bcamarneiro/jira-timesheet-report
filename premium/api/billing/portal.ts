/**
 * Stripe Customer Portal link for Hoursmith Premium.
 *
 * `POST /api/billing/portal` returns `{ url }` pointing at a fresh Stripe
 * Customer Portal session for the calling user. The frontend redirects there
 * (ADA-257 wires the /account button).
 *
 * Auth model:
 *   We only require a valid Supabase JWT — NOT an active subscription. Users
 *   with `past_due` / `canceled` rows still need to manage billing (update a
 *   card, resubscribe, download a final invoice).
 *
 * Failure modes:
 *   - missing/invalid JWT      → 401
 *   - no `subscriptions` row   → 404 `no_billing_history`
 *   - Stripe call fails        → 502 `stripe_portal_failed`
 *   - missing env              → 500 `server_misconfigured`
 *
 * Logging discipline:
 *   DO log:    timestamp, user_id, stripe customer_id (not PII), outcome.
 *   DO NOT log: the session URL, tokens, Authorization headers.
 *
 * Linear: ADA-262.
 */

import type Stripe from 'stripe';
import { defaultStripe } from '../_lib/stripeClient.js';
import {
	defaultSupabaseAdmin,
	type SupabaseAdminClient,
} from '../_lib/supabaseAdmin.js';

// Stripe SDK is a Node-only package; portal sessions must run on the Node runtime.
export const config = {
	runtime: 'nodejs',
	regions: ['fra1'],
};

export interface PortalDeps {
	supabase?: SupabaseAdminClient;
	stripe?: Pick<Stripe, 'billingPortal'>;
	env?: Partial<Record<string, string | undefined>>;
}

export default async function handler(request: Request): Promise<Response> {
	return handlePortal(request);
}

export async function handlePortal(
	request: Request,
	deps: PortalDeps = {},
): Promise<Response> {
	const start = Date.now();
	const env = deps.env ?? process.env;

	if (request.method !== 'POST') {
		return jsonResponse(405, { error: 'method_not_allowed' });
	}

	const token = extractBearer(request.headers.get('authorization'));
	if (!token) {
		logPortal({
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
		supabase = deps.supabase ?? defaultSupabaseAdmin();
	} catch (err) {
		logPortal({
			userId: null,
			customerId: null,
			code: 'server_misconfigured',
			status: 500,
			durationMs: Date.now() - start,
			detail: (err as Error).message,
		});
		return jsonResponse(500, { error: 'server_misconfigured' });
	}

	const userId = await supabase.getUserIdFromToken(token);
	if (!userId) {
		logPortal({
			userId: null,
			customerId: null,
			code: 'invalid_token',
			status: 401,
			durationMs: Date.now() - start,
		});
		return jsonResponse(401, { error: 'invalid_token' });
	}

	const appUrl = env.APP_URL;
	if (!appUrl) {
		logPortal({
			userId,
			customerId: null,
			code: 'server_misconfigured',
			status: 500,
			durationMs: Date.now() - start,
		});
		return jsonResponse(500, { error: 'server_misconfigured' });
	}

	let subscription: Awaited<ReturnType<SupabaseAdminClient['getSubscription']>>;
	try {
		subscription = await supabase.getSubscription(userId);
	} catch (err) {
		logPortal({
			userId,
			customerId: null,
			code: 'subscription_read_failed',
			status: 500,
			durationMs: Date.now() - start,
			detail: (err as Error).message,
		});
		return jsonResponse(500, { error: 'subscription_read_failed' });
	}

	const customerId = subscription?.stripe_customer_id;
	if (!customerId) {
		logPortal({
			userId,
			customerId: null,
			code: 'no_billing_history',
			status: 404,
			durationMs: Date.now() - start,
		});
		return jsonResponse(404, { error: 'no_billing_history' });
	}

	let stripe: Pick<Stripe, 'billingPortal'>;
	try {
		stripe = deps.stripe ?? (defaultStripe() as unknown as Stripe);
	} catch (err) {
		logPortal({
			userId,
			customerId,
			code: 'server_misconfigured',
			status: 500,
			durationMs: Date.now() - start,
			detail: (err as Error).message,
		});
		return jsonResponse(500, { error: 'server_misconfigured' });
	}

	let session: { url: string | null };
	try {
		session = await stripe.billingPortal.sessions.create({
			customer: customerId,
			return_url: `${appUrl.replace(/\/+$/, '')}/account`,
		});
	} catch (err) {
		logPortal({
			userId,
			customerId,
			code: 'stripe_portal_failed',
			status: 502,
			durationMs: Date.now() - start,
			detail: (err as Error).message,
		});
		return jsonResponse(502, { error: 'stripe_portal_failed' });
	}

	if (!session.url) {
		logPortal({
			userId,
			customerId,
			code: 'stripe_portal_missing_url',
			status: 502,
			durationMs: Date.now() - start,
		});
		return jsonResponse(502, { error: 'stripe_portal_failed' });
	}

	logPortal({
		userId,
		customerId,
		code: 'ok',
		status: 200,
		durationMs: Date.now() - start,
	});
	return jsonResponse(200, { url: session.url });
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

interface PortalLogFields {
	userId: string | null;
	customerId: string | null;
	code: string;
	status: number;
	durationMs: number;
	detail?: string;
}

/**
 * Structured log line. Explicitly scrubbed: no headers, no body, no session URL.
 * `stripe_customer_id` is intentionally logged per Stripe's own guidance (not PII).
 */
function logPortal(fields: PortalLogFields): void {
	const line = {
		ts: new Date().toISOString(),
		svc: 'hoursmith-billing-portal',
		user_id: fields.userId,
		stripe_customer_id: fields.customerId,
		code: fields.code,
		status: fields.status,
		duration_ms: fields.durationMs,
		...(fields.detail ? { detail: fields.detail } : {}),
	};
	console.log(JSON.stringify(line));
}
