import { create } from 'zustand';
import type { DaySummary, WorklogSuggestion } from '../../types/Suggestion';
import type { WorklogFetchProgress } from '../../types/worklogLoading';
import {
	addDaysToIsoDate,
	getMondayOfWeek,
	parseIsoDateLocal,
	toLocalDateString,
} from '../react/utils/date';
import {
	distributeSuggestionsToFillGap,
	roundingStepSeconds,
} from '../services/suggestionMerger';
import { useConfigStore } from './useConfigStore';

function formatTimeSpent(seconds: number): string {
	const hours = seconds / 3600;
	if (hours >= 1) {
		const h = Math.floor(hours);
		const remaining = seconds % 3600;
		return remaining > 0 ? `${h}h ${Math.round(remaining / 60)}m` : `${h}h`;
	}
	return `${Math.round(seconds / 60)}m`;
}


function getSunday(monday: string): string {
	return addDaysToIsoDate(monday, 6);
}

function shiftWeek(monday: string, weeks: number): string {
	const d = parseIsoDateLocal(monday);
	d.setDate(d.getDate() + weeks * 7);
	return toLocalDateString(d);
}

const todayMonday = getMondayOfWeek(new Date());

export interface WeekWorklogEntry {
	date: string;
	issueKey: string;
	issueSummary?: string;
	timeSpentSeconds: number;
	/** ISO timestamp the worklog was created in Jira (used for backdate detection). */
	created?: string;
	/** Worklog comment, used by classifiers to detect retroactive logging. */
	comment?: string;
}

/**
 * A "ghost reconciliation" — a worklog whose intendedFor falls in the visible
 * week but whose loggedOn falls outside it. Surfaces on its intended day as a
 * non-counting placeholder, mirroring the Reports Monthly contract. Ghost
 * seconds NEVER contribute to a day's loggedSeconds or gapSeconds.
 */
export interface WeekGhostEntry {
	/** Same as intendedFor — the day the ghost should render on. */
	date: string;
	/** ISO date the worklog was actually logged (loggedOn from classifier). */
	loggedOn: string;
	/** ISO date the work was intended for. */
	intendedFor: string;
	/** Calendar days between intendedFor and loggedOn. */
	daysLate: number;
	issueKey?: string;
	issueSummary?: string;
	timeSpentSeconds: number;
}

interface DashboardState {
	weekStart: string;
	weekEnd: string;

	daySummaries: DaySummary[];
	weekWorklogs: WeekWorklogEntry[];
	weekGhosts: WeekGhostEntry[];

	isLoadingWorklogs: boolean;
	isLoadingJiraSuggestions: boolean;
	isLoadingGitlabSuggestions: boolean;
	isLoadingCalendarSuggestions: boolean;
	isLoadingRescueTime: boolean;

	worklogsError: string | null;
	jiraSuggestionsError: string | null;
	gitlabSuggestionsError: string | null;
	calendarSuggestionsError: string | null;
	rescueTimeError: string | null;

	lastFetchedAt: string | null;
	worklogsLoadingProgress: WorklogFetchProgress | null;
	setLastFetchedAt: (ts: string | null) => void;
	setWorklogsLoadingProgress: (progress: WorklogFetchProgress | null) => void;

	setWeek: (start: string) => void;
	goToPrevWeek: () => void;
	goToNextWeek: () => void;
	goToCurrentWeek: () => void;
	setDaySummaries: (summaries: DaySummary[]) => void;
	setWeekWorklogs: (worklogs: WeekWorklogEntry[]) => void;
	setWeekGhosts: (ghosts: WeekGhostEntry[]) => void;
	markSuggestionLogged: (suggestionId: string) => void;
	unmarkSuggestionLogged: (suggestionId: string) => void;
	markMultipleSuggestionsLogged: (ids: string[]) => void;
	unmarkMultipleSuggestionsLogged: (ids: string[]) => void;
	dismissSuggestion: (suggestionId: string) => void;
	mergePreviousWeekSuggestions: (suggestions: WorklogSuggestion[]) => void;
	adjustSuggestionTime: (suggestionId: string, deltaSeconds: number) => void;
	fillDayGap: (date: string) => void;

	setLoading: (
		source: 'worklogs' | 'jira' | 'gitlab' | 'calendar' | 'rescuetime',
		value: boolean,
	) => void;
	setError: (
		source: 'worklogs' | 'jira' | 'gitlab' | 'calendar' | 'rescuetime',
		value: string | null,
	) => void;
}

const loadingKeys = {
	worklogs: 'isLoadingWorklogs',
	jira: 'isLoadingJiraSuggestions',
	gitlab: 'isLoadingGitlabSuggestions',
	calendar: 'isLoadingCalendarSuggestions',
	rescuetime: 'isLoadingRescueTime',
} as const;

const errorKeys = {
	worklogs: 'worklogsError',
	jira: 'jiraSuggestionsError',
	gitlab: 'gitlabSuggestionsError',
	calendar: 'calendarSuggestionsError',
	rescuetime: 'rescueTimeError',
} as const;

export const useDashboardStore = create<DashboardState>((set, get) => ({
	weekStart: todayMonday,
	weekEnd: getSunday(todayMonday),

	daySummaries: [],
	weekWorklogs: [],
	weekGhosts: [],

	isLoadingWorklogs: false,
	isLoadingJiraSuggestions: false,
	isLoadingGitlabSuggestions: false,
	isLoadingCalendarSuggestions: false,
	isLoadingRescueTime: false,

	worklogsError: null,
	jiraSuggestionsError: null,
	gitlabSuggestionsError: null,
	calendarSuggestionsError: null,
	rescueTimeError: null,

	lastFetchedAt: null,
	worklogsLoadingProgress: null,
	setLastFetchedAt: (ts) => set({ lastFetchedAt: ts }),
	setWorklogsLoadingProgress: (progress) =>
		set({ worklogsLoadingProgress: progress }),

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
		const monday = getMondayOfWeek(new Date());
		set({ weekStart: monday, weekEnd: getSunday(monday) });
	},

	setDaySummaries: (summaries) => set({ daySummaries: summaries }),

	setWeekWorklogs: (worklogs) => set({ weekWorklogs: worklogs }),

	setWeekGhosts: (ghosts) => set({ weekGhosts: ghosts }),

	markSuggestionLogged: (suggestionId) =>
		set((state) => ({
			daySummaries: state.daySummaries.map((day) => {
				const s = day.suggestions.find((s) => s.id === suggestionId);
				const added = s && !s.logged ? s.suggestedSeconds : 0;
				return {
					...day,
					loggedSeconds: day.loggedSeconds + added,
					gapSeconds: Math.max(0, day.gapSeconds - added),
					suggestions: day.suggestions.map((s) =>
						s.id === suggestionId ? { ...s, logged: true } : s,
					),
				};
			}),
		})),

	unmarkSuggestionLogged: (suggestionId) =>
		set((state) => ({
			daySummaries: state.daySummaries.map((day) => {
				const s = day.suggestions.find((s) => s.id === suggestionId);
				const removed = s?.logged ? s.suggestedSeconds : 0;
				return {
					...day,
					loggedSeconds: Math.max(0, day.loggedSeconds - removed),
					gapSeconds: day.gapSeconds + removed,
					suggestions: day.suggestions.map((s) =>
						s.id === suggestionId ? { ...s, logged: false } : s,
					),
				};
			}),
		})),

	markMultipleSuggestionsLogged: (ids) =>
		set((state) => {
			const idSet = new Set(ids);
			return {
				daySummaries: state.daySummaries.map((day) => {
					let added = 0;
					for (const s of day.suggestions) {
						if (idSet.has(s.id) && !s.logged) added += s.suggestedSeconds;
					}
					return {
						...day,
						loggedSeconds: day.loggedSeconds + added,
						gapSeconds: Math.max(0, day.gapSeconds - added),
						suggestions: day.suggestions.map((s) =>
							idSet.has(s.id) ? { ...s, logged: true } : s,
						),
					};
				}),
			};
		}),

	unmarkMultipleSuggestionsLogged: (ids) =>
		set((state) => {
			const idSet = new Set(ids);
			return {
				daySummaries: state.daySummaries.map((day) => {
					let removed = 0;
					for (const s of day.suggestions) {
						if (idSet.has(s.id) && s.logged) removed += s.suggestedSeconds;
					}
					return {
						...day,
						loggedSeconds: Math.max(0, day.loggedSeconds - removed),
						gapSeconds: day.gapSeconds + removed,
						suggestions: day.suggestions.map((s) =>
							idSet.has(s.id) ? { ...s, logged: false } : s,
						),
					};
				}),
			};
		}),

	dismissSuggestion: (suggestionId) =>
		set((state) => {
			const timeRounding = useConfigStore.getState().config.timeRounding;
			return {
				daySummaries: state.daySummaries.map((day) => {
					const hasSuggestion = day.suggestions.some(
						(s) => s.id === suggestionId,
					);
					if (!hasSuggestion) return day;

					const remaining = day.suggestions.filter(
						(s) => s.id !== suggestionId,
					);
					const active = remaining.filter((s) => !s.logged);
					const logged = remaining.filter((s) => s.logged);

					if (active.length === 0 || day.gapSeconds <= 0) {
						return { ...day, suggestions: remaining };
					}

					const redistributed = distributeSuggestionsToFillGap(
						active,
						day.gapSeconds,
						timeRounding,
					);
					return { ...day, suggestions: [...redistributed, ...logged] };
				}),
			};
		}),

	mergePreviousWeekSuggestions: (suggestions) =>
		set((state) => ({
			daySummaries: state.daySummaries.map((day) => {
				// Find suggestions that target this day
				const newForDay = suggestions.filter((s) => s.date === day.date);
				if (newForDay.length === 0) return day;

				// Build a set of issue keys already present (logged or suggested)
				const existingKeys = new Set<string>();
				for (const s of day.suggestions) {
					existingKeys.add(s.issueKey);
				}

				// Only add suggestions for issues not already present
				const toAdd = newForDay.filter((s) => !existingKeys.has(s.issueKey));
				if (toAdd.length === 0) return day;

				return {
					...day,
					suggestions: [...day.suggestions, ...toAdd],
				};
			}),
		})),

	adjustSuggestionTime: (suggestionId, deltaSeconds) =>
		set((state) => {
			const rounding = useConfigStore.getState().config.timeRounding;
			const step = roundingStepSeconds(rounding);
			return {
				daySummaries: state.daySummaries.map((day) => ({
					...day,
					suggestions: day.suggestions.map((s) => {
						if (s.id !== suggestionId) return s;
						const raw = s.suggestedSeconds + deltaSeconds;
						// Snap to the nearest interval
						const snapped = Math.round(raw / step) * step;
						const newSeconds = Math.max(step, snapped);
						return {
							...s,
							suggestedSeconds: newSeconds,
							suggestedTimeSpent: formatTimeSpent(newSeconds),
						};
					}),
				})),
			};
		}),

	fillDayGap: (date) =>
		set((state) => {
			const timeRounding = useConfigStore.getState().config.timeRounding;
			return {
				daySummaries: state.daySummaries.map((day) => {
					if (day.date !== date) return day;
					const active = day.suggestions.filter((s) => !s.logged);
					if (active.length === 0 || day.gapSeconds <= 0) return day;
					const scaled = distributeSuggestionsToFillGap(
						active,
						day.gapSeconds,
						timeRounding,
					);
					const logged = day.suggestions.filter((s) => s.logged);
					return { ...day, suggestions: [...scaled, ...logged] };
				}),
			};
		}),

	setLoading: (source, value) =>
		set((state) =>
			state[loadingKeys[source]] === value
				? state
				: { [loadingKeys[source]]: value },
		),

	setError: (source, value) =>
		set((state) =>
			state[errorKeys[source]] === value
				? state
				: { [errorKeys[source]]: value },
		),
}));
