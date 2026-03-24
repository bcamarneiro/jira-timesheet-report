import { describe, expect, it } from 'vitest';
import { getRetroactiveDays, isRetroactivelyLogged } from '../retroactive';

describe('isRetroactivelyLogged', () => {
	it('returns false when both dates are undefined', () => {
		expect(isRetroactivelyLogged(undefined, undefined)).toBe(false);
	});

	it('returns false when created is undefined', () => {
		expect(isRetroactivelyLogged(undefined, '2026-03-15T10:00:00')).toBe(
			false,
		);
	});

	it('returns false when started is undefined', () => {
		expect(isRetroactivelyLogged('2026-03-15T10:00:00', undefined)).toBe(
			false,
		);
	});

	it('returns false when same month', () => {
		expect(
			isRetroactivelyLogged(
				'2026-03-20T10:00:00.000+0000',
				'2026-03-15T08:00:00.000+0000',
			),
		).toBe(false);
	});

	it('returns true when created in different month than started', () => {
		expect(
			isRetroactivelyLogged(
				'2026-04-02T10:00:00.000+0000',
				'2026-03-28T08:00:00.000+0000',
			),
		).toBe(true);
	});

	it('returns true when logged months later', () => {
		expect(
			isRetroactivelyLogged(
				'2026-06-15T10:00:00.000+0000',
				'2026-03-10T08:00:00.000+0000',
			),
		).toBe(true);
	});
});

describe('getRetroactiveDays', () => {
	it('returns 0 for missing dates', () => {
		expect(getRetroactiveDays(undefined, undefined)).toBe(0);
		expect(getRetroactiveDays('2026-03-15', undefined)).toBe(0);
		expect(getRetroactiveDays(undefined, '2026-03-15')).toBe(0);
	});

	it('returns positive days when logged later', () => {
		const days = getRetroactiveDays(
			'2026-04-05T10:00:00.000+0000',
			'2026-03-28T10:00:00.000+0000',
		);
		expect(days).toBe(8);
	});

	it('returns 0 when created same day as started', () => {
		const days = getRetroactiveDays(
			'2026-03-15T14:00:00.000+0000',
			'2026-03-15T08:00:00.000+0000',
		);
		expect(days).toBe(0);
	});
});
