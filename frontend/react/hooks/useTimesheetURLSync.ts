import { useCallback, useEffect } from 'react';
import { useTimesheetStore } from '../../stores/useTimesheetStore';

/**
 * Hook that synchronizes URL query params with the Zustand timesheet store.
 * This replaces the old useTimesheetQueryParams hook.
 */
export function useTimesheetURLSync() {
	const currentYear = useTimesheetStore((state) => state.currentYear);
	const currentMonth = useTimesheetStore((state) => state.currentMonth);
	const selectedUser = useTimesheetStore((state) => state.selectedUser);
	const setCurrentMonth = useTimesheetStore((state) => state.setCurrentMonth);
	const setSelectedUser = useTimesheetStore((state) => state.setSelectedUser);

	const syncFromLocation = useCallback(() => {
		const params = new URLSearchParams(window.location.search);
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
	}, [setCurrentMonth, setSelectedUser]);

	// Initialize from URL params on mount
	useEffect(() => {
		syncFromLocation();
		const handlePopstate = () => syncFromLocation();
		window.addEventListener('popstate', handlePopstate);
		return () => window.removeEventListener('popstate', handlePopstate);
	}, [syncFromLocation]);

	// Sync store state to URL
	useEffect(() => {
		const url = new URL(window.location.href);
		url.searchParams.set('year', String(currentYear));
		url.searchParams.set('month', String(currentMonth + 1));

		if (selectedUser) {
			url.searchParams.set('user', selectedUser);
		} else {
			url.searchParams.delete('user');
		}

		window.history.replaceState({}, '', url.toString());
	}, [currentYear, currentMonth, selectedUser]);

	// Handle user change with URL update
	const handleSetSelectedUser = useCallback(
		(user: string) => {
			setSelectedUser(user);
			const url = new URL(window.location.href);
			if (user) {
				url.searchParams.set('user', user);
			} else {
				url.searchParams.delete('user');
			}
			url.searchParams.set('year', String(currentYear));
			url.searchParams.set('month', String(currentMonth + 1));
			window.history.pushState({}, '', url.toString());
		},
		[currentMonth, currentYear, setSelectedUser],
	);

	// Handle month change with URL update
	const handleSetCurrentMonth = useCallback(
		(year: number, monthZeroIndexed: number) => {
			setCurrentMonth(year, monthZeroIndexed);
			const url = new URL(window.location.href);
			url.searchParams.set('year', String(year));
			url.searchParams.set('month', String(monthZeroIndexed + 1));
			if (selectedUser) {
				url.searchParams.set('user', selectedUser);
			}
			window.history.pushState({}, '', url.toString());
		},
		[selectedUser, setCurrentMonth],
	);

	return {
		handleSetSelectedUser,
		handleSetCurrentMonth,
	};
}
