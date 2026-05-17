/**
 * Browser-side Supabase client for Hoursmith Premium.
 *
 * Uses `@supabase/supabase-js` for the heavy lifting (auth state listener,
 * OAuth redirect handling, session persistence). The server-side entitlement
 * helper at `premium/api/_lib/entitlement.ts` runs without the SDK because
 * it only needs a single REST call per request; on the client the SDK is
 * harder to fake (storage events, multi-tab sync) so we install it.
 *
 * Env vars (defined via DefinePlugin in rspack.config.js):
 *   - VITE_SUPABASE_URL
 *   - VITE_SUPABASE_ANON_KEY
 *
 * These are public-by-design (anon key is RLS-gated). The service-role key
 * never reaches the browser; it lives only in server functions.
 *
 * Linear: ADA-256.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

function assertEnv(): void {
	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error(
			'Supabase env missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (ADA-254).',
		);
	}
}

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
	if (cached) return cached;
	assertEnv();
	cached = createClient(supabaseUrl, supabaseAnonKey, {
		auth: {
			persistSession: true,
			autoRefreshToken: true,
			detectSessionInUrl: true,
		},
	});
	return cached;
}

// Convenience export. Lazy via Proxy so importing this module in a Free-tier
// build (should never happen, but defence in depth) doesn't throw at load.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
	get(_target, prop) {
		const client = getSupabase() as unknown as Record<string | symbol, unknown>;
		return client[prop as string];
	},
});
