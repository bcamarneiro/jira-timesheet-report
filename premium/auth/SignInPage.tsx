/**
 * Sign-in page for Hoursmith Premium.
 *
 * Email/password + GitHub OAuth. Redirects to `/account` on success, or to
 * the `?redirect=` target if RequireAuth bounced the user here.
 *
 * Linear: ADA-256.
 */

import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as styles from './SignInPage.module.css';
import { useAuth } from './useAuth';

export function SignInPage(): JSX.Element {
	useEffect(() => {
		const previous = document.title;
		document.title = 'Sign in — Hoursmith';
		return () => {
			document.title = previous;
		};
	}, []);
	const { signIn, signInWithGitHub } = useAuth();
	const navigate = useNavigate();
	const [params] = useSearchParams();
	const redirect = params.get('redirect') || '/account';

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function handleSubmit(e: FormEvent): Promise<void> {
		e.preventDefault();
		setPending(true);
		setError(null);
		const { error: err } = await signIn(email, password);
		setPending(false);
		if (err) {
			setError(err);
			return;
		}
		navigate(redirect, { replace: true });
	}

	async function handleGitHub(): Promise<void> {
		setError(null);
		const callback = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`;
		const { error: err } = await signInWithGitHub(callback);
		if (err) setError(err);
	}

	return (
		<div className={styles.container}>
			<div className={styles.card}>
				<h1 className={styles.title}>Sign in</h1>
				<p className={styles.subtitle}>
					Access your Hoursmith Premium account.
				</p>

				<form className={styles.form} onSubmit={handleSubmit}>
					<div className={styles.field}>
						<label className={styles.label} htmlFor="signin-email">
							Email
						</label>
						<input
							id="signin-email"
							className={styles.input}
							type="email"
							autoComplete="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div className={styles.field}>
						<label className={styles.label} htmlFor="signin-password">
							Password
						</label>
						<input
							id="signin-password"
							className={styles.input}
							type="password"
							autoComplete="current-password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					{error && <p className={styles.error}>{error}</p>}
					<button type="submit" className={styles.primary} disabled={pending}>
						{pending ? 'Signing in…' : 'Sign in'}
					</button>
				</form>

				<div className={styles.divider}>or</div>

				<button type="button" className={styles.oauth} onClick={handleGitHub}>
					Continue with GitHub
				</button>

				<p className={styles.footer}>
					No account? <Link to="/auth/sign-up">Create one</Link>
				</p>
			</div>
		</div>
	);
}
