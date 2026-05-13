import { describe, expect, it } from 'vitest';
import type { EnrichedJiraWorklog } from '../../../../types/jira';
import { buildMonthHeatmapBuckets } from '../useMonthHeatmapData';

const EMAIL = 'me@example.com';

function makeWorklog(opts: {
	id?: string;
	started: string;
	created?: string;
	timeSpentSeconds?: number;
	authorEmail?: string;
}): EnrichedJiraWorklog {
	return {
		id: opts.id ?? '1',
		self: '',
		author: {
			self: '',
			accountId: 'a',
			displayName: 'Me',
			active: true,
			emailAddress: opts.authorEmail ?? EMAIL,
		},
		updateAuthor: {
			self: '',
			accountId: 'a',
			displayName: 'Me',
			active: true,
		},
		comment: '',
		created: opts.created ?? opts.started,
		updated: opts.started,
		started: opts.started,
		timeSpent: '1h',
		timeSpentSeconds: opts.timeSpentSeconds ?? 3600,
		issueId: '1',
		issueKey: 'PROJ-1',
		issue: { id: '1', key: 'PROJ-1', fields: { summary: 's' } },
		// biome-ignore lint/suspicious/noExplicitAny: test fixture
	} as any;
}

describe('buildMonthHeatmapBuckets', () => {
	it('returns empty maps for undefined worklogs', () => {
		const r = buildMonthHeatmapBuckets(undefined, EMAIL);
		expect(r.data.size).toBe(0);
		expect(r.backdatedSeconds.size).toBe(0);
	});

	it('buckets normal worklogs into data only', () => {
		const r = buildMonthHeatmapBuckets(
			[
				makeWorklog({
					started: '2025-10-15T09:00:00Z',
					timeSpentSeconds: 3600,
				}),
				makeWorklog({
					id: '2',
					started: '2025-10-15T11:00:00Z',
					timeSpentSeconds: 1800,
				}),
			],
			EMAIL,
		);
		expect(r.data.get('2025-10-15')).toBe(5400);
		expect(r.backdatedSeconds.get('2025-10-15') ?? 0).toBe(0);
	});

	it('records backdated seconds on the loggedOn day but excludes them from the cell total', () => {
		// Started 2025-09-30, created 2025-10-15 — jira-native backdate.
		// loggedOn=2025-10-15, intendedFor=2025-09-30, isBackdated=true.
		const r = buildMonthHeatmapBuckets(
			[
				makeWorklog({
					started: '2025-09-30T09:00:00Z',
					created: '2025-10-15T09:00:00Z',
					timeSpentSeconds: 7200,
				}),
			],
			EMAIL,
		);
		// `data` is the cell total used for color intensity — must not be
		// inflated by backdated entries.
		expect(r.data.get('2025-10-15') ?? 0).toBe(0);
		expect(r.backdatedSeconds.get('2025-10-15')).toBe(7200);
	});

	it('keeps regular and backdated hours in separate buckets on the same day', () => {
		const r = buildMonthHeatmapBuckets(
			[
				makeWorklog({
					id: 'regular',
					started: '2025-10-15T09:00:00Z',
					timeSpentSeconds: 3600,
				}),
				makeWorklog({
					id: 'backdated',
					started: '2025-09-30T09:00:00Z',
					created: '2025-10-15T09:00:00Z',
					timeSpentSeconds: 5400,
				}),
			],
			EMAIL,
		);
		expect(r.data.get('2025-10-15')).toBe(3600);
		expect(r.backdatedSeconds.get('2025-10-15')).toBe(5400);
	});

	it('skips worklogs from other authors', () => {
		const r = buildMonthHeatmapBuckets(
			[
				makeWorklog({
					started: '2025-10-15T09:00:00Z',
					authorEmail: 'other@example.com',
				}),
			],
			EMAIL,
		);
		expect(r.data.size).toBe(0);
	});
});
