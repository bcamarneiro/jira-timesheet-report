import type { Version3Models } from 'jira.js';
import { create } from 'zustand';

// Create an enriched type that includes the parent issue
export type EnrichedJiraWorklog = Version3Models.Worklog & {
	issue: Version3Models.Issue;
};

export type GroupedWorklogs = Record<
	string,
	Record<string, EnrichedJiraWorklog[]>
>;

interface TimesheetState {
	// Navigation state
	currentYear: number;
	currentMonth: number; // zero-indexed 0-11
	selectedUser: string;

	// Data state
	data: EnrichedJiraWorklog[] | null;
	isLoading: boolean;
	error: string | null;

	// Computed/derived state (cached)
	issueSummaries: Record<string, string>;
	users: string[];
	grouped: GroupedWorklogs;
	visibleEntries: [string, Record<string, EnrichedJiraWorklog[]>][];

	// Navigation actions
	setCurrentMonth: (year: number, monthZeroIndexed: number) => void;
	goPrevMonth: () => void;
	goNextMonth: () => void;
	setSelectedUser: (user: string) => void;

	// Data actions
	setData: (data: EnrichedJiraWorklog[] | null) => void;
	setLoading: (isLoading: boolean) => void;
	setError: (error: string | null) => void;

	// Helper to recompute derived state
	recomputeDerived: () => void;
}

const computeDerivedState = (
	data: EnrichedJiraWorklog[] | null,
	selectedUser: string,
) => {
	// Compute issueSummaries
	const issueSummaries: Record<string, string> = {};
	if (data) {
		for (const wl of data) {
			if (wl.issue) {
				issueSummaries[wl.issue.id] = wl.issue.fields.summary;
			}
		}
	}

	// Compute users
	const users: string[] = [];
	if (data) {
		const unique: Record<string, true> = {};
		for (const wl of data) {
			if (wl.author?.displayName) {
				unique[wl.author.displayName] = true;
			}
		}
		users.push(...Object.keys(unique).sort((a, b) => a.localeCompare(b)));
	}

	// Compute grouped
	const grouped: GroupedWorklogs = {};
	for (const wl of data || []) {
		if (wl.author?.displayName) {
			const user = wl.author.displayName;
			const date = new Date(wl.started as string).toISOString().substring(0, 10);
			if (!grouped[user]) grouped[user] = {};
			if (!grouped[user][date]) grouped[user][date] = [];
			grouped[user][date].push(wl);
		}
	}

	// Compute visibleEntries
	const visibleEntries = Object.entries(grouped).filter(
		([user]) => selectedUser === '' || user === selectedUser,
	);

	return { issueSummaries, users, grouped, visibleEntries };
};

export const useTimesheetStore = create<TimesheetState>((set, get) => {
	const nowUtc = new Date();
	const initialYear = nowUtc.getUTCFullYear();
	const initialMonth = nowUtc.getUTCMonth();

	return {
		// Initial navigation state
		currentYear: initialYear,
		currentMonth: initialMonth,
		selectedUser: '',

		// Initial data state
		data: null,
		isLoading: false,
		error: null,

		// Initial derived state
		issueSummaries: {},
		users: [],
		grouped: {},
		visibleEntries: [],

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
			const { data } = get();
			const derived = computeDerivedState(data, user);
			set({ selectedUser: user, ...derived });
		},

		// Data actions
		setData: (data: EnrichedJiraWorklog[] | null) => {
			const { selectedUser } = get();
			const derived = computeDerivedState(data, selectedUser);
			set({ data, ...derived });
		},

		setLoading: (isLoading: boolean) => {
			set({ isLoading });
		},

		setError: (error: string | null) => {
			set({ error });
		},

		// Recompute derived state (useful after manual data updates)
		recomputeDerived: () => {
			const { data, selectedUser } = get();
			const derived = computeDerivedState(data, selectedUser);
			set(derived);
		},
	};
});
