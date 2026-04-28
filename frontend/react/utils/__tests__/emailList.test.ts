import { describe, expect, it } from 'vitest';
import {
	formatEmailEntries,
	isValidEmailEntry,
	splitCsvEmailList,
	splitEmailEntries,
	uniqueEmailEntries,
} from '../emailList';

describe('emailList', () => {
	it('splits comma, semicolon, newline, and whitespace-joined emails', () => {
		expect(
			splitEmailEntries(
				' one@example.com, two@example.com;\nthree@example.com\tfour@example.com five@example.com ',
			),
		).toEqual([
			'one@example.com',
			'two@example.com',
			'three@example.com',
			'four@example.com',
			'five@example.com',
		]);
	});

	it('deduplicates emails case-insensitively', () => {
		expect(
			uniqueEmailEntries([
				'One@Example.com',
				'two@example.com',
				'one@example.com',
			]),
		).toEqual(['one@example.com', 'two@example.com']);
	});

	it('formats emails back to a csv string', () => {
		expect(
			formatEmailEntries(['one@example.com', 'two@example.com']),
		).toBe('one@example.com, two@example.com');
	});

	it('parses csv email lists into unique normalized emails', () => {
		expect(
			splitCsvEmailList(' one@example.com, two@example.com, one@example.com '),
		).toEqual(['one@example.com', 'two@example.com']);
	});

	it('validates email entries', () => {
		expect(isValidEmailEntry('person@example.com')).toBe(true);
		expect(isValidEmailEntry('not-an-email')).toBe(false);
	});
});
