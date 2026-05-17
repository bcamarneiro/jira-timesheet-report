/**
 * OAuth callback handler.
 *
 * Supabase's `detectSessionInUrl: true` option means the client SDK has already
 * parsed the hash and stored the session by the time we mount here. We just
 * wait for the auth state to populate, then redirect.
 *
 * Linear: ADA-256.
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './useAuth';

export function AuthCallback(): JSX.Element {
	const { session, isLoading } = useAuth();
	const navigate = useNavigate();
	const [params] = useSearchParams();
	const redirect = params.get('redirect') || '/account';

	useEffect(() => {
		if (isLoading) return;
		// Whether or not we got a session, leave this page. Failed OAuth lands
		// back on sign-in with a flag; success goes to the requested redirect.
		if (session) {
			navigate(redirect, { replace: true });
		} else {
			navigate('/auth/sign-in?oauth=failed', { replace: true });
		}
	}, [isLoading, session, navigate, redirect]);

	return (
		<div style={{ padding: '2rem', textAlign: 'center' }}>
			<p>Signing you in…</p>
		</div>
	);
}
