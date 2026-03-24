import { create } from 'zustand';
import type { EnrichedJiraWorklog } from '../../types/jira';

export type { EnrichedJiraWorklog, GroupedWorklogs } from '../../types/jira';

interface TimesheetState {
	// Navigation state
	currentYear: number;
	currentMonth: number; // zero-indexed 0-11
	selectedUser: string;

	// Data state
	data: EnrichedJiraWorklog[] | null;

	// Navigation actions
	setCurrentMonth: (year: number, monthZeroIndexed: number) => void;
	goPrevMonth: () => void;
	goNextMonth: () => void;
	setSelectedUser: (user: string) => void;

	// Data actions
	setData: (data: EnrichedJiraWorklog[] | null) => void;
}

export const useTimesheetStore = create<TimesheetState>((set, get) => {
	const now = new Date();
	const initialYear = now.getFullYear();
	const initialMonth = now.getMonth();

	return {
		// Initial navigation state
		currentYear: initialYear,
		currentMonth: initialMonth,
		selectedUser: '',

		// Initial data state
		data: null,

		// Navigation actions
		setCurrentMonth: (year: number, monthZeroIndexed: number) => {
			set({ currentYear: year, currentMonth: monthZeroIndexed });
		},

		goPrevMonth: () => {
			const { currentMonth, currentYear } = get();
			const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
			const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
			set({ currentMonth: newMonth, currentYear: newYear });
		},

		goNextMonth: () => {
			const { currentMonth, currentYear } = get();
			const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
			const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
			set({ currentMonth: newMonth, currentYear: newYear });
		},

		setSelectedUser: (user: string) => {
			set({ selectedUser: user });
		},

		// Data actions
		setData: (data: EnrichedJiraWorklog[] | null) => {
			set({ data });
		},
	};
});
