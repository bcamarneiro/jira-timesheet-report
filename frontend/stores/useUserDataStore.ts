import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteIssue {
	issueKey: string;
	issueSummary?: string;
	defaultTimeSpent: string; // e.g., "1h"
	defaultSeconds: number;
}

export interface CalendarMapping {
	/** Text pattern to match against event summary (case-insensitive substring) */
	pattern: string;
	issueKey: string;
	issueSummary?: string;
}

export interface RecurringTemplate {
	id: string;
	issueKey: string;
	issueSummary?: string;
	timeSpent: string;
	seconds: number;
	comment: string;
	daysOfWeek: number[]; // 0=Sun, 1=Mon, ... 6=Sat
	enabled: boolean;
}

interface UserDataState {
	favorites: FavoriteIssue[];
	templates: RecurringTemplate[];
	commentPresets: string[];
	dayNotes: Record<string, string>;
	calendarMappings: CalendarMapping[];
	addFavorite: (issue: FavoriteIssue) => void;
	removeFavorite: (issueKey: string) => void;
	addTemplate: (template: RecurringTemplate) => void;
	removeTemplate: (id: string) => void;
	toggleTemplate: (id: string) => void;
	addCommentPreset: (preset: string) => void;
	removeCommentPreset: (preset: string) => void;
	setDayNote: (date: string, note: string) => void;
	addCalendarMapping: (mapping: CalendarMapping) => void;
	removeCalendarMapping: (pattern: string) => void;
	updateCalendarMapping: (pattern: string, updated: CalendarMapping) => void;
}

export const useUserDataStore = create<UserDataState>()(
	persist(
		(set) => ({
			favorites: [],
			templates: [],
			commentPresets: [],
			dayNotes: {},
			calendarMappings: [],

			addFavorite: (issue) =>
				set((state) => {
					if (state.favorites.some((f) => f.issueKey === issue.issueKey)) {
						return state;
					}
					return { favorites: [...state.favorites, issue] };
				}),

			removeFavorite: (issueKey) =>
				set((state) => ({
					favorites: state.favorites.filter((f) => f.issueKey !== issueKey),
				})),

			addTemplate: (template) =>
				set((state) => ({
					templates: [...state.templates, template],
				})),

			removeTemplate: (id) =>
				set((state) => ({
					templates: state.templates.filter((t) => t.id !== id),
				})),

			toggleTemplate: (id) =>
				set((state) => ({
					templates: state.templates.map((t) =>
						t.id === id ? { ...t, enabled: !t.enabled } : t,
					),
				})),

			addCommentPreset: (preset) =>
				set((state) => {
					const trimmed = preset.trim();
					if (!trimmed || state.commentPresets.includes(trimmed)) {
						return state;
					}
					return { commentPresets: [...state.commentPresets, trimmed] };
				}),

			removeCommentPreset: (preset) =>
				set((state) => ({
					commentPresets: state.commentPresets.filter((p) => p !== preset),
				})),

			setDayNote: (date, note) =>
				set((state) => {
					const trimmed = note.trim();
					const updated = { ...state.dayNotes };
					if (trimmed) {
						updated[date] = trimmed;
					} else {
						delete updated[date];
					}
					return { dayNotes: updated };
				}),

			addCalendarMapping: (mapping) =>
				set((state) => {
					const normalizedPattern = mapping.pattern.trim().toLowerCase();
					if (
						!normalizedPattern ||
						state.calendarMappings.some(
							(m) => m.pattern.toLowerCase() === normalizedPattern,
						)
					) {
						return state;
					}
					return {
						calendarMappings: [...state.calendarMappings, mapping],
					};
				}),

			removeCalendarMapping: (pattern) =>
				set((state) => ({
					calendarMappings: state.calendarMappings.filter(
						(m) => m.pattern !== pattern,
					),
				})),

			updateCalendarMapping: (pattern, updated) =>
				set((state) => ({
					calendarMappings: state.calendarMappings.map((m) =>
						m.pattern === pattern ? updated : m,
					),
				})),
		}),
		{
			name: 'jira-timesheet-userdata',
			merge: (persisted, current) => {
				const persistedState = persisted as Partial<UserDataState> | undefined;
				return {
					...current,
					favorites:
						persistedState?.favorites ?? (current as UserDataState).favorites,
					templates:
						persistedState?.templates ?? (current as UserDataState).templates,
					commentPresets:
						persistedState?.commentPresets ??
						(current as UserDataState).commentPresets,
					dayNotes:
						persistedState?.dayNotes ?? (current as UserDataState).dayNotes,
					calendarMappings:
						persistedState?.calendarMappings ??
						(current as UserDataState).calendarMappings,
				};
			},
		},
	),
);
