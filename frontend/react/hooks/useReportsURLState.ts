import { useCallback, useEffect } from 'react';
import { useTeamStore } from '../../stores/useTeamStore';
import { useTimesheetStore } from '../../stores/useTimesheetStore';

export type ReportsViewMode = 'monthly' | 'weekly';
export type ReportsSortField = 'name' | 'total' | 'gap';
export type ReportsSortDirection = 'asc' | 'desc';

type Props = {
	viewMode: ReportsViewMode;
	setViewMode: (value: ReportsViewMode) => void;
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	onlyAttentionNeeded: boolean;
	setOnlyAttentionNeeded: (value: boolean) => void;
	managerMode: boolean;
	setManagerMode: (value: boolean) => void;
	trendWeeks: number;
	setTrendWeeks: (value: number) => void;
	sortField: ReportsSortField;
	setSortField: (value: ReportsSortField) => void;
	sortDirection: ReportsSortDirection;
	setSortDirection: (value: ReportsSortDirection) => void;
};

function isValidWeekStart(value: string | null): value is string {
	return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function useReportsURLState({
	viewMode,
	setViewMode,
	searchQuery,
	setSearchQuery,
	onlyAttentionNeeded,
	setOnlyAttentionNeeded,
	managerMode,
	setManagerMode,
	trendWeeks,
	setTrendWeeks,
	sortField,
	setSortField,
	sortDirection,
	setSortDirection,
}: Props) {
	const currentYear = useTimesheetStore((state) => state.currentYear);
	const currentMonth = useTimesheetStore((state) => state.currentMonth);
	const selectedUser = useTimesheetStore((state) => state.selectedUser);
	const setCurrentMonth = useTimesheetStore((state) => state.setCurrentMonth);
	const setSelectedUser = useTimesheetStore((state) => state.setSelectedUser);
	const weekStart = useTeamStore((state) => state.weekStart);
	const setWeek = useTeamStore((state) => state.setWeek);

	const syncFromLocation = useCallback(() => {
		const params = new URLSearchParams(window.location.search);

		const nextView = params.get('view');
		setViewMode(nextView === 'monthly' ? 'monthly' : 'weekly');
		setSearchQuery(params.get('search')?.trim() || '');
		setOnlyAttentionNeeded(params.get('attention') === '1');
		setManagerMode(params.get('manager') === '1');

		const nextTrendWeeks = Number.parseInt(params.get('trendWeeks') || '', 10);
		setTrendWeeks([4, 6, 8, 12].includes(nextTrendWeeks) ? nextTrendWeeks : 6);

		const nextSortField = params.get('sort');
		if (
			nextSortField === 'name' ||
			nextSortField === 'total' ||
			nextSortField === 'gap'
		) {
			setSortField(nextSortField);
		}

		const nextSortDirection = params.get('dir');
		if (nextSortDirection === 'asc' || nextSortDirection === 'desc') {
			setSortDirection(nextSortDirection);
		}

		const user = params.get('user') || '';
		setSelectedUser(user);

		const yearParam = Number.parseInt(params.get('year') || '', 10);
		const monthParam = Number.parseInt(params.get('month') || '', 10);
		if (
			Number.isFinite(yearParam) &&
			yearParam > 1900 &&
			Number.isFinite(monthParam) &&
			monthParam >= 1 &&
			monthParam <= 12
		) {
			setCurrentMonth(yearParam, monthParam - 1);
		}

		const nextWeekStart = params.get('weekStart');
		if (isValidWeekStart(nextWeekStart)) {
			setWeek(nextWeekStart);
		}
	}, [
		setCurrentMonth,
		setManagerMode,
		setOnlyAttentionNeeded,
		setSearchQuery,
		setSelectedUser,
		setSortDirection,
		setSortField,
		setTrendWeeks,
		setViewMode,
		setWeek,
	]);

	useEffect(() => {
		syncFromLocation();
		const handlePopstate = () => syncFromLocation();
		window.addEventListener('popstate', handlePopstate);
		return () => window.removeEventListener('popstate', handlePopstate);
	}, [syncFromLocation]);

	useEffect(() => {
		const url = new URL(window.location.href);
		url.searchParams.set('view', viewMode);
		url.searchParams.set('year', String(currentYear));
		url.searchParams.set('month', String(currentMonth + 1));
		url.searchParams.set('weekStart', weekStart);
		url.searchParams.set('sort', sortField);
		url.searchParams.set('dir', sortDirection);

		if (selectedUser) {
			url.searchParams.set('user', selectedUser);
		} else {
			url.searchParams.delete('user');
		}

		if (searchQuery.trim()) {
			url.searchParams.set('search', searchQuery.trim());
		} else {
			url.searchParams.delete('search');
		}

		if (onlyAttentionNeeded) {
			url.searchParams.set('attention', '1');
		} else {
			url.searchParams.delete('attention');
		}

		if (managerMode) {
			url.searchParams.set('manager', '1');
		} else {
			url.searchParams.delete('manager');
		}

		if (managerMode || trendWeeks !== 6) {
			url.searchParams.set('trendWeeks', String(trendWeeks));
		} else {
			url.searchParams.delete('trendWeeks');
		}

		window.history.replaceState({}, '', url.toString());
	}, [
		viewMode,
		currentYear,
		currentMonth,
		selectedUser,
		searchQuery,
		onlyAttentionNeeded,
		managerMode,
		trendWeeks,
		sortField,
		sortDirection,
		weekStart,
	]);
}
