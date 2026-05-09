import { describe, expect, it } from 'vitest';
import { uid } from '../uid';

describe('uid', () => {
	it('produces a non-empty string', () => {
		const value = uid();
		expect(typeof value).toBe('string');
		expect(value.length).toBeGreaterThan(0);
	});

	it('prefixes when a prefix is provided', () => {
		expect(uid('preset')).toMatch(/^preset-/);
	});

	it('does not collide across rapid successive calls', () => {
		const ids = new Set<string>();
		for (let i = 0; i < 200; i++) {
			ids.add(uid());
		}
		expect(ids.size).toBe(200);
	});

	it('does not collide across calls in the same millisecond when crypto is missing', () => {
		const original = (globalThis as { crypto?: unknown }).crypto;
		try {
			Object.defineProperty(globalThis, 'crypto', {
				configurable: true,
				value: {},
			});
			const ids = new Set<string>();
			for (let i = 0; i < 200; i++) {
				ids.add(uid('p'));
			}
			expect(ids.size).toBe(200);
		} finally {
			Object.defineProperty(globalThis, 'crypto', {
				configurable: true,
				value: original,
			});
		}
	});
});
