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
 * Two trust modes (the caller chooses):
 *   - LOCAL-FIRST (default) — for the hot proxy path. Verify signature + claims
 *     locally; only hit GoTrue when we can't decide locally. Fast, but it does
 *     NOT see server-side revocation: a correctly-signed, unexpired token from a
 *     since-deleted/banned user is accepted until `exp`. Acceptable on the proxy
 *     (it only forwards the user's own Jira creds for that window).
 *   - `confirmWithServer: true` — for low-traffic, sensitive endpoints (account
 *     delete/export, checkout/portal). Always does the live `GET /auth/v1/user`
 *     check, so a deleted user / revoked session is rejected immediately. This
 *     restores the pre-consolidation guarantee on the paths that need it
 *     (notably the GDPR delete/export endpoints and ADA-313 session revocation).
 *
 * Local verification strategy:
 *   1. Decode the JWT. Malformed → REST fallback (can't judge locally).
 *   2. Expired (`exp` in the past, minus skew) → reject. Definitive.
 *   3. Symmetric/unknown alg (legacy HS256), no `kid`, or no URL → REST fallback
 *      (we can't verify the signature locally).
 *   4. Claim checks the old GoTrue path enforced: `exp` REQUIRED, `nbf` honored,
 *      `iss` pinned to the project, `aud` must include `authenticated`. A token
 *      failing these is rejected outright — never given a second chance via REST.
 *   5. Asymmetric (ES256/RS256): resolve the JWKS key by `kid` (key set cached
 *      with a short TTL so a burst of unknown-`kid` tokens can't trigger a fetch
 *      per request), import it, verify the signature.
 *        - matching key + valid signature → accept.
 *        - matching key + invalid signature → reject (forgery; never fall back,
 *          or REST would rubber-stamp the forged claims).
 *        - no matching `kid` → REST fallback (key-rotation window — fail safe).
 *   6. Any unexpected error in the local path → REST fallback.
 *
 * Edge-runtime compatible: WebCrypto + `fetch` only, no Node-only deps and no
 * `jose` dependency (mirrors the WebCrypto HMAC verify already in polarClient).
 *
 * Linear: ADA-343 (split from ADA-308).
 */

type Env = Partial<Record<string, string | undefined>>;

/** Tolerance for clock drift between the edge node and the auth server. */
const CLOCK_SKEW_MS = 60 * 1000;

/** TTL for the cached JWKS key set (caps JWKS fetches under unknown-kid bursts). */
const JWKS_TTL_MS = 5 * 60 * 1000;

/** The audience Supabase user (access) tokens carry. */
const EXPECTED_AUDIENCE = 'authenticated';

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
	nbf?: number;
	iss?: string;
	aud?: string | string[];
}

interface DecodedJwt {
	header: JwtHeader;
	payload: JwtPayload;
	signingInput: string;
	signature: Uint8Array;
}

/** WebCrypto import + verify parameters for a supported asymmetric alg. */
interface AlgParams {
	importAlg: EcKeyImportParams | RsaHashedImportParams;
	verifyAlg: AlgorithmIdentifier | EcdsaParams;
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
	/**
	 * Force a live GoTrue (`GET /auth/v1/user`) check instead of local-only
	 * verification. Sensitive, low-traffic endpoints set this so a deleted user
	 * or revoked session is rejected, not just an expired token.
	 */
	confirmWithServer?: boolean;
	/** Inject the JWKS fetcher (tests). Returns the key set, or null on failure. */
	fetchJwks?: (jwksUrl: string) => Promise<Jwk[] | null>;
	/** Inject the REST fallback verifier (tests). */
	restVerify?: (token: string, env: Env) => Promise<VerifiedToken | null>;
}

// Imported public keys, cached by `kid` across invocations of a warm instance.
const keyCache = new Map<string, CryptoKey>();
// The JWKS key set, cached with a short TTL. Without this, a burst of tokens
// each bearing an unrecognized `kid` would trigger one JWKS fetch per request
// (amplification). The TTL caps fetches to one per window; positive lookups are
// additionally memoized in `keyCache`.
let jwksCache: { keys: Jwk[]; fetchedAt: number } | null = null;

/** Test hook: clear the module-level caches between cases. */
export function __resetAuthCache(): void {
	keyCache.clear();
	jwksCache = null;
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

/** Expired iff `exp` is present and in the past (with skew). */
function isExpired(payload: JwtPayload, nowMs: number): boolean {
	return (
		typeof payload.exp === 'number' &&
		payload.exp * 1000 <= nowMs - CLOCK_SKEW_MS
	);
}

function audienceMatches(aud: JwtPayload['aud']): boolean {
	if (aud === undefined) return true; // tolerate absent; reject only a mismatch
	return Array.isArray(aud)
		? aud.includes(EXPECTED_AUDIENCE)
		: aud === EXPECTED_AUDIENCE;
}

/**
 * Claim checks the old GoTrue REST path enforced server-side, now enforced
 * locally for the asymmetric path. `exp` is REQUIRED here (a server-less accept
 * must be time-bounded); `nbf`/`iss`/`aud` are validated when present so a token
 * for a different project (iss) or audience is rejected. Returns false → reject.
 */
function localClaimsValid(
	payload: JwtPayload,
	nowMs: number,
	expectedIss: string,
): boolean {
	if (typeof payload.exp !== 'number') return false; // no unbounded local accepts
	if (payload.exp * 1000 <= nowMs - CLOCK_SKEW_MS) return false;
	if (
		typeof payload.nbf === 'number' &&
		payload.nbf * 1000 > nowMs + CLOCK_SKEW_MS
	) {
		return false;
	}
	if (payload.iss && payload.iss !== expectedIss) return false;
	if (!audienceMatches(payload.aud)) return false;
	return true;
}

/** Map a JWT `alg` to the WebCrypto import + verify parameters, or null. */
function algParams(alg: string | undefined): AlgParams | null {
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
 * Return the JWKS key set, fetching at most once per {@link JWKS_TTL_MS} window.
 * On a fetch failure, serves a stale cached set if one exists (fail safe).
 */
async function getJwks(
	jwksUrl: string,
	fetchJwks: (u: string) => Promise<Jwk[] | null>,
	nowMs: number,
): Promise<Jwk[] | null> {
	if (jwksCache && nowMs - jwksCache.fetchedAt < JWKS_TTL_MS) {
		return jwksCache.keys;
	}
	const keys = await fetchJwks(jwksUrl);
	if (keys) {
		jwksCache = { keys, fetchedAt: nowMs };
		return keys;
	}
	return jwksCache?.keys ?? null;
}

/**
 * Resolve the CryptoKey for a `kid`, importing from the (TTL-cached) JWKS on a
 * cache miss. Returns null if the key can't be found/imported — the caller
 * treats that as "inconclusive" and falls back to REST.
 */
async function resolveKey(
	kid: string,
	params: AlgParams,
	jwksUrl: string,
	fetchJwks: (u: string) => Promise<Jwk[] | null>,
	nowMs: number,
): Promise<CryptoKey | null> {
	const cached = keyCache.get(kid);
	if (cached) return cached;

	const keys = await getJwks(jwksUrl, fetchJwks, nowMs);
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

	// Sensitive callers require a live server check (existence + revocation),
	// not just a local signature. Restores the pre-ADA-343 guarantee.
	if (options.confirmWithServer) return restVerify(token, env);

	// Expired is definitive for any alg; don't spend a REST round-trip on it.
	if (isExpired(decoded.payload, nowMs)) return null;

	const params = algParams(decoded.header.alg);
	const url = env.SUPABASE_URL;
	// Symmetric/unknown alg, no kid, or no configured URL → can't verify locally.
	if (!params || !decoded.header.kid || !url) {
		return restVerify(token, env);
	}

	const base = url.replace(/\/+$/, '');

	// Standards claims the old GoTrue check enforced. A token that fails these is
	// rejected outright — it must not get a second chance via the REST fallback.
	if (!localClaimsValid(decoded.payload, nowMs, `${base}/auth/v1`)) {
		return null;
	}

	try {
		const jwksUrl = `${base}/auth/v1/.well-known/jwks.json`;
		const key = await resolveKey(
			decoded.header.kid,
			params,
			jwksUrl,
			fetchJwks,
			nowMs,
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
