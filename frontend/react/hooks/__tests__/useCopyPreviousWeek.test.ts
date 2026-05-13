import { describe, expect, it } from 'vitest';
import type { WorklogItem } from '../../../services/monthWorklogService';
import { deriveWeekWorklogs } from '../useCopyPreviousWeek';

const EMAIL = 'user@example.com';

function makeWorklog(overrides: Partial<WorklogItem> = {}): WorklogItem {
	return {
		id: 'wl-1',
		author: { emailAddress: EMAIL },
		started: '2026-04-20T09:00:00.000+0000',
		created: '2026-04-20T09:00:00.000+0000',
		comment: '',
		timeSpentSeconds: 3600,
		issue: {
			id: '1',
			key: 'PROJ-1',
			fields: { summary: 'Some issue' },
		},
		...overrides,
	} as WorklogItem;
}

describe('deriveWeekWorklogs (Copy Prev Week)', () => {
	const weekStart = '2026-04-20'; // Monday
	const weekEnd = '2026-04-26'; // Sunday

	it('buckets a normal worklog (no backdate) by its started day', () => {
		const wl = makeWorklog({
			started: '2026-04-22T10:00:00.000+0000',
			created: '2026-04-22T10:00:00.000+0000',
		});

		const entries = deriveWeekWorklogs([wl], EMAIL, weekStart, weekEnd);

		expect(entries).toHaveLength(1);
		expect(entries[0].date).toBe('2026-04-22');
		expect(entries[0].issueKey).toBe('PROJ-1');
	});

	it('Pattern A: comment-marker backdates are skipped — Copy Prev Week should not propagate them', () => {
		// Backdated submissions don't represent recurring work for the previous
		// week; they're catch-up entries. Excluding them prevents the
		// suggestion engine from cloning a one-off backdate into next week.
		const wl = makeWorklog({
			started: '2026-04-22T10:00:00.000+0000',
			created: '2026-04-22T10:00:00.000+0000',
			comment: 'Original Worklog Date was: 2026-04-15',
		});

		const entriesInThisWeek = deriveWeekWorklogs(
			[wl],
			EMAIL,
			weekStart,
			weekEnd,
		);
		expect(entriesInThisWeek).toHaveLength(0);

		// Same data: not in the older intended week either.
		const entriesInOlderWeek = deriveWeekWorklogs(
			[wl],
			EMAIL,
			'2026-04-13',
			'2026-04-19',
		);
		expect(entriesInOlderWeek).toHaveLength(0);
	});

	it('Pattern B (jira-native): backdates are skipped — Copy Prev Week should not propagate them', () => {
		const wl = makeWorklog({
			started: '2026-03-10T09:00:00.000+0000', // March intended date
			created: '2026-04-22T15:00:00.000+0000', // logged in April (different month → backdate)
			comment: '',
		});

		const aprilWeek = deriveWeekWorklogs([wl], EMAIL, weekStart, weekEnd);
		expect(aprilWeek).toHaveLength(0);

		const marchWeek = deriveWeekWorklogs(
			[wl],
			EMAIL,
			'2026-03-09',
			'2026-03-15',
		);
		expect(marchWeek).toHaveLength(0);
	});

	it('skips worklogs from other authors', () => {
		const mine = makeWorklog({
			started: '2026-04-21T10:00:00.000+0000',
			created: '2026-04-21T10:00:00.000+0000',
		});
		const other = makeWorklog({
			id: 'wl-2',
			author: { emailAddress: 'someone-else@example.com' },
			started: '2026-04-21T10:00:00.000+0000',
			created: '2026-04-21T10:00:00.000+0000',
		});

		const entries = deriveWeekWorklogs(
			[mine, other],
			EMAIL,
			weekStart,
			weekEnd,
		);
		expect(entries).toHaveLength(1);
		expect(entries[0].issueKey).toBe('PROJ-1');
	});
});
