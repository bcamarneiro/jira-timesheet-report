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

	it('Pattern A: comment marker for an earlier day — entry buckets by logged-on day (started), not the intended day', () => {
		// Logged on 2026-04-22 (this prev week), but comment claims it was for 2026-04-15 (older week).
		// Pattern A: started == loggedDate, comment marker carries the intended date.
		// classifyWorklog.loggedOn should be 2026-04-22, so the entry shows up in this week.
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
		expect(entriesInThisWeek).toHaveLength(1);
		expect(entriesInThisWeek[0].date).toBe('2026-04-22');

		// And it must NOT show up under the older intended week (2026-04-13..2026-04-19).
		const entriesInOlderWeek = deriveWeekWorklogs(
			[wl],
			EMAIL,
			'2026-04-13',
			'2026-04-19',
		);
		expect(entriesInOlderWeek).toHaveLength(0);
	});

	it('Pattern B (jira-native): started in past week, created later — entry buckets by created (logged-on)', () => {
		// Pattern B: started is the past intended date, created is the actual log date.
		// loggedOn === created. The entry should show up in the week of `created`,
		// not the week of `started`.
		const wl = makeWorklog({
			started: '2026-03-10T09:00:00.000+0000', // March intended date
			created: '2026-04-22T15:00:00.000+0000', // logged in April
			comment: '',
		});

		const aprilWeek = deriveWeekWorklogs([wl], EMAIL, weekStart, weekEnd);
		expect(aprilWeek).toHaveLength(1);
		expect(aprilWeek[0].date).toBe('2026-04-22');

		// Same data: must NOT bucket into the original March week.
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
