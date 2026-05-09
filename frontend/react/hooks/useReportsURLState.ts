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

const TREND_WEEKS_MIN = 1;
const TREND_WEEKS_MAX = 12;
const TREND_WEEKS_DEFAULT = 4;
const YEAR_MIN = 2000;
const YEAR_MAX = 2100;

function isValidWeekStart(value: string | null): value is string {
	return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function clampTrendWeeks(value: number): number {
	if (!Number.isFinite(value)) return TREND_WEEKS_DEFAULT;
	const rounded = Math.trunc(value);
	if (rounded < TREND_WEEKS_MIN) return TREND_WEEKS_MIN;
	if (rounded > TREND_WEEKS_MAX) return TREND_WEEKS_MAX;
	return rounded;
}

/**
 * Read the user= query param from the current location synchronously.
 * Exported so callers can seed initial state before the read effect runs.
 */
export function getInitialSelectedUserFromURL(): string {
	if (typeof window === 'undefined') return '';
	const params = new URLSearchParams(window.location.search);
	return params.get('user')?.trim() || '';
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

		const rawQuery = params.get('q') ?? params.get('search');
		setSearchQuery(rawQuery?.trim() || '');

		setOnlyAttentionNeeded(params.get('attention') === '1');
		setManagerMode(params.get('manager') === '1');

		const trendWeeksRaw = params.get('trendWeeks');
		if (trendWeeksRaw === null) {
			setTrendWeeks(TREND_WEEKS_DEFAULT);
		} else {
			const parsed = Number.parseInt(trendWeeksRaw, 10);
			setTrendWeeks(clampTrendWeeks(parsed));
		}

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

		const user = params.get('user')?.trim() || '';
		setSelectedUser(user);

		const yearParam = Number.parseInt(params.get('year') || '', 10);
		const monthParam = Number.parseInt(params.get('month') || '', 10);
		if (
			Number.isFinite(yearParam) &&
			yearParam >= YEAR_MIN &&
			yearParam <= YEAR_MAX &&
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

		// Always remove the legacy `search` key when writing the canonical `q`.
		url.searchParams.delete('search');
		const trimmedQuery = searchQuery.trim();
		if (trimmedQuery) {
			url.searchParams.set('q', trimmedQuery);
		} else {
			url.searchParams.delete('q');
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

		if (trendWeeks !== TREND_WEEKS_DEFAULT) {
			url.searchParams.set('trendWeeks', String(clampTrendWeeks(trendWeeks)));
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
