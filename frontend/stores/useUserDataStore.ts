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
	replaceCalendarMappings: (mappings: CalendarMapping[]) => void;
}

function normalizeIssueKey(issueKey: string): string {
	return issueKey.trim().toUpperCase();
}

function normalizePattern(pattern: string): string {
	return pattern.trim();
}

function normalizeFavorite(issue: FavoriteIssue): FavoriteIssue {
	return {
		...issue,
		issueKey: normalizeIssueKey(issue.issueKey),
		defaultTimeSpent: issue.defaultTimeSpent.trim(),
		issueSummary: issue.issueSummary?.trim() || undefined,
	};
}

function normalizeTemplate(template: RecurringTemplate): RecurringTemplate {
	return {
		...template,
		issueKey: normalizeIssueKey(template.issueKey),
		issueSummary: template.issueSummary?.trim() || undefined,
		timeSpent: template.timeSpent.trim(),
		comment: template.comment.trim(),
		daysOfWeek: [...new Set(template.daysOfWeek)].sort((a, b) => a - b),
	};
}

function normalizeCalendarMapping(mapping: CalendarMapping): CalendarMapping {
	return {
		...mapping,
		pattern: normalizePattern(mapping.pattern),
		issueKey: normalizeIssueKey(mapping.issueKey),
		issueSummary: mapping.issueSummary?.trim() || undefined,
	};
}

function dedupeByCaseInsensitive<T>(
	items: T[],
	getKey: (item: T) => string,
): T[] {
	const seen = new Set<string>();
	const result: T[] = [];

	for (const item of items) {
		const key = getKey(item).trim().toLowerCase();
		if (!key || seen.has(key)) continue;
		seen.add(key);
		result.push(item);
	}

	return result;
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
					const normalized = normalizeFavorite(issue);
					if (
						!normalized.issueKey ||
						state.favorites.some((f) => f.issueKey === normalized.issueKey)
					) {
						return state;
					}
					return { favorites: [...state.favorites, normalized] };
				}),

			removeFavorite: (issueKey) =>
				set((state) => ({
					favorites: state.favorites.filter(
						(f) => f.issueKey !== normalizeIssueKey(issueKey),
					),
				})),

			addTemplate: (template) =>
				set((state) => {
					const normalized = normalizeTemplate(template);
					const duplicate = state.templates.some(
						(existing) =>
							existing.issueKey === normalized.issueKey &&
							existing.timeSpent === normalized.timeSpent &&
							existing.comment === normalized.comment &&
							existing.enabled === normalized.enabled &&
							existing.daysOfWeek.join(',') === normalized.daysOfWeek.join(','),
					);
					if (!normalized.issueKey || duplicate) {
						return state;
					}
					return {
						templates: [...state.templates, normalized],
					};
				}),

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
					if (
						!trimmed ||
						state.commentPresets.some(
							(existing) => existing.toLowerCase() === trimmed.toLowerCase(),
						)
					) {
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
					const normalized = normalizeCalendarMapping(mapping);
					const normalizedPattern = normalized.pattern.toLowerCase();
					if (
						!normalized.pattern ||
						!normalized.issueKey ||
						state.calendarMappings.some(
							(m) => m.pattern.toLowerCase() === normalizedPattern,
						)
					) {
						return state;
					}
					return {
						calendarMappings: [...state.calendarMappings, normalized],
					};
				}),

			removeCalendarMapping: (pattern) =>
				set((state) => ({
					calendarMappings: state.calendarMappings.filter(
						(m) => m.pattern.toLowerCase() !== pattern.trim().toLowerCase(),
					),
				})),

			updateCalendarMapping: (pattern, updated) =>
				set((state) => {
					const normalizedPattern = pattern.trim().toLowerCase();
					const normalized = normalizeCalendarMapping(updated);
					if (!normalized.pattern || !normalized.issueKey) {
						return state;
					}
					const isDuplicate = state.calendarMappings.some(
						(m) =>
							m.pattern.toLowerCase() === normalized.pattern.toLowerCase() &&
							m.pattern.toLowerCase() !== normalizedPattern,
					);
					if (isDuplicate) {
						return state;
					}
					return {
						calendarMappings: state.calendarMappings.map((m) =>
							m.pattern.toLowerCase() === normalizedPattern ? normalized : m,
						),
					};
				}),

			replaceCalendarMappings: (mappings) =>
				set({
					calendarMappings: dedupeByCaseInsensitive(
						mappings
							.map(normalizeCalendarMapping)
							.filter((mapping) => !!mapping.pattern && !!mapping.issueKey),
						(mapping) => mapping.pattern,
					),
				}),
		}),
		{
			name: 'jira-timesheet-userdata',
			merge: (persisted, current) => {
				const persistedState = persisted as Partial<UserDataState> | undefined;
				return {
					...current,
					favorites: dedupeByCaseInsensitive(
						(persistedState?.favorites ?? (current as UserDataState).favorites)
							.map(normalizeFavorite)
							.filter((favorite) => !!favorite.issueKey),
						(favorite) => favorite.issueKey,
					),
					templates: (
						persistedState?.templates ?? (current as UserDataState).templates
					)
						.map(normalizeTemplate)
						.filter((template) => !!template.issueKey),
					commentPresets: dedupeByCaseInsensitive(
						persistedState?.commentPresets ??
							(current as UserDataState).commentPresets,
						(preset) => preset,
					),
					dayNotes:
						persistedState?.dayNotes ?? (current as UserDataState).dayNotes,
					calendarMappings: dedupeByCaseInsensitive(
						(
							persistedState?.calendarMappings ??
							(current as UserDataState).calendarMappings
						)
							.map(normalizeCalendarMapping)
							.filter((mapping) => !!mapping.pattern && !!mapping.issueKey),
						(mapping) => mapping.pattern,
					),
				};
			},
		},
	),
);
