import { describe, expect, it } from 'vitest';
import type { WorklogSuggestion } from '../../../types/Suggestion';
import { distributeSuggestionsToFillGap } from '../suggestionMerger';

function makeSuggestion(
	overrides: Partial<WorklogSuggestion> = {},
): WorklogSuggestion {
	return {
		id: 'test-1',
		source: 'jira-activity',
		issueKey: 'TEST-1',
		issueSummary: 'Test issue',
		date: '2026-03-09',
		suggestedTimeSpent: '1h',
		suggestedSeconds: 3600,
		confidence: 'medium',
		reason: 'Test reason',
		logged: false,
		...overrides,
	};
}

describe('distributeSuggestionsToFillGap', () => {
	it('should return empty array for empty suggestions', () => {
		const result = distributeSuggestionsToFillGap([], 28800);
		expect(result).toEqual([]);
	});

	it('should return suggestions unchanged when gap is zero', () => {
		const suggestions = [makeSuggestion({ suggestedSeconds: 3600 })];
		const result = distributeSuggestionsToFillGap(suggestions, 0);
		expect(result).toEqual(suggestions);
	});

	it('should return suggestions unchanged when gap is negative', () => {
		const suggestions = [makeSuggestion({ suggestedSeconds: 3600 })];
		const result = distributeSuggestionsToFillGap(suggestions, -1000);
		expect(result).toEqual(suggestions);
	});

	it('should return suggestions unchanged when total already exceeds gap', () => {
		const suggestions = [makeSuggestion({ suggestedSeconds: 28800 })];
		const result = distributeSuggestionsToFillGap(suggestions, 7200);
		expect(result).toEqual(suggestions);
	});

	it('should return suggestions unchanged when total equals gap', () => {
		const suggestions = [makeSuggestion({ suggestedSeconds: 28800 })];
		const result = distributeSuggestionsToFillGap(suggestions, 28800);
		expect(result).toEqual(suggestions);
	});

	it('should scale a single suggestion to fill the gap exactly', () => {
		const suggestions = [
			makeSuggestion({ suggestedSeconds: 3600 }), // 1h
		];
		const gapSeconds = 28800; // 8h

		const result = distributeSuggestionsToFillGap(suggestions, gapSeconds);

		expect(result).toHaveLength(1);
		expect(result[0].suggestedSeconds).toBe(28800);
		expect(result[0].suggestedTimeSpent).toBe('8h');
	});

	it('should scale multiple suggestions proportionally to fill the gap', () => {
		const suggestions = [
			makeSuggestion({ id: 's1', suggestedSeconds: 3600 }), // 1h
			makeSuggestion({ id: 's2', suggestedSeconds: 7200 }), // 2h
		];
		const gapSeconds = 28800; // 8h, total is 3h, scale factor ~2.667

		const result = distributeSuggestionsToFillGap(suggestions, gapSeconds);

		expect(result).toHaveLength(2);

		// Total must equal gap exactly
		const total = result.reduce((sum, s) => sum + s.suggestedSeconds, 0);
		expect(total).toBe(28800);

		// Proportions should be preserved (1:2 ratio)
		// s1 was 1/3 of total -> ~9600, s2 was 2/3 -> ~19200
		expect(result[0].suggestedSeconds).toBeCloseTo(9600, -1);
		expect(result[1].suggestedSeconds).toBeCloseTo(19200, -1);
	});

	it('should preserve suggestion properties other than time fields', () => {
		const suggestions = [
			makeSuggestion({
				id: 'keep-me',
				issueKey: 'PROJ-42',
				confidence: 'high',
				source: 'gitlab',
				suggestedSeconds: 1800,
			}),
		];

		const result = distributeSuggestionsToFillGap(suggestions, 7200);

		expect(result[0].id).toBe('keep-me');
		expect(result[0].issueKey).toBe('PROJ-42');
		expect(result[0].confidence).toBe('high');
		expect(result[0].source).toBe('gitlab');
		expect(result[0].suggestedSeconds).toBe(7200);
	});

	it('should handle rounding so total matches gap exactly', () => {
		// Three suggestions that won't divide evenly
		const suggestions = [
			makeSuggestion({ id: 's1', suggestedSeconds: 1000 }),
			makeSuggestion({ id: 's2', suggestedSeconds: 1000 }),
			makeSuggestion({ id: 's3', suggestedSeconds: 1000 }),
		];
		const gapSeconds = 10000; // 10000 / 3000 = 3.333...

		const result = distributeSuggestionsToFillGap(suggestions, gapSeconds);

		const total = result.reduce((sum, s) => sum + s.suggestedSeconds, 0);
		expect(total).toBe(10000);
	});

	it('should update suggestedTimeSpent to match new seconds', () => {
		const suggestions = [
			makeSuggestion({ suggestedSeconds: 1800 }), // 30m
		];

		const result = distributeSuggestionsToFillGap(suggestions, 7200); // scale to 2h

		expect(result[0].suggestedSeconds).toBe(7200);
		expect(result[0].suggestedTimeSpent).toBe('2h');
	});
});
