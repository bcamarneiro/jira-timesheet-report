import { describe, expect, it } from 'vitest';
import { formatMonthlyExportSegment } from '../useDownload';

describe('formatMonthlyExportSegment', () => {
	it('zero-pads single-digit months', () => {
		expect(formatMonthlyExportSegment(2026, 0)).toBe('2026-01');
		expect(formatMonthlyExportSegment(2026, 8)).toBe('2026-09');
	});

	it('keeps double-digit months stable', () => {
		expect(formatMonthlyExportSegment(2026, 10)).toBe('2026-11');
		expect(formatMonthlyExportSegment(2026, 11)).toBe('2026-12');
	});
});
