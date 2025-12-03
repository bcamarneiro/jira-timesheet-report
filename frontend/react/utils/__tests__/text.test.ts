import { describe, it, expect } from 'vitest';
import { truncate } from '../text';

describe('truncate', () => {
	it('should return empty string for empty input', () => {
		expect(truncate('')).toBe('');
	});

	it('should return empty string for null/undefined', () => {
		expect(truncate(null as unknown as string)).toBe('');
		expect(truncate(undefined as unknown as string)).toBe('');
	});

	it('should not truncate text shorter than limit', () => {
		expect(truncate('Hello', 20)).toBe('Hello');
		expect(truncate('Short text', 20)).toBe('Short text');
	});

	it('should not truncate text exactly at limit', () => {
		expect(truncate('12345678901234567890', 20)).toBe('12345678901234567890');
	});

	it('should truncate text longer than limit with ellipsis', () => {
		expect(
			truncate('This is a very long text that should be truncated', 20),
		).toBe('This is a very long …');
	});

	it('should use default length of 20', () => {
		const text = 'This is a text that exceeds twenty characters';
		const result = truncate(text);
		expect(result).toBe('This is a text that …');
		expect(result.length).toBe(21); // 20 chars + ellipsis
	});

	it('should handle custom length', () => {
		expect(truncate('Hello World', 5)).toBe('Hello…');
		expect(truncate('Testing', 3)).toBe('Tes…');
	});

	it('should handle single character limit', () => {
		expect(truncate('Hello', 1)).toBe('H…');
	});
});
