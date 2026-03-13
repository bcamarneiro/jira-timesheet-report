import { create } from 'zustand';
import type { DaySummary } from '../../types/Suggestion';

function getMonday(date: Date): string {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	d.setDate(diff);
	return d.toISOString().slice(0, 10);
}

function getSunday(monday: string): string {
	const d = new Date(monday);
	d.setDate(d.getDate() + 6);
	return d.toISOString().slice(0, 10);
}

function shiftWeek(monday: string, weeks: number): string {
	const d = new Date(monday);
	d.setDate(d.getDate() + weeks * 7);
	return d.toISOString().slice(0, 10);
}

const todayMonday = getMonday(new Date());

interface DashboardState {
	weekStart: string;
	weekEnd: string;

	daySummaries: DaySummary[];

	isLoadingWorklogs: boolean;
	isLoadingJiraSuggestions: boolean;
	isLoadingGitlabSuggestions: boolean;
	isLoadingRescueTime: boolean;

	worklogsError: string | null;
	jiraSuggestionsError: string | null;
	gitlabSuggestionsError: string | null;
	rescueTimeError: string | null;

	setWeek: (start: string) => void;
	goToPrevWeek: () => void;
	goToNextWeek: () => void;
	goToCurrentWeek: () => void;
	setDaySummaries: (summaries: DaySummary[]) => void;
	markSuggestionLogged: (suggestionId: string) => void;
	dismissSuggestion: (suggestionId: string) => void;

	setLoading: (
		source: 'worklogs' | 'jira' | 'gitlab' | 'rescuetime',
		value: boolean,
	) => void;
	setError: (
		source: 'worklogs' | 'jira' | 'gitlab' | 'rescuetime',
		value: string | null,
	) => void;
}

const loadingKeys = {
	worklogs: 'isLoadingWorklogs',
	jira: 'isLoadingJiraSuggestions',
	gitlab: 'isLoadingGitlabSuggestions',
	rescuetime: 'isLoadingRescueTime',
} as const;

const errorKeys = {
	worklogs: 'worklogsError',
	jira: 'jiraSuggestionsError',
	gitlab: 'gitlabSuggestionsError',
	rescuetime: 'rescueTimeError',
} as const;

export const useDashboardStore = create<DashboardState>((set, get) => ({
	weekStart: todayMonday,
	weekEnd: getSunday(todayMonday),

	daySummaries: [],

	isLoadingWorklogs: false,
	isLoadingJiraSuggestions: false,
	isLoadingGitlabSuggestions: false,
	isLoadingRescueTime: false,

	worklogsError: null,
	jiraSuggestionsError: null,
	gitlabSuggestionsError: null,
	rescueTimeError: null,

	setWeek: (start) => set({ weekStart: start, weekEnd: getSunday(start) }),

	goToPrevWeek: () => {
		const prev = shiftWeek(get().weekStart, -1);
		set({ weekStart: prev, weekEnd: getSunday(prev) });
	},

	goToNextWeek: () => {
		const next = shiftWeek(get().weekStart, 1);
		set({ weekStart: next, weekEnd: getSunday(next) });
	},

	goToCurrentWeek: () => {
		const monday = getMonday(new Date());
		set({ weekStart: monday, weekEnd: getSunday(monday) });
	},

	setDaySummaries: (summaries) => set({ daySummaries: summaries }),

	markSuggestionLogged: (suggestionId) =>
		set((state) => ({
			daySummaries: state.daySummaries.map((day) => ({
				...day,
				suggestions: day.suggestions.map((s) =>
					s.id === suggestionId ? { ...s, logged: true } : s,
				),
			})),
		})),

	dismissSuggestion: (suggestionId) =>
		set((state) => ({
			daySummaries: state.daySummaries.map((day) => ({
				...day,
				suggestions: day.suggestions.filter((s) => s.id !== suggestionId),
			})),
		})),

	setLoading: (source, value) => set({ [loadingKeys[source]]: value }),

	setError: (source, value) => set({ [errorKeys[source]]: value }),
}));
