import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ReportsMonthlyView } from '../ReportsMonthlyView';

const noop = () => {};

const baseProps = {
	filteredVisibleEntries: [],
	selectedUser: '',
	isValidUser: false,
	selectedEntry: undefined,
	userEmails: {},
	issueSummaries: {},
	monthlyAbsenceDaysByUser: undefined,
	currentYear: 2025,
	currentMonth: 4,
	isLoading: false,
	hasData: true,
	hasNoData: true,
	hasNoFilteredMonthlyResults: false,
	monthlyWorklogProgress: null,
	monthlySummary: null,
	errorMessage: undefined,
	onUserChange: noop,
	onDownloadUser: noop,
};

describe('ReportsMonthlyView', () => {
	it('renders empty-state for no monthly data without throwing', () => {
		render(
			<MemoryRouter>
				<ReportsMonthlyView {...baseProps} />
			</MemoryRouter>,
		);
		expect(screen.getByText('No worklogs found')).toBeTruthy();
	});

	it('renders the error block when errorMessage is provided', () => {
		render(
			<MemoryRouter>
				<ReportsMonthlyView
					{...baseProps}
					errorMessage="Jira host not configured"
				/>
			</MemoryRouter>,
		);
		expect(screen.getByText('Unable to load timesheets')).toBeTruthy();
	});
});
