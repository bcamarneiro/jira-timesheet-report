import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ReportsWeeklyView } from '../ReportsWeeklyView';

const noop = () => {};

const baseProps = {
	teamMembers: [],
	sortedMembers: [],
	weekStart: '2025-05-05',
	weekLoading: false,
	weekFetching: false,
	teamError: null,
	teamLoadingProgress: null,
	sortField: 'name' as const,
	sortDirection: 'asc' as const,
	onSort: noop,
	managerMode: false,
	trendWeeks: 6,
	setTrendWeeks: noop,
	trendModel: undefined,
	trendsLoading: false,
	trendsError: undefined,
	hasNoFilteredWeeklyResults: false,
	weeklySummary: null,
	onMemberClick: noop,
};

describe('ReportsWeeklyView', () => {
	it('renders the empty-team state without throwing', () => {
		render(
			<MemoryRouter>
				<ReportsWeeklyView {...baseProps} />
			</MemoryRouter>,
		);
		expect(screen.getByText('No team data found')).toBeTruthy();
	});

	it('renders the team error block when teamError is provided', () => {
		render(
			<MemoryRouter>
				<ReportsWeeklyView
					{...baseProps}
					teamError={new Error('Permission denied')}
				/>
			</MemoryRouter>,
		);
		expect(screen.getByText('Unable to load team data')).toBeTruthy();
		expect(screen.getByText('Permission denied')).toBeTruthy();
	});
});
