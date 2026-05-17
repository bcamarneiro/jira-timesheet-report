/**
 * Unit tests for `POST /api/account/delete` (GDPR Article 17).
 *
 * Mocks Stripe + Supabase admin via the injected-deps surface. No network.
 *
 * Linear: ADA-263.
 */

import { describe, expect, it, vi } from 'vitest';
import type { StripeLikeClient } from '../../_lib/stripeClient';
import type { SupabaseAdminClient } from '../../_lib/supabaseAdmin';
import { handleDelete } from '../delete';

function makeRequest(headers: Record<string, string> = {}): Request {
	return new Request('https://hoursmith.io/api/account/delete', {
		method: 'POST',
		headers,
	});
}

function makeAdmin(
	overrides: Partial<SupabaseAdminClient> = {},
): SupabaseAdminClient {
	return {
		getProfile: vi.fn().mockResolvedValue({
			id: 'user-123',
			email: 'a@b.test',
			created_at: '2026-01-01T00:00:00Z',
		}),
		getSubscription: vi.fn().mockResolvedValue({
			user_id: 'user-123',
			stripe_customer_id: 'cus_abc',
			stripe_subscription_id: 'sub_abc',
			tier: 'premium',
			status: 'active',
			current_period_end: '2026-12-01T00:00:00Z',
		}),
		deleteSubscription: vi.fn().mockResolvedValue(undefined),
		deleteProfile: vi.fn().mockResolvedValue(undefined),
		deleteAuthUser: vi.fn().mockResolvedValue(undefined),
		insertAuditLog: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

function makeStripe(
	overrides: Partial<StripeLikeClient['subscriptions']> = {},
): StripeLikeClient {
	return {
		subscriptions: {
			cancel: vi.fn().mockResolvedValue({ id: 'sub_abc', status: 'canceled' }),
			...overrides,
		},
	};
}

describe('POST /api/account/delete', () => {
	it('returns 401 when the Authorization header is missing', async () => {
		const admin = makeAdmin();
		const stripe = makeStripe();
		const res = await handleDelete(makeRequest(), {
			admin,
			stripe,
			verifyJwt: vi.fn(),
		});
		expect(res.status).toBe(401);
		expect(admin.deleteAuthUser).not.toHaveBeenCalled();
	});

	it('returns 401 when the JWT is invalid', async () => {
		const admin = makeAdmin();
		const stripe = makeStripe();
		const res = await handleDelete(makeRequest({ authorization: 'Bearer x' }), {
			admin,
			stripe,
			verifyJwt: vi.fn().mockResolvedValue(null),
		});
		expect(res.status).toBe(401);
		expect(admin.deleteAuthUser).not.toHaveBeenCalled();
	});

	it('deletes the user and logs audit when there is no subscription row', async () => {
		const admin = makeAdmin({
			getSubscription: vi.fn().mockResolvedValue(null),
		});
		const stripe = makeStripe();
		const res = await handleDelete(
			makeRequest({ authorization: 'Bearer ok' }),
			{
				admin,
				stripe,
				verifyJwt: vi.fn().mockResolvedValue('user-123'),
			},
		);
		expect(res.status).toBe(204);
		expect(stripe.subscriptions.cancel).not.toHaveBeenCalled();
		expect(admin.deleteSubscription).toHaveBeenCalledWith('user-123');
		expect(admin.deleteProfile).toHaveBeenCalledWith('user-123');
		expect(admin.deleteAuthUser).toHaveBeenCalledWith('user-123');
		expect(admin.insertAuditLog).toHaveBeenCalledWith(
			expect.objectContaining({
				event_type: 'account_deleted',
				stripe_customer_id: null,
			}),
		);
	});

	it('cancels Stripe + deletes + logs when subscription is active', async () => {
		const admin = makeAdmin();
		const stripe = makeStripe();
		const res = await handleDelete(
			makeRequest({ authorization: 'Bearer ok' }),
			{
				admin,
				stripe,
				verifyJwt: vi.fn().mockResolvedValue('user-123'),
			},
		);
		expect(res.status).toBe(204);
		expect(stripe.subscriptions.cancel).toHaveBeenCalledWith('sub_abc', {
			invoice_now: false,
			prorate: false,
		});
		expect(admin.deleteAuthUser).toHaveBeenCalledWith('user-123');
		expect(admin.insertAuditLog).toHaveBeenCalledWith(
			expect.objectContaining({
				event_type: 'account_deleted',
				stripe_customer_id: 'cus_abc',
				metadata: expect.objectContaining({ stripe_cancel: 'ok' }),
			}),
		);
	});

	it('still deletes the user when Stripe cancel throws; audit captures the error', async () => {
		const admin = makeAdmin();
		const stripe: StripeLikeClient = {
			subscriptions: {
				cancel: vi.fn().mockRejectedValue(new Error('stripe down')),
			},
		};
		const res = await handleDelete(
			makeRequest({ authorization: 'Bearer ok' }),
			{
				admin,
				stripe,
				verifyJwt: vi.fn().mockResolvedValue('user-123'),
			},
		);
		expect(res.status).toBe(204);
		expect(admin.deleteAuthUser).toHaveBeenCalledWith('user-123');
		expect(admin.insertAuditLog).toHaveBeenCalledWith(
			expect.objectContaining({
				event_type: 'account_deleted',
				stripe_customer_id: 'cus_abc',
				metadata: expect.objectContaining({
					stripe_cancel: 'error',
					stripe_error: 'stripe down',
				}),
			}),
		);
	});

	it('returns 500 and writes NO audit log when Supabase delete fails (retry-clean)', async () => {
		const admin = makeAdmin({
			deleteAuthUser: vi.fn().mockRejectedValue(new Error('rls error')),
		});
		const stripe = makeStripe();
		const res = await handleDelete(
			makeRequest({ authorization: 'Bearer ok' }),
			{
				admin,
				stripe,
				verifyJwt: vi.fn().mockResolvedValue('user-123'),
			},
		);
		expect(res.status).toBe(500);
		expect(admin.insertAuditLog).not.toHaveBeenCalled();
	});

	it('rejects non-POST methods', async () => {
		const res = await handleDelete(
			new Request('https://hoursmith.io/api/account/delete', { method: 'GET' }),
			{
				admin: makeAdmin(),
				stripe: makeStripe(),
				verifyJwt: vi.fn(),
			},
		);
		expect(res.status).toBe(405);
	});
});
