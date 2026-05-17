/**
 * Unit tests for `POST /api/billing/portal`.
 *
 * Linear: ADA-262.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseAdminClient } from '../../_lib/supabaseAdmin';
import { handlePortal } from '../portal';

function makeRequest(
	opts: { method?: string; headers?: Record<string, string> } = {},
): Request {
	return new Request('https://hoursmith.io/api/billing/portal', {
		method: opts.method ?? 'POST',
		headers: opts.headers ?? {},
	});
}

const SUBSCRIPTION = {
	user_id: 'user-123',
	stripe_customer_id: 'cus_abc',
	stripe_subscription_id: 'sub_abc',
	tier: 'premium',
	status: 'active',
	current_period_end: '2026-12-01T00:00:00Z',
};

function makeSupabase(
	overrides: Partial<SupabaseAdminClient> = {},
): SupabaseAdminClient {
	return {
		getUserIdFromToken: vi.fn().mockResolvedValue('user-123'),
		getSubscription: vi.fn().mockResolvedValue(SUBSCRIPTION),
		// unused but required by the interface — left as throwing fns so a test
		// accidentally touching them fails loudly.
		getProfile: vi.fn(),
		getSubscriptionByCustomerId: vi.fn(),
		insertIncompleteSubscription: vi.fn(),
		upsertSubscription: vi.fn(),
		deleteSubscription: vi.fn(),
		deleteProfile: vi.fn(),
		deleteAuthUser: vi.fn(),
		insertAuditLog: vi.fn(),
		...overrides,
	};
}

function makeStripe(
	createImpl: (args: {
		customer: string;
		return_url: string;
	}) => Promise<{ url: string | null }> = async () => ({
		url: 'https://billing.stripe.com/p/session/test',
	}),
) {
	return {
		billingPortal: {
			sessions: {
				create: vi.fn(createImpl),
			},
			// biome-ignore lint/suspicious/noExplicitAny: rest of the API is unused
		} as any,
	};
}

const ENV = { APP_URL: 'https://hoursmith.io' };

describe('handlePortal', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 405 for non-POST methods', async () => {
		const res = await handlePortal(makeRequest({ method: 'GET' }), {
			supabase: makeSupabase(),
			stripe: makeStripe(),
			env: ENV,
		});
		expect(res.status).toBe(405);
	});

	it('returns 401 when Authorization is missing', async () => {
		const res = await handlePortal(makeRequest(), {
			supabase: makeSupabase(),
			stripe: makeStripe(),
			env: ENV,
		});
		expect(res.status).toBe(401);
		expect(await res.json()).toEqual({ error: 'missing_token' });
	});

	it('returns 401 when JWT is invalid', async () => {
		const supabase = makeSupabase({
			getUserIdFromToken: vi.fn().mockResolvedValue(null),
		});
		const res = await handlePortal(
			makeRequest({ headers: { authorization: 'Bearer bad' } }),
			{ supabase, stripe: makeStripe(), env: ENV },
		);
		expect(res.status).toBe(401);
		expect(await res.json()).toEqual({ error: 'invalid_token' });
	});

	it('returns 404 when the user has no subscription row', async () => {
		const supabase = makeSupabase({
			getSubscription: vi.fn().mockResolvedValue(null),
		});
		const stripe = makeStripe();
		const res = await handlePortal(
			makeRequest({ headers: { authorization: 'Bearer ok' } }),
			{ supabase, stripe, env: ENV },
		);
		expect(res.status).toBe(404);
		expect(await res.json()).toEqual({ error: 'no_billing_history' });
		expect(stripe.billingPortal.sessions.create).not.toHaveBeenCalled();
	});

	it('returns the portal session URL on success and never logs it', async () => {
		const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
		const stripe = makeStripe();
		const res = await handlePortal(
			makeRequest({ headers: { authorization: 'Bearer ok' } }),
			{ supabase: makeSupabase(), stripe, env: ENV },
		);
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			url: 'https://billing.stripe.com/p/session/test',
		});
		expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
			customer: 'cus_abc',
			return_url: 'https://hoursmith.io/account',
		});
		const allLogs = consoleLog.mock.calls.map((c) => String(c[0])).join('\n');
		expect(allLogs).not.toContain('billing.stripe.com');
		expect(allLogs).toContain('cus_abc'); // customer id is allowed in logs
		consoleLog.mockRestore();
	});

	it('returns 502 when Stripe throws', async () => {
		const stripe = makeStripe(async () => {
			throw new Error('stripe_down');
		});
		const res = await handlePortal(
			makeRequest({ headers: { authorization: 'Bearer ok' } }),
			{ supabase: makeSupabase(), stripe, env: ENV },
		);
		expect(res.status).toBe(502);
		expect(await res.json()).toEqual({ error: 'stripe_portal_failed' });
	});

	it('returns 500 when APP_URL env var is missing', async () => {
		const res = await handlePortal(
			makeRequest({ headers: { authorization: 'Bearer ok' } }),
			{ supabase: makeSupabase(), stripe: makeStripe(), env: {} },
		);
		expect(res.status).toBe(500);
		expect(await res.json()).toEqual({ error: 'server_misconfigured' });
	});
});
