import { describe, expect, it } from 'vitest';
import { describeFreshness } from '../dataFreshness';

describe('describeFreshness', () => {
	it('returns idle state when there is no timestamp', () => {
		expect(describeFreshness(null)).toEqual({
			label: 'No successful sync yet',
			detail: 'This view has not completed a successful sync yet.',
			tone: 'idle',
		});
	});

	it('marks recent timestamps as fresh', () => {
		const result = describeFreshness('2026-03-30T10:10:00.000Z', {
			now: new Date('2026-03-30T10:18:00.000Z'),
		});

		expect(result.label).toContain('Synced');
		expect(result.detail).toBe('Last successful sync was 8 minutes ago.');
		expect(result.tone).toBe('fresh');
	});

	it('marks older timestamps as warning and stale', () => {
		const warning = describeFreshness('2026-03-30T10:00:00.000Z', {
			now: new Date('2026-03-30T10:30:00.000Z'),
		});
		expect(warning.tone).toBe('warning');
		expect(warning.detail).toBe('Last successful sync was 30 minutes ago.');

		const stale = describeFreshness('2026-03-30T08:00:00.000Z', {
			now: new Date('2026-03-30T10:30:00.000Z'),
		});
		expect(stale.tone).toBe('stale');
		expect(stale.label).toContain('stale');
		expect(stale.detail).toBe('Last successful sync was 2 hours ago.');
	});
});
