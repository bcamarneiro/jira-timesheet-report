/**
 * Premium auth route table.
 *
 * Imported dynamically by the frontend (only when `isPremiumBuild()` is true)
 * to keep the Free-tier bundle free of any Supabase code.
 *
 * The frontend → premium boundary is enforced by `scripts/check-premium-boundary.cjs`,
 * which only flags static `from '.../premium/...'` imports. Dynamic
 * `import('...')` calls with a string literal are intentionally allowed for
 * exactly this gating pattern.
 *
 * Linear: ADA-256, ADA-257.
 */

import type { ReactNode } from 'react';
import { AccountPage } from './AccountPage';
import { AuthCallback } from './AuthCallback';
import { AuthProvider } from './AuthProvider';
import { RequireAuth } from './RequireAuth';
import { SignInPage } from './SignInPage';
import { SignUpPage } from './SignUpPage';

export interface PremiumRoute {
	path: string;
	element: ReactNode;
}

export const premiumRoutes: PremiumRoute[] = [
	{
		path: '/account',
		element: (
			<RequireAuth>
				<AccountPage />
			</RequireAuth>
		),
	},
	{ path: '/auth/callback', element: <AuthCallback /> },
	{ path: '/auth/sign-in', element: <SignInPage /> },
	{ path: '/auth/sign-up', element: <SignUpPage /> },
];

export function PremiumAuthProvider({
	children,
}: {
	children: ReactNode;
}): JSX.Element {
	return <AuthProvider>{children}</AuthProvider>;
}
