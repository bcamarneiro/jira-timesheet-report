/**
 * Unit tests for `POST /api/billing/portal` (Polar customer portal).
 *
 * Linear: ADA-294 (migrated from Stripe ADA-262).
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
	updated_at: '2026-05-01T00:00:00Z',
};

function makeSupabase(
	overrides: Partial<SupabaseAdminClient> = {},
): SupabaseAdminClient {
	return {
		getUserIdFromToken: vi.fn().mockResolvedValue('user-123'),
		getSubscription: vi.fn().mockResolvedValue(SUBSCRIPTION),
		...overrides,
	} as unknown as SupabaseAdminClient;
}

function makeCreateCustomerSession() {
	return vi
		.fn()
		.mockResolvedValue({ url: 'https://polar.sh/portal/session/test' });
}

const AUTH = { authorization: 'Bearer ok' };

describe('handlePortal (Polar)', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns 405 for non-POST methods', async () => {
		const res = await handlePortal(makeRequest({ method: 'GET' }), {
			supabase: makeSupabase(),
			createCustomerSession: makeCreateCustomerSession(),
		});
		expect(res.status).toBe(405);
	});

	it('returns 401 when Authorization is missing', async () => {
		const res = await handlePortal(makeRequest(), {
			supabase: makeSupabase(),
			createCustomerSession: makeCreateCustomerSession(),
		});
		expect(res.status).toBe(401);
		expect(await res.json()).toEqual({ error: 'missing_token' });
	});

	it('returns 401 when JWT is invalid', async () => {
		const res = await handlePortal(
			makeRequest({ headers: { authorization: 'Bearer bad' } }),
			{
				supabase: makeSupabase({
					getUserIdFromToken: vi.fn().mockResolvedValue(null),
				}),
				createCustomerSession: makeCreateCustomerSession(),
			},
		);
		expect(res.status).toBe(401);
		expect(await res.json()).toEqual({ error: 'invalid_token' });
	});

	it('returns 404 when the user has no subscription row', async () => {
		const createCustomerSession = makeCreateCustomerSession();
		const res = await handlePortal(makeRequest({ headers: AUTH }), {
			supabase: makeSupabase({
				getSubscription: vi.fn().mockResolvedValue(null),
			}),
			createCustomerSession,
		});
		expect(res.status).toBe(404);
		expect(await res.json()).toEqual({ error: 'no_billing_history' });
		expect(createCustomerSession).not.toHaveBeenCalled();
	});

	it('returns the portal URL on success, by external id, and never logs it', async () => {
		const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
		const createCustomerSession = makeCreateCustomerSession();
		const res = await handlePortal(makeRequest({ headers: AUTH }), {
			supabase: makeSupabase(),
			createCustomerSession,
		});
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			url: 'https://polar.sh/portal/session/test',
		});
		expect(createCustomerSession).toHaveBeenCalledWith('user-123');
		const allLogs = consoleLog.mock.calls.map((c) => String(c[0])).join('\n');
		expect(allLogs).not.toContain('polar.sh/portal');
		expect(allLogs).toContain('cus_abc'); // customer id is allowed in logs
		consoleLog.mockRestore();
	});

	it('returns 502 when the Polar portal call throws', async () => {
		const res = await handlePortal(makeRequest({ headers: AUTH }), {
			supabase: makeSupabase(),
			createCustomerSession: vi.fn().mockRejectedValue(new Error('polar_down')),
		});
		expect(res.status).toBe(502);
		expect(await res.json()).toEqual({ error: 'polar_portal_failed' });
	});
});
