/**
 * Generate a stable, collision-resistant identifier.
 *
 * Prefers `crypto.randomUUID()` (available in modern browsers and the
 * test environment via happy-dom). Falls back to a `Date.now() +
 * Math.random()` composite for older runtimes — still unique enough
 * for a single-tab session, never equal across two `uid()` calls in
 * the same millisecond.
 *
 * Optional `prefix` is slug-prepended for human readability:
 *   uid('preset') → "preset-3f07e...…"
 */
export function uid(prefix?: string): string {
	const slug = prefix ? `${prefix}-` : '';
	const cryptoRef =
		typeof globalThis !== 'undefined'
			? (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
			: undefined;
	if (cryptoRef?.randomUUID) {
		return `${slug}${cryptoRef.randomUUID()}`;
	}
	const time = Date.now().toString(36);
	const rand = Math.random().toString(36).slice(2, 10);
	return `${slug}${time}-${rand}`;
}
