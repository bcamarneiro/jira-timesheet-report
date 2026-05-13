import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { EnrichedJiraWorklog } from '../../../../types/jira';
import { OverviewTable } from '../OverviewTable';

type Entry = [string, Record<string, EnrichedJiraWorklog[]>];

function makeWorklog(seconds: number, day: string): EnrichedJiraWorklog {
	// Provide a `started` so the classifier (used internally by the table)
	// produces a non-empty `loggedOn` and the worklog is counted.
	return {
		timeSpentSeconds: seconds,
		started: `${day}T09:00:00.000Z`,
		issue: { id: '1', key: 'JIRA-1', fields: { summary: 'x' } },
	} as EnrichedJiraWorklog;
}

function makeBackdatedWorklog(
	seconds: number,
	day: string,
	originalDay: string,
): EnrichedJiraWorklog {
	return {
		timeSpentSeconds: seconds,
		started: `${day}T09:00:00.000Z`,
		comment: `Original Worklog Date was: ${originalDay.replace(/-/g, '/')}`,
		issue: { id: '1', key: 'JIRA-1', fields: { summary: 'x' } },
	} as EnrichedJiraWorklog;
}

const sarah: Entry = [
	'Sarah Johnson',
	{
		'2026-05-01': [makeWorklog(3600 * 5, '2026-05-01')],
		'2026-05-02': [makeWorklog(3600 * 3, '2026-05-02')],
	},
];
const alex: Entry = [
	'Alex Doe',
	{ '2026-05-01': [makeWorklog(3600 * 4, '2026-05-01')] },
];

function getDataRows(): HTMLTableRowElement[] {
	const tbody = document.querySelector('tbody');
	if (!tbody) return [];
	return Array.from(tbody.querySelectorAll('tr')).filter(
		(row) => !row.textContent?.startsWith('Total ('),
	) as HTMLTableRowElement[];
}

describe('OverviewTable filtering and inclusion policy', () => {
	it('renders only the focused user when caller filters entries to one user', () => {
		render(
			<OverviewTable entries={[sarah]} year={2026} monthZeroIndexed={4} />,
		);
		expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
		expect(screen.queryByText('Alex Doe')).not.toBeInTheDocument();
	});

	it('renders all provided users when no filter is applied', () => {
		render(
			<OverviewTable
				entries={[sarah, alex]}
				year={2026}
				monthZeroIndexed={4}
			/>,
		);
		expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
		expect(screen.getByText('Alex Doe')).toBeInTheDocument();
	});

	it('hides zero-hour users by default (Monthly behaviour preserved)', () => {
		render(
			<OverviewTable
				entries={[sarah]}
				year={2026}
				monthZeroIndexed={4}
				allUsers={['Sarah Johnson', 'Ghost User']}
			/>,
		);
		expect(screen.queryByText('Ghost User')).not.toBeInTheDocument();
	});

	it('includes zero-hour users from allUsers when includeZeroHourUsers is true', () => {
		render(
			<OverviewTable
				entries={[sarah]}
				year={2026}
				monthZeroIndexed={4}
				includeZeroHourUsers
				allUsers={['Sarah Johnson', 'Ghost User']}
			/>,
		);
		expect(screen.getByText('Ghost User')).toBeInTheDocument();
		// Zero-hour row shows 0.0h
		const ghostRow = screen.getByText('Ghost User').closest('tr');
		expect(ghostRow).not.toBeNull();
		expect(
			within(ghostRow as HTMLElement).getByText('0.0h'),
		).toBeInTheDocument();
	});

	it('excludes backdated worklogs from the user row total and entry count', () => {
		const entries: Entry[] = [
			[
				'Mixed User',
				{
					'2026-05-04': [
						makeWorklog(3600 * 4, '2026-05-04'),
						makeBackdatedWorklog(3600 * 3, '2026-05-04', '2026-04-15'),
					],
				},
			],
		];
		render(<OverviewTable entries={entries} year={2026} monthZeroIndexed={4} />);
		const row = screen.getByText('Mixed User').closest('tr');
		expect(row).not.toBeNull();
		// Hours column: only the 4h regular entry counts (not 7h).
		expect(within(row as HTMLElement).getByText('4.0h')).toBeInTheDocument();
		// Entries column should also exclude backdated -> 1, not 2.
		const cells = (row as HTMLElement).querySelectorAll('td');
		expect(cells[3].textContent).toBe('1');
	});

	it('sorts by Hours without crashing when zero-hour rows are present', () => {
		render(
			<OverviewTable
				entries={[sarah, alex]}
				year={2026}
				monthZeroIndexed={4}
				includeZeroHourUsers
				allUsers={['Sarah Johnson', 'Alex Doe', 'Ghost User']}
			/>,
		);
		const hoursButton = screen.getByRole('button', { name: /Hours/ });
		// Click once: ascending (zero-hour user first)
		fireEvent.click(hoursButton);
		const ascRows = getDataRows();
		expect(ascRows[0]).toHaveTextContent('Ghost User');
		// Click again: descending (Sarah, with most hours, first)
		fireEvent.click(hoursButton);
		const descRows = getDataRows();
		expect(descRows[0]).toHaveTextContent('Sarah Johnson');
	});
});
