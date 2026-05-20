/**
 * Append-only compliance audit log.
 *
 * Records GDPR-relevant events (account deletion, data export) without
 * retaining any user-identifying fields. The only durable identifier is the
 * Stripe customer id, which lives in Stripe's records anyway and is what we'd
 * use to answer a "did this person ever have an account?" subject access
 * request from billing.
 *
 * Linear: ADA-263, ADA-264.
 */

import {
	defaultSupabaseAdmin,
	type SupabaseAdminClient,
} from './supabaseAdmin.js';

export async function logAuditEvent(
	eventType: string,
	stripeCustomerId: string | null,
	metadata: Record<string, unknown> = {},
	client?: SupabaseAdminClient,
): Promise<void> {
	const admin = client ?? defaultSupabaseAdmin();
	await admin.insertAuditLog({
		event_type: eventType,
		stripe_customer_id: stripeCustomerId,
		metadata,
	});
}
