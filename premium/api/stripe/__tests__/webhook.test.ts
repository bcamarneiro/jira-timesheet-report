/**
 * Unit tests for the Stripe webhook handler.
 *
 * Linear: ADA-261.
 *
 * The handler is exercised through {@link handleWebhook}, which accepts
 * dependency overrides for the Stripe verifier and the Supabase admin
 * client. That keeps the tests pure: no network, no SDK boot, no real
 * Stripe HMAC. Type-only `Stripe.Event` casts let us assemble realistic
 * payloads without importing the SDK at runtime.
 */

import type Stripe from 'stripe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
	SubscriptionRow,
	SubscriptionUpsert,
	SupabaseAdminClient,
} from '../../_lib/supabaseAdmin';
import { handleWebhook } from '../webhook';

const SECRET = 'whsec_test';

function makeSupabase(
	overrides: Partial<SupabaseAdminClient> = {},
): SupabaseAdminClient & {
	upsertSubscription: ReturnType<typeof vi.fn>;
	getSubscription: ReturnType<typeof vi.fn>;
	getSubscriptionByCustomerId: ReturnType<typeof vi.fn>;
} {
	return {
		getSubscriptionByCustomerId: vi.fn().mockResolvedValue(null),
		getSubscription: vi.fn().mockResolvedValue(null),
		upsertSubscription: vi.fn().mockResolvedValue(undefined),
		...overrides,
	} as SupabaseAdminClient & {
		upsertSubscription: ReturnType<typeof vi.fn>;
		getSubscription: ReturnType<typeof vi.fn>;
		getSubscriptionByCustomerId: ReturnType<typeof vi.fn>;
	};
}

function makeRequest(
	body: string,
	headers: Record<string, string> = {},
): Request {
	return new Request('https://hoursmith.io/api/stripe/webhook', {
		method: 'POST',
		headers: { 'content-type': 'application/json', ...headers },
		body,
	});
}

function makeSubscriptionEvent(params: {
	id?: string;
	type:
		| 'customer.subscription.created'
		| 'customer.subscription.updated'
		| 'customer.subscription.deleted';
	subscriptionId?: string;
	customerId?: string;
	userId?: string | null;
	status?: Stripe.Subscription.Status;
	currentPeriodEnd?: number;
	createdSeconds?: number;
}): Stripe.Event {
	const subscription = {
		id: params.subscriptionId ?? 'sub_123',
		customer: params.customerId ?? 'cus_123',
		status: params.status ?? 'active',
		current_period_end:
			params.currentPeriodEnd ?? Math.floor(Date.UTC(2026, 5, 17) / 1000),
		metadata:
			params.userId === null ? {} : { user_id: params.userId ?? 'user-123' },
	} as unknown as Stripe.Subscription;

	return {
		id: params.id ?? 'evt_123',
		type: params.type,
		created: params.createdSeconds ?? Math.floor(Date.now() / 1000),
		data: { object: subscription },
	} as unknown as Stripe.Event;
}

describe('Stripe webhook handler', () => {
	beforeEach(() => {
		process.env.STRIPE_WEBHOOK_SECRET = SECRET;
		vi.spyOn(console, 'log').mockImplementation(() => undefined);
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('returns 400 when the Stripe-Signature header is missing', async () => {
		const supabase = makeSupabase();
		const res = await handleWebhook(makeRequest('{}'), {
			supabase,
			verifier: vi.fn(),
		});
		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: 'invalid_signature' });
		expect(supabase.upsertSubscription).not.toHaveBeenCalled();
	});

	it('returns 400 when the signature does not verify', async () => {
		const supabase = makeSupabase();
		const verifier = vi.fn(() => {
			throw new Error('No signatures found matching the expected signature');
		});
		const res = await handleWebhook(
			makeRequest('{"any":"body"}', { 'stripe-signature': 'bad' }),
			{ supabase, verifier },
		);
		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: 'invalid_signature' });
		expect(verifier).toHaveBeenCalledWith('{"any":"body"}', 'bad', SECRET);
		expect(supabase.upsertSubscription).not.toHaveBeenCalled();
	});

	it('upserts a premium row on customer.subscription.created', async () => {
		const event = makeSubscriptionEvent({
			type: 'customer.subscription.created',
			subscriptionId: 'sub_abc',
			customerId: 'cus_abc',
			userId: 'user-1',
			status: 'active',
			currentPeriodEnd: 1_800_000_000,
		});
		const supabase = makeSupabase();
		const res = await handleWebhook(
			makeRequest('raw', { 'stripe-signature': 'good' }),
			{ supabase, verifier: () => event },
		);
		expect(res.status).toBe(200);
		expect(supabase.upsertSubscription).toHaveBeenCalledTimes(1);
		const row = supabase.upsertSubscription.mock
			.calls[0][0] as SubscriptionUpsert;
		expect(row).toEqual({
			user_id: 'user-1',
			stripe_customer_id: 'cus_abc',
			stripe_subscription_id: 'sub_abc',
			tier: 'premium',
			status: 'active',
			current_period_end: new Date(1_800_000_000 * 1000).toISOString(),
		});
	});

	it('reflects past_due status on customer.subscription.updated', async () => {
		const event = makeSubscriptionEvent({
			type: 'customer.subscription.updated',
			status: 'past_due',
		});
		const supabase = makeSupabase();
		const res = await handleWebhook(
			makeRequest('raw', { 'stripe-signature': 'good' }),
			{ supabase, verifier: () => event },
		);
		expect(res.status).toBe(200);
		const row = supabase.upsertSubscription.mock
			.calls[0][0] as SubscriptionUpsert;
		expect(row.status).toBe('past_due');
		expect(row.tier).toBe('premium');
	});

	it('marks the row canceled and reverts tier on customer.subscription.deleted', async () => {
		const event = makeSubscriptionEvent({
			type: 'customer.subscription.deleted',
			status: 'canceled',
		});
		const supabase = makeSupabase();
		const res = await handleWebhook(
			makeRequest('raw', { 'stripe-signature': 'good' }),
			{ supabase, verifier: () => event },
		);
		expect(res.status).toBe(200);
		const row = supabase.upsertSubscription.mock
			.calls[0][0] as SubscriptionUpsert;
		expect(row.status).toBe('canceled');
		expect(row.tier).toBe('free');
		expect(row.current_period_end).toBeNull();
	});

	it('falls back to customer-id lookup when metadata.user_id is missing', async () => {
		const event = makeSubscriptionEvent({
			type: 'customer.subscription.updated',
			userId: null,
			customerId: 'cus_lookup',
		});
		const supabase = makeSupabase({
			getSubscriptionByCustomerId: vi.fn().mockResolvedValue({
				user_id: 'user-from-db',
				stripe_customer_id: 'cus_lookup',
				stripe_subscription_id: 'sub_123',
				tier: 'premium',
				status: 'active',
				current_period_end: null,
				updated_at: '1970-01-01T00:00:00.000Z',
			} satisfies SubscriptionRow),
		});
		const res = await handleWebhook(
			makeRequest('raw', { 'stripe-signature': 'good' }),
			{ supabase, verifier: () => event },
		);
		expect(res.status).toBe(200);
		expect(supabase.getSubscriptionByCustomerId).toHaveBeenCalledWith(
			'cus_lookup',
		);
		const row = supabase.upsertSubscription.mock
			.calls[0][0] as SubscriptionUpsert;
		expect(row.user_id).toBe('user-from-db');
	});

	it('logs invoice.payment_failed but does not write the DB', async () => {
		const event = {
			id: 'evt_inv',
			type: 'invoice.payment_failed',
			created: Math.floor(Date.now() / 1000),
			data: {
				object: {
					metadata: { user_id: 'user-9' },
				},
			},
		} as unknown as Stripe.Event;
		const supabase = makeSupabase();
		const res = await handleWebhook(
			makeRequest('raw', { 'stripe-signature': 'good' }),
			{ supabase, verifier: () => event },
		);
		expect(res.status).toBe(200);
		expect(supabase.upsertSubscription).not.toHaveBeenCalled();
	});

	it('returns 200 with no DB write for unknown event types', async () => {
		const event = {
			id: 'evt_unknown',
			type: 'charge.refunded',
			created: Math.floor(Date.now() / 1000),
			data: { object: {} },
		} as unknown as Stripe.Event;
		const supabase = makeSupabase();
		const res = await handleWebhook(
			makeRequest('raw', { 'stripe-signature': 'good' }),
			{ supabase, verifier: () => event },
		);
		expect(res.status).toBe(200);
		expect(supabase.upsertSubscription).not.toHaveBeenCalled();
	});

	it('idempotency: same event delivered twice still succeeds (upsert is the contract)', async () => {
		const event = makeSubscriptionEvent({
			type: 'customer.subscription.created',
		});
		const supabase = makeSupabase();
		const verifier = () => event;
		const res1 = await handleWebhook(
			makeRequest('raw', { 'stripe-signature': 'good' }),
			{ supabase, verifier },
		);
		const res2 = await handleWebhook(
			makeRequest('raw', { 'stripe-signature': 'good' }),
			{ supabase, verifier },
		);
		expect(res1.status).toBe(200);
		expect(res2.status).toBe(200);
		// Both calls upsert with identical payloads — the DB constraint
		// (PK on user_id) is what makes this safe in production.
		expect(supabase.upsertSubscription).toHaveBeenCalledTimes(2);
		const firstRow = supabase.upsertSubscription.mock.calls[0][0];
		const secondRow = supabase.upsertSubscription.mock.calls[1][0];
		expect(secondRow).toEqual(firstRow);
	});

	it('skips out-of-order events (existing row newer than event.created)', async () => {
		const event = makeSubscriptionEvent({
			type: 'customer.subscription.updated',
			status: 'past_due',
			createdSeconds: Math.floor(Date.UTC(2026, 0, 1) / 1000),
		});
		const supabase = makeSupabase({
			getSubscription: vi.fn().mockResolvedValue({
				user_id: 'user-123',
				stripe_customer_id: 'cus_123',
				stripe_subscription_id: 'sub_123',
				tier: 'premium',
				status: 'active',
				current_period_end: null,
				// Existing row was updated AFTER event.created — event is stale.
				updated_at: new Date(Date.UTC(2026, 5, 1)).toISOString(),
			} satisfies SubscriptionRow),
		});
		const res = await handleWebhook(
			makeRequest('raw', { 'stripe-signature': 'good' }),
			{ supabase, verifier: () => event },
		);
		expect(res.status).toBe(200);
		expect(supabase.upsertSubscription).not.toHaveBeenCalled();
	});

	it('returns 500 when STRIPE_WEBHOOK_SECRET is not configured', async () => {
		delete process.env.STRIPE_WEBHOOK_SECRET;
		const supabase = makeSupabase();
		const res = await handleWebhook(
			makeRequest('raw', { 'stripe-signature': 'good' }),
			{ supabase, verifier: vi.fn() },
		);
		expect(res.status).toBe(500);
		expect(supabase.upsertSubscription).not.toHaveBeenCalled();
	});

	it('returns 405 for non-POST requests', async () => {
		const req = new Request('https://hoursmith.io/api/stripe/webhook', {
			method: 'GET',
		});
		const res = await handleWebhook(req, {
			supabase: makeSupabase(),
			verifier: vi.fn(),
		});
		expect(res.status).toBe(405);
	});
});
