/**
 * Sign-up page for Hoursmith Premium.
 *
 * Email/password + GitHub OAuth. Redirects to `/account` on success.
 * Email confirmation is OFF for v1 (Supabase default); revisit when abuse appears.
 *
 * Linear: ADA-256.
 */

import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as styles from './SignUpPage.module.css';
import { useAuth } from './useAuth';

export function SignUpPage(): JSX.Element {
	useEffect(() => {
		const previous = document.title;
		document.title = 'Sign up — Hoursmith';
		return () => {
			document.title = previous;
		};
	}, []);
	const { signUp, signInWithGitHub } = useAuth();
	const navigate = useNavigate();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function handleSubmit(e: FormEvent): Promise<void> {
		e.preventDefault();
		setPending(true);
		setError(null);
		const { error: err } = await signUp(email, password);
		setPending(false);
		if (err) {
			setError(err);
			return;
		}
		navigate('/account', { replace: true });
	}

	async function handleGitHub(): Promise<void> {
		setError(null);
		const callback = `${window.location.origin}/auth/callback?redirect=/account`;
		const { error: err } = await signInWithGitHub(callback);
		if (err) setError(err);
	}

	return (
		<div className={styles.container}>
			<div className={styles.card}>
				<h1 className={styles.title}>Create your account</h1>
				<p className={styles.subtitle}>
					Free to start. Upgrade to Premium anytime.
				</p>

				<form className={styles.form} onSubmit={handleSubmit}>
					<div className={styles.field}>
						<label className={styles.label} htmlFor="signup-email">
							Email
						</label>
						<input
							id="signup-email"
							className={styles.input}
							type="email"
							autoComplete="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div className={styles.field}>
						<label className={styles.label} htmlFor="signup-password">
							Password
						</label>
						<input
							id="signup-password"
							className={styles.input}
							type="password"
							autoComplete="new-password"
							required
							minLength={8}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					{error && <p className={styles.error}>{error}</p>}
					<button type="submit" className={styles.primary} disabled={pending}>
						{pending ? 'Creating account…' : 'Create account'}
					</button>
				</form>

				<div className={styles.divider}>or</div>

				<button type="button" className={styles.oauth} onClick={handleGitHub}>
					Continue with GitHub
				</button>

				<p className={styles.footer}>
					Already have an account? <Link to="/auth/sign-in">Sign in</Link>
				</p>
			</div>
		</div>
	);
}
