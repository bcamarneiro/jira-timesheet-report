/**
 * /account page for Hoursmith Premium.
 *
 * Sections:
 *   1. Profile      — email + signup date (from `auth.user`).
 *   2. Subscription — tier + status + renewal; CTA varies by status.
 *   3. Privacy      — export / delete account.
 *   4. Sign out.
 *
 * Subscription rows are fetched via Supabase REST against the
 * `public.subscriptions` table (RLS: select_own only). The fetch is
 * intentionally minimal — no SDK call helper today; ADA-262 will
 * follow up with a typed wrapper.
 *
 * Endpoints:
 *   - POST /api/checkout            (exists or coming via ADA-261)
 *   - POST /api/billing/portal      (ADA-262 — disabled until then)
 *   - GET  /api/account/export      (parallel PR)
 *   - POST /api/account/delete      (parallel PR)
 *
 * Linear: ADA-257.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as styles from './AccountPage.module.css';
import { getSupabase } from './supabaseClient';
import { useAuth } from './useAuth';

type SubscriptionStatus =
	| 'active'
	| 'past_due'
	| 'canceled'
	| 'incomplete'
	| 'trialing'
	| 'unpaid';

interface SubscriptionRow {
	tier: 'free' | 'premium';
	status: SubscriptionStatus;
	current_period_end: string | null;
}

function formatDate(value: string | null | undefined): string {
	if (!value) return '—';
	try {
		return new Date(value).toLocaleDateString();
	} catch {
		return '—';
	}
}

async function postJson(path: string, token?: string): Promise<Response> {
	return fetch(path, {
		method: 'POST',
		headers: token
			? { authorization: `Bearer ${token}`, 'content-type': 'application/json' }
			: { 'content-type': 'application/json' },
	});
}

export function AccountPage(): JSX.Element {
	const { user, session, signOut } = useAuth();
	const navigate = useNavigate();
	const [subscription, setSubscription] = useState<SubscriptionRow | null>(
		null,
	);
	const [loadingSub, setLoadingSub] = useState(true);
	const [actionPending, setActionPending] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);

	useEffect(() => {
		if (!user) return;
		let cancelled = false;
		setLoadingSub(true);
		getSupabase()
			.from('subscriptions')
			.select('tier, status, current_period_end')
			.eq('user_id', user.id)
			.maybeSingle()
			.then(({ data, error }) => {
				if (cancelled) return;
				if (error) {
					console.warn('[account] subscription_fetch_failed');
					setSubscription(null);
				} else {
					setSubscription((data as SubscriptionRow | null) ?? null);
				}
				setLoadingSub(false);
			});
		return () => {
			cancelled = true;
		};
	}, [user]);

	const handleUpgrade = useCallback(async () => {
		setActionPending('checkout');
		setActionError(null);
		try {
			const res = await postJson('/api/checkout', session?.access_token);
			if (!res.ok) throw new Error('Checkout unavailable');
			const body = (await res.json()) as { url?: string };
			if (body.url) {
				window.location.href = body.url;
				return;
			}
			throw new Error('Missing checkout URL');
		} catch (err) {
			setActionError((err as Error).message);
		} finally {
			setActionPending(null);
		}
	}, [session]);

	const handleExport = useCallback(async () => {
		setActionPending('export');
		setActionError(null);
		try {
			const res = await fetch('/api/account/export', {
				headers: session?.access_token
					? { authorization: `Bearer ${session.access_token}` }
					: undefined,
			});
			if (!res.ok) throw new Error('Export endpoint not available yet.');
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'hoursmith-account-export.json';
			a.click();
			URL.revokeObjectURL(url);
		} catch (err) {
			setActionError((err as Error).message);
		} finally {
			setActionPending(null);
		}
	}, [session]);

	const handleDelete = useCallback(async () => {
		const confirmed = window.confirm(
			'Delete your account? This removes your profile and subscription record. This cannot be undone.',
		);
		if (!confirmed) return;
		setActionPending('delete');
		setActionError(null);
		try {
			const res = await postJson('/api/account/delete', session?.access_token);
			if (!res.ok) throw new Error('Delete endpoint not available yet.');
			await signOut();
			navigate('/', { replace: true });
		} catch (err) {
			setActionError((err as Error).message);
		} finally {
			setActionPending(null);
		}
	}, [session, signOut, navigate]);

	const handleSignOut = useCallback(async () => {
		await signOut();
		navigate('/', { replace: true });
	}, [signOut, navigate]);

	if (!user) {
		// RequireAuth should have redirected; render nothing as a safety net.
		return <div />;
	}

	const status = subscription?.status ?? null;
	const tier = subscription?.tier ?? 'free';

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Account</h1>

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Profile</h2>
				<div className={styles.row}>
					<span className={styles.label}>Email</span>
					<span className={styles.value}>{user.email ?? '—'}</span>
				</div>
				<div className={styles.row}>
					<span className={styles.label}>Member since</span>
					<span className={styles.value}>{formatDate(user.created_at)}</span>
				</div>
			</section>

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Subscription</h2>
				{loadingSub ? (
					<p className={styles.note}>Loading…</p>
				) : (
					<>
						<div className={styles.row}>
							<span className={styles.label}>Tier</span>
							<span className={styles.value}>
								{tier === 'premium' ? 'Premium' : 'Free'}
							</span>
						</div>
						<div className={styles.row}>
							<span className={styles.label}>Status</span>
							<span className={styles.value}>{status ?? 'none'}</span>
						</div>
						{subscription?.current_period_end && (
							<div className={styles.row}>
								<span className={styles.label}>
									{status === 'canceled' ? 'Ends' : 'Renews'}
								</span>
								<span className={styles.value}>
									{formatDate(subscription.current_period_end)}
								</span>
							</div>
						)}

						{status === 'past_due' && (
							<div className={styles.alert}>
								Payment failed — please update your card to keep Premium access.
							</div>
						)}

						<div className={styles.actions}>
							{(!status || status === 'incomplete' || tier === 'free') && (
								<button
									type="button"
									className={styles.primary}
									onClick={handleUpgrade}
									disabled={actionPending === 'checkout'}
								>
									{actionPending === 'checkout'
										? 'Redirecting…'
										: 'Upgrade to Premium'}
								</button>
							)}
							{status === 'canceled' && (
								<button
									type="button"
									className={styles.primary}
									onClick={handleUpgrade}
									disabled={actionPending === 'checkout'}
								>
									Resubscribe
								</button>
							)}
							{(status === 'active' ||
								status === 'past_due' ||
								status === 'trialing' ||
								status === 'unpaid') && (
								<button
									type="button"
									className={styles.secondary}
									disabled
									title="Coming soon (ADA-262)"
								>
									Manage billing
								</button>
							)}
						</div>
					</>
				)}
			</section>

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Privacy</h2>
				<p className={styles.note}>
					Export a copy of your account data or delete your account.
				</p>
				<div className={styles.actions}>
					<button
						type="button"
						className={styles.secondary}
						onClick={handleExport}
						disabled={actionPending === 'export'}
					>
						{actionPending === 'export' ? 'Exporting…' : 'Export my data'}
					</button>
					<button
						type="button"
						className={styles.danger}
						onClick={handleDelete}
						disabled={actionPending === 'delete'}
					>
						{actionPending === 'delete' ? 'Deleting…' : 'Delete my account'}
					</button>
				</div>
			</section>

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Session</h2>
				<div className={styles.actions}>
					<button
						type="button"
						className={styles.secondary}
						onClick={handleSignOut}
					>
						Sign out
					</button>
				</div>
			</section>

			{actionError && <p className={styles.alert}>{actionError}</p>}
		</div>
	);
}
