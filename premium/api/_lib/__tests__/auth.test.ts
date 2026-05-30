/**
 * Tests for the consolidated JWT verifier (ADA-343).
 *
 * Layers:
 *  - orchestration: decode / expiry / claim / fallback decisions, with injected
 *    fetchJwks/restVerify so they're deterministic and network-free.
 *  - real crypto: an ES256 round-trip (generate key → sign → verify) exercising
 *    the actual WebCrypto import + verify path, plus tamper rejection.
 *  - hardening: confirmWithServer, claim checks (exp/nbf/iss/aud), JWKS caching.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	__resetAuthCache,
	emailFromToken,
	type Jwk,
	userIdFromToken,
	verifyJwt,
} from '../auth.js';

const ENV = {
	SUPABASE_URL: 'https://proj.supabase.co',
	SUPABASE_SERVICE_ROLE_KEY: 'service-role',
};
const ISS = 'https://proj.supabase.co/auth/v1';

function b64url(bytes: Uint8Array | string): string {
	const arr =
		typeof bytes === 'string' ? new TextEncoder().encode(bytes) : bytes;
	let bin = '';
	for (const b of arr) bin += String.fromCharCode(b);
	return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeUnsignedJwt(
	header: Record<string, unknown>,
	payload: Record<string, unknown>,
): string {
	return `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}.${b64url('sig')}`;
}

const FUTURE = Math.floor(Date.now() / 1000) + 3600;

beforeEach(() => {
	__resetAuthCache();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('verifyJwt — orchestration', () => {
	it('falls back to REST for a malformed (non-JWT) token', async () => {
		const restVerify = vi.fn(async () => ({ userId: 'u1', email: 'a@b.com' }));
		const out = await verifyJwt('not-a-jwt', { env: ENV, restVerify });
		expect(restVerify).toHaveBeenCalledOnce();
		expect(out).toEqual({ userId: 'u1', email: 'a@b.com' });
	});

	it('rejects an expired token without calling REST', async () => {
		const restVerify = vi.fn(async () => null);
		const token = makeUnsignedJwt(
			{ alg: 'ES256', kid: 'k1' },
			{ sub: 'u1', exp: Math.floor(Date.now() / 1000) - 120 },
		);
		expect(await verifyJwt(token, { env: ENV, restVerify })).toBeNull();
		expect(restVerify).not.toHaveBeenCalled();
	});

	it('falls back to REST for a symmetric (HS256) token', async () => {
		const restVerify = vi.fn(async () => ({ userId: 'hs', email: null }));
		const token = makeUnsignedJwt({ alg: 'HS256' }, { sub: 'hs', exp: FUTURE });
		const out = await verifyJwt(token, { env: ENV, restVerify });
		expect(restVerify).toHaveBeenCalledOnce();
		expect(out).toEqual({ userId: 'hs', email: null });
	});

	it('falls back to REST when the kid is unknown after a fresh fetch', async () => {
		const restVerify = vi.fn(async () => ({ userId: 'rot', email: null }));
		const fetchJwks = vi.fn(async (): Promise<Jwk[]> => [{ kid: 'other' }]);
		const token = makeUnsignedJwt(
			{ alg: 'ES256', kid: 'rotated' },
			{ sub: 'rot', exp: FUTURE },
		);
		const out = await verifyJwt(token, { env: ENV, restVerify, fetchJwks });
		expect(fetchJwks).toHaveBeenCalledOnce();
		expect(restVerify).toHaveBeenCalledOnce();
		expect(out).toEqual({ userId: 'rot', email: null });
	});

	it('falls back to REST when SUPABASE_URL is absent', async () => {
		const restVerify = vi.fn(async () => null);
		const token = makeUnsignedJwt(
			{ alg: 'ES256', kid: 'k1' },
			{ sub: 'u1', exp: FUTURE },
		);
		await verifyJwt(token, { env: {}, restVerify });
		expect(restVerify).toHaveBeenCalledOnce();
	});
});

describe('verifyJwt — confirmWithServer (sensitive endpoints)', () => {
	it('always uses REST and never touches the local JWKS path', async () => {
		const restVerify = vi.fn(async () => ({ userId: 'srv', email: null }));
		const fetchJwks = vi.fn(async (): Promise<Jwk[]> => []);
		// A token that WOULD verify locally still goes to the server.
		const token = makeUnsignedJwt(
			{ alg: 'ES256', kid: 'k1' },
			{ sub: 'local', exp: FUTURE },
		);
		const out = await verifyJwt(token, {
			env: ENV,
			confirmWithServer: true,
			restVerify,
			fetchJwks,
		});
		expect(out).toEqual({ userId: 'srv', email: null });
		expect(restVerify).toHaveBeenCalledOnce();
		expect(fetchJwks).not.toHaveBeenCalled();
	});

	it('rejects when the server rejects (e.g. deleted/revoked user)', async () => {
		const restVerify = vi.fn(async () => null);
		const token = makeUnsignedJwt(
			{ alg: 'ES256', kid: 'k1' },
			{ sub: 'gone', exp: FUTURE },
		);
		const out = await verifyJwt(token, {
			env: ENV,
			confirmWithServer: true,
			restVerify,
		});
		expect(out).toBeNull();
		expect(restVerify).toHaveBeenCalledOnce();
	});
});

describe('verifyJwt — local claim checks', () => {
	// These tokens reach the local path (ES256 + kid + url) and are rejected on
	// claims BEFORE signature work, so they need no valid signature and must not
	// fall back to REST.
	function localToken(payload: Record<string, unknown>): string {
		return makeUnsignedJwt({ alg: 'ES256', kid: 'k1' }, payload);
	}

	it('rejects a token with no exp (no unbounded local accepts)', async () => {
		const restVerify = vi.fn(async () => null);
		const fetchJwks = vi.fn(async (): Promise<Jwk[]> => []);
		const out = await verifyJwt(localToken({ sub: 'u1' }), {
			env: ENV,
			restVerify,
			fetchJwks,
		});
		expect(out).toBeNull();
		expect(restVerify).not.toHaveBeenCalled();
		expect(fetchJwks).not.toHaveBeenCalled();
	});

	it('rejects a token whose nbf is in the future', async () => {
		const restVerify = vi.fn(async () => null);
		const out = await verifyJwt(
			localToken({ sub: 'u1', exp: FUTURE, nbf: FUTURE }),
			{ env: ENV, restVerify },
		);
		expect(out).toBeNull();
		expect(restVerify).not.toHaveBeenCalled();
	});

	it('rejects a token whose iss is a different project', async () => {
		const restVerify = vi.fn(async () => null);
		const out = await verifyJwt(
			localToken({
				sub: 'u1',
				exp: FUTURE,
				iss: 'https://evil.supabase.co/auth/v1',
			}),
			{ env: ENV, restVerify },
		);
		expect(out).toBeNull();
		expect(restVerify).not.toHaveBeenCalled();
	});

	it('rejects a token whose aud is not "authenticated"', async () => {
		const restVerify = vi.fn(async () => null);
		const out = await verifyJwt(
			localToken({ sub: 'u1', exp: FUTURE, aud: 'anon' }),
			{ env: ENV, restVerify },
		);
		expect(out).toBeNull();
		expect(restVerify).not.toHaveBeenCalled();
	});
});

describe('verifyJwt — JWKS caching (amplification guard)', () => {
	it('fetches the JWKS at most once within the TTL across requests', async () => {
		const restVerify = vi.fn(async () => null);
		const fetchJwks = vi.fn(async (): Promise<Jwk[]> => [{ kid: 'real' }]);
		const now = Date.now();
		// Two requests with an unknown kid, same window → one fetch total.
		const tok = makeUnsignedJwt(
			{ alg: 'ES256', kid: 'unknown' },
			{ sub: 'u1', exp: FUTURE },
		);
		await verifyJwt(tok, { env: ENV, restVerify, fetchJwks, nowMs: now });
		await verifyJwt(tok, { env: ENV, restVerify, fetchJwks, nowMs: now });
		expect(fetchJwks).toHaveBeenCalledOnce();
		expect(restVerify).toHaveBeenCalledTimes(2);
	});
});

describe('verifyJwt — real ES256 crypto', () => {
	async function setup() {
		const pair = (await crypto.subtle.generateKey(
			{ name: 'ECDSA', namedCurve: 'P-256' },
			true,
			['sign', 'verify'],
		)) as CryptoKeyPair;
		const exported = (await crypto.subtle.exportKey(
			'jwk',
			pair.publicKey,
		)) as JsonWebKey;
		const jwk: Jwk = { ...exported, kid: 'test-key' };

		async function sign(payload: Record<string, unknown>): Promise<string> {
			const header = b64url(JSON.stringify({ alg: 'ES256', kid: 'test-key' }));
			const body = b64url(JSON.stringify(payload));
			const sig = new Uint8Array(
				await crypto.subtle.sign(
					{ name: 'ECDSA', hash: 'SHA-256' },
					pair.privateKey,
					new TextEncoder().encode(`${header}.${body}`),
				),
			);
			return `${header}.${body}.${b64url(sig)}`;
		}

		const fetchJwks = vi.fn(async (): Promise<Jwk[]> => [jwk]);
		const restVerify = vi.fn(async () => null);
		return { sign, fetchJwks, restVerify };
	}

	it('accepts a validly-signed token locally (no REST hop)', async () => {
		const { sign, fetchJwks, restVerify } = await setup();
		const token = await sign({
			sub: 'user-9',
			email: 'x@y.com',
			exp: FUTURE,
			iss: ISS,
			aud: 'authenticated',
		});
		const out = await verifyJwt(token, { env: ENV, fetchJwks, restVerify });
		expect(out).toEqual({ userId: 'user-9', email: 'x@y.com' });
		expect(restVerify).not.toHaveBeenCalled();
	});

	it('rejects a tampered payload without falling back to REST', async () => {
		const { sign, fetchJwks, restVerify } = await setup();
		const token = await sign({ sub: 'user-9', exp: FUTURE });
		const [h, _p, s] = token.split('.');
		const forged = `${h}.${b64url(JSON.stringify({ sub: 'attacker', exp: FUTURE }))}.${s}`;
		const out = await verifyJwt(forged, { env: ENV, fetchJwks, restVerify });
		expect(out).toBeNull();
		expect(restVerify).not.toHaveBeenCalled();
	});

	it('userIdFromToken / emailFromToken unwrap the verified token', async () => {
		const { sign, fetchJwks, restVerify } = await setup();
		const token = await sign({ sub: 'user-9', email: 'x@y.com', exp: FUTURE });
		const opts = { env: ENV, fetchJwks, restVerify };
		expect(await userIdFromToken(token, opts)).toBe('user-9');
		expect(await emailFromToken(token, opts)).toBe('x@y.com');
	});
});
