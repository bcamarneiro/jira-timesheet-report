/**
 * Unit tests for the Polar Checkout function.
 *
 * Linear: ADA-294 (migrated from Stripe ADA-260).
 *
 * The Polar checkout creator and Supabase admin client are injected via
 * {@link CheckoutDeps}, so these tests run with zero network IO and no env.
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

function makeSupabase(userId: string | null = 'user-123'): SupabaseAdminClient {
	return {
		getUserIdFromToken: vi.fn().mockResolvedValue(userId),
	} as unknown as SupabaseAdminClient;
}

function makeCreateCheckout() {
	return vi
		.fn()
		.mockResolvedValue({ url: 'https://polar.sh/checkout/co_1', id: 'co_1' });
}

const ENV = {
	POLAR_PRODUCT_HOSTED: 'prod_hosted',
	POLAR_PRODUCT_LEAD: 'prod_lead',
	APP_URL: 'https://hoursmith.io',
};

const AUTH = { authorization: 'Bearer good' };

describe('handleCheckout (Polar)', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns 405 for non-POST methods', async () => {
		const res = await handleCheckout(makeRequest({ method: 'GET' }), {
			supabase: makeSupabase(),
			createCheckout: makeCreateCheckout(),
			env: ENV,
		});
		expect(res.status).toBe(405);
	});

	it('returns 401 when Authorization header is missing', async () => {
		const res = await handleCheckout(
			makeRequest({ body: { tier: 'hosted' } }),
			{
				supabase: makeSupabase(),
				createCheckout: makeCreateCheckout(),
				env: ENV,
			},
		);
		expect(res.status).toBe(401);
		expect(await res.json()).toEqual({ error: 'missing_token' });
	});

	it('returns 401 when Supabase rejects the JWT', async () => {
		const res = await handleCheckout(
			makeRequest({ headers: AUTH, body: { tier: 'hosted' } }),
			{
				supabase: makeSupabase(null),
				createCheckout: makeCreateCheckout(),
				env: ENV,
			},
		);
		expect(res.status).toBe(401);
		expect(await res.json()).toEqual({ error: 'invalid_token' });
	});

	it('returns 400 invalid_tier for missing or unknown tiers', async () => {
		for (const body of [{}, { tier: 'gold' }, { tier: 123 }, null]) {
			const res = await handleCheckout(
				makeRequest({ headers: AUTH, body: body ?? undefined }),
				{
					supabase: makeSupabase(),
					createCheckout: makeCreateCheckout(),
					env: ENV,
				},
			);
			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({ error: 'invalid_tier' });
		}
	});

	it('returns 500 when the tier product env is missing', async () => {
		const res = await handleCheckout(
			makeRequest({ headers: AUTH, body: { tier: 'lead' } }),
			{
				supabase: makeSupabase(),
				createCheckout: makeCreateCheckout(),
				env: {
					POLAR_PRODUCT_HOSTED: 'prod_hosted',
					APP_URL: 'https://hoursmith.io',
				},
			},
		);
		expect(res.status).toBe(500);
		expect(await res.json()).toEqual({ error: 'server_misconfigured' });
	});

	it('returns 500 when APP_URL is missing', async () => {
		const res = await handleCheckout(
			makeRequest({ headers: AUTH, body: { tier: 'hosted' } }),
			{
				supabase: makeSupabase(),
				createCheckout: makeCreateCheckout(),
				env: { ...ENV, APP_URL: undefined },
			},
		);
		expect(res.status).toBe(500);
	});

	it('creates a Polar checkout for the hosted tier and returns the url', async () => {
		const createCheckout = makeCreateCheckout();
		const res = await handleCheckout(
			makeRequest({ headers: AUTH, body: { tier: 'hosted' } }),
			{ supabase: makeSupabase(), createCheckout, env: ENV },
		);
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ url: 'https://polar.sh/checkout/co_1' });
		expect(createCheckout).toHaveBeenCalledWith({
			productId: 'prod_hosted',
			customerExternalId: 'user-123',
			successUrl: 'https://hoursmith.io/account?upgrade=success',
		});
	});

	it('uses the lead product id for the lead tier', async () => {
		const createCheckout = makeCreateCheckout();
		await handleCheckout(
			makeRequest({ headers: AUTH, body: { tier: 'lead' } }),
			{
				supabase: makeSupabase(),
				createCheckout,
				env: ENV,
			},
		);
		expect(createCheckout).toHaveBeenCalledWith(
			expect.objectContaining({ productId: 'prod_lead' }),
		);
	});

	it('returns 502 when the Polar checkout call throws', async () => {
		const createCheckout = vi.fn().mockRejectedValue(new Error('polar down'));
		const res = await handleCheckout(
			makeRequest({ headers: AUTH, body: { tier: 'hosted' } }),
			{ supabase: makeSupabase(), createCheckout, env: ENV },
		);
		expect(res.status).toBe(502);
		expect(await res.json()).toEqual({ error: 'polar_session_failed' });
	});
});
