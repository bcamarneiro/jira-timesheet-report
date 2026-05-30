/**
 * Single source of truth for verifying a Supabase user JWT (ADA-343).
 *
 * Before this, four call sites each did their own `GET /auth/v1/user` round-trip
 * to GoTrue per request (entitlement.ts, supabaseAdmin.ts, account/delete.ts,
 * account/export.ts). On the hot proxy path that REST hop adds latency to every
 * request. This consolidates them onto one helper that prefers **local JWKS
 * signature verification** (no network) and falls back to the REST check only
 * when it genuinely can't decide locally.
 *
 * Verification strategy:
 *   1. Decode the JWT. Malformed → REST fallback (can't judge locally).
 *   2. Expired (`exp` in the past) → reject. Definitive; no wasted REST call.
 *   3. Symmetric/unknown alg (legacy HS256) → REST fallback (we don't hold the
 *      shared secret here, so we can't verify locally).
 *   4. Asymmetric (ES256/RS256): fetch the project JWKS (cached by `kid`), import
 *      the matching key, verify the signature.
 *        - matching key + valid signature → accept.
 *        - matching key + invalid signature → reject (a genuine forgery; never
 *          fall back, or REST would rubber-stamp the forged claims).
 *        - no matching `kid` even after a cache-busting refetch → REST fallback
 *          (this is the key-rotation window — fail safe, not closed).
 *   5. Any unexpected error in the local path → REST fallback.
 *
 * Edge-runtime compatible: WebCrypto + `fetch` only, no Node-only deps and no
 * `jose` dependency (mirrors the WebCrypto HMAC verify already in polarClient).
 *
 * Linear: ADA-343 (split from ADA-308).
 */

type Env = Partial<Record<string, string | undefined>>;

export interface VerifiedToken {
	userId: string;
	email: string | null;
}

interface JwtHeader {
	alg?: string;
	kid?: string;
}

interface JwtPayload {
	sub?: string;
	email?: string;
	exp?: number;
}

interface DecodedJwt {
	header: JwtHeader;
	payload: JwtPayload;
	signingInput: string;
	signature: Uint8Array;
}

/** Minimal JWK shape we consume from the Supabase JWKS endpoint. */
export interface Jwk {
	kid?: string;
	kty?: string;
	alg?: string;
	[key: string]: unknown;
}

export interface VerifyJwtOptions {
	/** Env source (tests). Defaults to `process.env`. */
	env?: Env;
	/** Override "now" in ms (tests). Defaults to `Date.now()`. */
	nowMs?: number;
	/** Inject the JWKS fetcher (tests). Returns the key set, or null on failure. */
	fetchJwks?: (jwksUrl: string) => Promise<Jwk[] | null>;
	/** Inject the REST fallback verifier (tests). */
	restVerify?: (token: string, env: Env) => Promise<VerifiedToken | null>;
}

// Imported public keys, cached by `kid` across invocations of a warm instance.
const keyCache = new Map<string, CryptoKey>();

/** Test hook: clear the module-level JWKS key cache between cases. */
export function __resetAuthCache(): void {
	keyCache.clear();
}

function base64UrlToBytes(input: string): Uint8Array {
	const padded = input.replace(/-/g, '+').replace(/_/g, '/');
	const withPad = padded + '='.repeat((4 - (padded.length % 4)) % 4);
	const binary = atob(withPad);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

function base64UrlToJson<T>(input: string): T {
	const bytes = base64UrlToBytes(input);
	return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

function decodeJwt(token: string): DecodedJwt | null {
	const parts = token.split('.');
	if (parts.length !== 3) return null;
	const [h, p, s] = parts;
	try {
		return {
			header: base64UrlToJson<JwtHeader>(h),
			payload: base64UrlToJson<JwtPayload>(p),
			signingInput: `${h}.${p}`,
			signature: base64UrlToBytes(s),
		};
	} catch {
		return null;
	}
}

function isExpired(payload: JwtPayload, nowMs: number): boolean {
	return typeof payload.exp === 'number' && payload.exp * 1000 <= nowMs;
}

/** Map a JWT `alg` to the WebCrypto import + verify parameters, or null. */
function algParams(alg: string | undefined): {
	importAlg: EcKeyImportParams | RsaHashedImportParams;
	verifyAlg: AlgorithmIdentifier | EcdsaParams;
} | null {
	if (alg === 'ES256') {
		return {
			importAlg: { name: 'ECDSA', namedCurve: 'P-256' },
			verifyAlg: { name: 'ECDSA', hash: 'SHA-256' },
		};
	}
	if (alg === 'RS256') {
		return {
			importAlg: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
			verifyAlg: { name: 'RSASSA-PKCS1-v1_5' },
		};
	}
	return null;
}

async function defaultFetchJwks(jwksUrl: string): Promise<Jwk[] | null> {
	try {
		const res = await fetch(jwksUrl);
		if (!res.ok) return null;
		const body = (await res.json()) as { keys?: Jwk[] };
		return Array.isArray(body.keys) ? body.keys : null;
	} catch {
		return null;
	}
}

async function defaultRestVerify(
	token: string,
	env: Env,
): Promise<VerifiedToken | null> {
	const url = env.SUPABASE_URL;
	const key = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) return null;
	try {
		const res = await fetch(`${url}/auth/v1/user`, {
			headers: { apikey: key, authorization: `Bearer ${token}` },
		});
		if (!res.ok) return null;
		const body = (await res.json()) as { id?: string; email?: string } | null;
		if (!body?.id) return null;
		return { userId: body.id, email: body.email ?? null };
	} catch {
		return null;
	}
}

/**
 * Resolve the CryptoKey for a `kid`, importing from JWKS on a cache miss. A
 * cache miss triggers a single fresh JWKS fetch (covers key rotation). Returns
 * null if the key can't be found/imported — the caller treats that as
 * "inconclusive" and falls back to REST.
 */
async function resolveKey(
	kid: string,
	alg: string,
	jwksUrl: string,
	fetchJwks: (u: string) => Promise<Jwk[] | null>,
): Promise<CryptoKey | null> {
	const cached = keyCache.get(kid);
	if (cached) return cached;

	const params = algParams(alg);
	if (!params) return null;

	const keys = await fetchJwks(jwksUrl);
	if (!keys) return null;

	const jwk = keys.find((k) => k.kid === kid);
	if (!jwk) return null;

	try {
		const imported = await crypto.subtle.importKey(
			'jwk',
			jwk as JsonWebKey,
			params.importAlg,
			false,
			['verify'],
		);
		keyCache.set(kid, imported);
		return imported;
	} catch {
		return null;
	}
}

/**
 * Verify a Supabase user JWT and return its `{ userId, email }`, or null if the
 * token is invalid/expired or can't be verified by any path.
 */
export async function verifyJwt(
	token: string,
	options: VerifyJwtOptions = {},
): Promise<VerifiedToken | null> {
	const env = options.env ?? process.env;
	const nowMs = options.nowMs ?? Date.now();
	const fetchJwks = options.fetchJwks ?? defaultFetchJwks;
	const restVerify = options.restVerify ?? defaultRestVerify;

	const decoded = decodeJwt(token);
	// Not a well-formed JWT — let REST be the judge (it may be an opaque token).
	if (!decoded) return restVerify(token, env);

	// Expired is definitive; don't spend a REST round-trip on it.
	if (isExpired(decoded.payload, nowMs)) return null;

	const params = algParams(decoded.header.alg);
	const url = env.SUPABASE_URL;
	// Symmetric/unknown alg, no kid, or no configured URL → can't verify locally.
	if (!params || !decoded.header.kid || !url) {
		return restVerify(token, env);
	}

	try {
		const jwksUrl = `${url.replace(/\/+$/, '')}/auth/v1/.well-known/jwks.json`;
		const key = await resolveKey(
			decoded.header.kid,
			decoded.header.alg as string,
			jwksUrl,
			fetchJwks,
		);
		// Unknown kid even after a fresh fetch → rotation window → REST fallback.
		if (!key) return restVerify(token, env);

		const ok = await crypto.subtle.verify(
			params.verifyAlg,
			key,
			decoded.signature as BufferSource,
			new TextEncoder().encode(decoded.signingInput) as BufferSource,
		);
		// Matching key but bad signature → genuine forgery. Reject, never fall back.
		if (!ok) return null;
		if (!decoded.payload.sub) return null;
		return {
			userId: decoded.payload.sub,
			email: decoded.payload.email ?? null,
		};
	} catch {
		// Unexpected local error → fail safe to REST, not closed.
		return restVerify(token, env);
	}
}

/** Convenience: the verified user id (`sub`), or null. */
export async function userIdFromToken(
	token: string,
	options: VerifyJwtOptions = {},
): Promise<string | null> {
	return (await verifyJwt(token, options))?.userId ?? null;
}

/** Convenience: the verified email claim, or null. */
export async function emailFromToken(
	token: string,
	options: VerifyJwtOptions = {},
): Promise<string | null> {
	return (await verifyJwt(token, options))?.email ?? null;
}
