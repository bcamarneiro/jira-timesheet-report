/**
 * Unit tests for the waitlist endpoint.
 *
 * Linear: ADA-269.
 *
 * Mocks the admin client through the `WaitlistAdminClient` interface so the
 * tests don't touch Supabase or the network. The env-driven `null` client
 * path covers the "Supabase not configured yet" scenario.
 */

import { describe, expect, it, vi } from 'vitest';
import {
	type WaitlistAdminClient,
	waitlistHandler,
} from '../index';

function makeRequest(body: unknown, method = 'POST'): Request {
	return new Request('https://hoursmith.io/api/waitlist', {
		method,
		headers: { 'content-type': 'application/json' },
		body: body === undefined ? undefined : JSON.stringify(body),
	});
}

function makeClient(
	overrides: Partial<WaitlistAdminClient> = {},
): WaitlistAdminClient {
	return {
		upsertEmail: vi.fn().mockResolvedValue({ ok: true }),
		...overrides,
	};
}

describe('waitlistHandler', () => {
	it('returns 405 for non-POST methods', async () => {
		const res = await waitlistHandler(makeRequest(undefined, 'GET'), {
			client: makeClient(),
		});
		expect(res.status).toBe(405);
	});

	it('returns 204 for CORS preflight', async () => {
		const res = await waitlistHandler(makeRequest(undefined, 'OPTIONS'), {
			client: makeClient(),
		});
		expect(res.status).toBe(204);
	});

	it('returns 400 when email is missing', async () => {
		const res = await waitlistHandler(makeRequest({ source: 'pricing' }), {
			client: makeClient(),
		});
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error).toBe('missing_email');
	});

	it('returns 400 when email is malformed', async () => {
		const res = await waitlistHandler(
			makeRequest({ email: 'not-an-email', source: 'pricing' }),
			{ client: makeClient() },
		);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error).toBe('invalid_email');
	});

	it('returns 400 when source is invalid', async () => {
		const res = await waitlistHandler(
			makeRequest({ email: 'a@b.co', source: 'web' }),
			{ client: makeClient() },
		);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error).toBe('invalid_source');
	});

	it('returns 400 when body is invalid JSON', async () => {
		const req = new Request('https://hoursmith.io/api/waitlist', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: 'not-json',
		});
		const res = await waitlistHandler(req, { client: makeClient() });
		expect(res.status).toBe(400);
	});

	it('returns 200 saved=false when Supabase is not configured', async () => {
		const res = await waitlistHandler(
			makeRequest({ email: 'a@b.co', source: 'pricing' }),
			{ client: null },
		);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.saved).toBe(false);
		expect(body.reason).toBe('collection_not_yet_active');
	});

	it('returns 200 saved=true on a successful upsert', async () => {
		const client = makeClient();
		const res = await waitlistHandler(
			makeRequest({ email: 'A@B.co', source: 'pricing' }),
			{ client },
		);
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ saved: true });
		// Email is normalized (lowercase + trim) before persistence.
		expect(client.upsertEmail).toHaveBeenCalledWith({
			email: 'a@b.co',
			source: 'pricing',
		});
	});

	it('is idempotent for duplicate emails (client signals ok)', async () => {
		const client = makeClient(); // upsert ignores duplicates → ok
		const first = await waitlistHandler(
			makeRequest({ email: 'a@b.co', source: 'pricing' }),
			{ client },
		);
		const second = await waitlistHandler(
			makeRequest({ email: 'a@b.co', source: 'pricing' }),
			{ client },
		);
		expect(first.status).toBe(200);
		expect(second.status).toBe(200);
		expect(await first.json()).toEqual({ saved: true });
		expect(await second.json()).toEqual({ saved: true });
	});

	it('returns 200 saved=false (not 5xx) when the table is missing', async () => {
		const client = makeClient({
			upsertEmail: vi
				.fn()
				.mockResolvedValue({ ok: false, reason: 'table_missing' }),
		});
		const res = await waitlistHandler(
			makeRequest({ email: 'a@b.co', source: 'in-app-settings' }),
			{ client },
		);
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ saved: false });
	});

	it('returns 200 saved=false on a generic backend error (UX over correctness)', async () => {
		const client = makeClient({
			upsertEmail: vi.fn().mockResolvedValue({ ok: false, reason: 'error' }),
		});
		const res = await waitlistHandler(
			makeRequest({ email: 'a@b.co', source: 'pricing' }),
			{ client },
		);
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ saved: false });
	});
});
