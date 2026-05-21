/**
 * Unit tests for the Stripe Checkout function.
 *
 * Linear: ADA-260.
 *
 * The Stripe SDK and Supabase admin client are both injected via
 * {@link CheckoutDeps}, so these tests run with zero network IO and no env
 * vars set on the host.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseAdminClient } from '../../_lib/supabaseAdmin';
import { handleCheckout } from '../index';

function makeRequest(
	opts: {
		method?: string;
		headers?: Record<string, string>;
		body?: unknown;
	} = {},
): Request {
	const headers = new Headers(opts.headers ?? {});
	if (opts.body !== undefined && !headers.has('content-type')) {
		headers.set('content-type', 'application/json');
	}
	return new Request('https://hoursmith.io/api/checkout', {
		method: opts.method ?? 'POST',
		headers,
		body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
	});
}

function makeSupabase(
	overrides: Partial<SupabaseAdminClient> = {},
): SupabaseAdminClient {
	return {
		getUserIdFromToken: vi.fn().mockResolvedValue('user-123'),
		getProfile: vi
			.fn()
			.mockResolvedValue({
				id: 'u1',
				email: 'user@example.com',
				created_at: '2026-01-01',
			}),
		getSubscription: vi.fn().mockResolvedValue(null),
		insertIncompleteSubscription: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

interface FakeStripe {
	customers: { create: ReturnType<typeof vi.fn> };
	checkout: { sessions: { create: ReturnType<typeof vi.fn> } };
}

function makeStripe(overrides: Partial<FakeStripe> = {}): FakeStripe {
	return {
		customers: {
			create: vi.fn().mockResolvedValue({ id: 'cus_new_123' }),
			...overrides.customers,
		},
		checkout: {
			sessions: {
				create: vi.fn().mockResolvedValue({
					id: 'cs_test_1',
					url: 'https://checkout.stripe.com/test',
				}),
				...overrides.checkout?.sessions,
			},
		},
	};
}

const ENV = {
	STRIPE_PRODUCT_PREMIUM: 'prod_premium_123',
	APP_URL: 'https://hoursmith.io',
};

describe('handleCheckout', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 405 for non-POST methods', async () => {
		const res = await handleCheckout(makeRequest({ method: 'GET' }), {
			supabase: makeSupabase(),
			// biome-ignore lint/suspicious/noExplicitAny: fake stripe shape
			stripe: makeStripe() as any,
			env: ENV,
		});
		expect(res.status).toBe(405);
	});

	it('returns 401 when Authorization header is missing', async () => {
		const res = await handleCheckout(makeRequest({ body: { amount: 1000 } }), {
			supabase: makeSupabase(),
			// biome-ignore lint/suspicious/noExplicitAny: fake stripe shape
			stripe: makeStripe() as any,
			env: ENV,
		});
		expect(res.status).toBe(401);
		expect(await res.json()).toEqual({ error: 'missing_token' });
	});

	it('returns 401 when Supabase rejects the JWT', async () => {
		const supabase = makeSupabase({
			getUserIdFromToken: vi.fn().mockResolvedValue(null),
		});
		const res = await handleCheckout(
			makeRequest({
				headers: { authorization: 'Bearer bad' },
				body: { amount: 1000 },
			}),
			{
				supabase,
				// biome-ignore lint/suspicious/noExplicitAny: fake stripe shape
				stripe: makeStripe() as any,
				env: ENV,
			},
		);
		expect(res.status).toBe(401);
		expect(await res.json()).toEqual({ error: 'invalid_token' });
	});

	it('returns 400 when amount is missing or non-numeric', async () => {
		for (const body of [{}, { amount: 'ten' }, { amount: 10.5 }, null]) {
			const res = await handleCheckout(
				makeRequest({
					headers: { authorization: 'Bearer good' },
					body: body ?? undefined,
				}),
				{
					supabase: makeSupabase(),
					// biome-ignore lint/suspicious/noExplicitAny: fake stripe shape
					stripe: makeStripe() as any,
					env: ENV,
				},
			);
			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({ error: 'invalid_amount' });
		}
	});

	it('returns 400 amount_below_floor when amount is 299 cents (just under €3)', async () => {
		const res = await handleCheckout(
			makeRequest({
				headers: { authorization: 'Bearer good' },
				body: { amount: 299 },
			}),
			{
				supabase: makeSupabase(),
				// biome-ignore lint/suspicious/noExplicitAny: fake stripe shape
				stripe: makeStripe() as any,
				env: ENV,
			},
		);
		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: 'amount_below_floor' });
	});

	it('accepts the floor edge case (300 cents = €3)', async () => {
		const stripe = makeStripe();
		const res = await handleCheckout(
			makeRequest({
				headers: { authorization: 'Bearer good' },
				body: { amount: 300 },
			}),
			{
				supabase: makeSupabase(),
				// biome-ignore lint/suspicious/noExplicitAny: fake stripe shape
				stripe: stripe as any,
				env: ENV,
			},
		);
		expect(res.status).toBe(200);
		expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
			expect.objectContaining({
				line_items: [
					{
						price_data: {
							currency: 'eur',
							product: 'prod_premium_123',
							unit_amount: 300,
							recurring: { interval: 'year' },
						},
						quantity: 1,
					},
				],
			}),
		);
	});

	it('returns 400 amount_too_high when amount exceeds €1,000 cap', async () => {
		const res = await handleCheckout(
			makeRequest({
				headers: { authorization: 'Bearer good' },
				body: { amount: 100_001 },
			}),
			{
				supabase: makeSupabase(),
				// biome-ignore lint/suspicious/noExplicitAny: fake stripe shape
				stripe: makeStripe() as any,
				env: ENV,
			},
		);
		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: 'amount_too_high' });
	});

	it('returns 500 when STRIPE_PRODUCT_PREMIUM is missing', async () => {
		const res = await handleCheckout(
			makeRequest({
				headers: { authorization: 'Bearer good' },
				body: { amount: 1000 },
			}),
			{
				supabase: makeSupabase(),
				// biome-ignore lint/suspicious/noExplicitAny: fake stripe shape
				stripe: makeStripe() as any,
				env: { APP_URL: 'https://hoursmith.io' },
			},
		);
		expect(res.status).toBe(500);
		expect(await res.json()).toEqual({ error: 'server_misconfigured' });
	});

	it('returns 500 when APP_URL is missing', async () => {
		const res = await handleCheckout(
			makeRequest({
				headers: { authorization: 'Bearer good' },
				body: { amount: 1000 },
			}),
			{
				supabase: makeSupabase(),
				// biome-ignore lint/suspicious/noExplicitAny: fake stripe shape
				stripe: makeStripe() as any,
				env: { ...ENV, APP_URL: undefined },
			},
		);
		expect(res.status).toBe(500);
	});

	it('creates a Stripe customer and stub subscriptions row on first-time checkout at €10', async () => {
		const supabase = makeSupabase({
			getSubscription: vi.fn().mockResolvedValue(null),
			getProfile: vi
				.fn()
				.mockResolvedValue({
					id: 'u1',
					email: 'user@example.com',
					created_at: '2026-01-01',
				}),
		});
		const stripe = makeStripe();
		const res = await handleCheckout(
			makeRequest({
				headers: { authorization: 'Bearer good' },
				body: { amount: 1000 },
			}),
			{
				supabase,
				// biome-ignore lint/suspicious/noExplicitAny: fake stripe shape
				stripe: stripe as any,
				env: ENV,
			},
		);
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			url: 'https://checkout.stripe.com/test',
		});
		expect(stripe.customers.create).toHaveBeenCalledWith({
			email: 'user@example.com',
			metadata: { user_id: 'user-123' },
		});
		expect(supabase.insertIncompleteSubscription).toHaveBeenCalledWith({
			userId: 'user-123',
			stripeCustomerId: 'cus_new_123',
		});
		expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
			expect.objectContaining({
				mode: 'subscription',
				customer: 'cus_new_123',
				line_items: [
					{
						price_data: {
							currency: 'eur',
							product: 'prod_premium_123',
							unit_amount: 1000,
							recurring: { interval: 'year' },
						},
						quantity: 1,
					},
				],
				subscription_data: {
					metadata: { user_id: 'user-123', chosen_amount_cents: '1000' },
				},
				success_url: 'https://hoursmith.io/account?upgrade=success',
				cancel_url: 'https://hoursmith.io/account?upgrade=cancel',
				automatic_tax: { enabled: true },
				tax_id_collection: { enabled: true },
			}),
		);
	});

	it('reuses the existing Stripe customer and does not duplicate the subscriptions row', async () => {
		const supabase = makeSupabase({
			getSubscription: vi.fn().mockResolvedValue({
				user_id: 'user-123',
				stripe_customer_id: 'cus_existing_999',
				stripe_subscription_id: null,
			}),
		});
		const stripe = makeStripe();
		const res = await handleCheckout(
			makeRequest({
				headers: { authorization: 'Bearer good' },
				body: { amount: 3000 },
			}),
			{
				supabase,
				// biome-ignore lint/suspicious/noExplicitAny: fake stripe shape
				stripe: stripe as any,
				env: ENV,
			},
		);
		expect(res.status).toBe(200);
		expect(stripe.customers.create).not.toHaveBeenCalled();
		expect(supabase.insertIncompleteSubscription).not.toHaveBeenCalled();
		expect(supabase.getProfile).not.toHaveBeenCalled();
		expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
			expect.objectContaining({
				customer: 'cus_existing_999',
				line_items: [
					{
						price_data: {
							currency: 'eur',
							product: 'prod_premium_123',
							unit_amount: 3000,
							recurring: { interval: 'year' },
						},
						quantity: 1,
					},
				],
			}),
		);
	});

	it('returns 502 when Stripe session creation throws', async () => {
		const stripe = makeStripe({
			checkout: {
				sessions: {
					create: vi.fn().mockRejectedValue(new Error('stripe down')),
				},
			},
		});
		const res = await handleCheckout(
			makeRequest({
				headers: { authorization: 'Bearer good' },
				body: { amount: 1000 },
			}),
			{
				supabase: makeSupabase({
					getSubscription: vi.fn().mockResolvedValue({
						user_id: 'user-123',
						stripe_customer_id: 'cus_existing_999',
						stripe_subscription_id: null,
					}),
				}),
				// biome-ignore lint/suspicious/noExplicitAny: fake stripe shape
				stripe: stripe as any,
				env: ENV,
			},
		);
		expect(res.status).toBe(502);
		expect(await res.json()).toEqual({ error: 'stripe_session_failed' });
	});

	it('returns 502 when customer provisioning fails', async () => {
		const supabase = makeSupabase({
			getSubscription: vi.fn().mockResolvedValue(null),
			insertIncompleteSubscription: vi
				.fn()
				.mockRejectedValue(new Error('db down')),
		});
		const res = await handleCheckout(
			makeRequest({
				headers: { authorization: 'Bearer good' },
				body: { amount: 1000 },
			}),
			{
				supabase,
				// biome-ignore lint/suspicious/noExplicitAny: fake stripe shape
				stripe: makeStripe() as any,
				env: ENV,
			},
		);
		expect(res.status).toBe(502);
		expect(await res.json()).toEqual({
			error: 'customer_provisioning_failed',
		});
	});
});
