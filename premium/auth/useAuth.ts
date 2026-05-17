import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from './AuthProvider';

/**
 * Consume the Supabase auth context. Throws if used outside `<AuthProvider>`
 * so misuse is caught at first render rather than producing silent nulls.
 *
 * Linear: ADA-256.
 */
export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error('useAuth must be used inside <AuthProvider>.');
	}
	return ctx;
}
