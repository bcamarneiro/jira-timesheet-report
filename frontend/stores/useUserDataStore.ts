import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getPersistStorage } from './persistStorage';

/**
 * Bumped when the persisted shape changes in a way that requires
 * migration. v1 is the first explicit version (prior persisted blobs
 * had no version field; the migrate function treats them as v0 and
 * runs the same defensive normalisation).
 */
export const USER_DATA_STORAGE_VERSION = 1;

function safeArray<T>(value: unknown, fallback: T[]): T[] {
	return Array.isArray(value) ? (value as T[]) : fallback;
}

function safeStringRecord(
	value: unknown,
	fallback: Record<string, string>,
): Record<string, string> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return fallback;
	}
	const out: Record<string, string> = {};
	for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
		if (typeof k === 'string' && typeof v === 'string') {
			out[k] = v;
		}
	}
	return out;
}

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

export interface ReportPreset {
	id: string;
	label: string;
	viewMode: 'weekly' | 'monthly';
	searchQuery: string;
	onlyAttentionNeeded: boolean;
	managerMode: boolean;
	trendWeeks: number;
	sortField: 'name' | 'total' | 'gap';
	sortDirection: 'asc' | 'desc';
	selectedUser: string;
}

interface UserDataState {
	favorites: FavoriteIssue[];
	templates: RecurringTemplate[];
	commentPresets: string[];
	dayNotes: Record<string, string>;
	calendarMappings: CalendarMapping[];
	reportPresets: ReportPreset[];
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
	saveReportPreset: (preset: ReportPreset) => void;
	removeReportPreset: (id: string) => void;
}

function normalizeIssueKey(issueKey: unknown): string {
	return typeof issueKey === 'string' ? issueKey.trim().toUpperCase() : '';
}

function normalizePattern(pattern: unknown): string {
	return typeof pattern === 'string' ? pattern.trim() : '';
}

function asString(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

function normalizeFavorite(issue: FavoriteIssue): FavoriteIssue {
	const raw = issue as Partial<FavoriteIssue>;
	const seconds =
		typeof raw.defaultSeconds === 'number' &&
		Number.isFinite(raw.defaultSeconds)
			? raw.defaultSeconds
			: 0;
	const summary =
		typeof raw.issueSummary === 'string' ? raw.issueSummary.trim() : '';
	return {
		issueKey: normalizeIssueKey(raw.issueKey),
		defaultTimeSpent: asString(raw.defaultTimeSpent).trim(),
		defaultSeconds: seconds,
		issueSummary: summary || undefined,
	};
}

function normalizeTemplate(template: RecurringTemplate): RecurringTemplate {
	const raw = template as Partial<RecurringTemplate>;
	const days = Array.isArray(raw.daysOfWeek)
		? raw.daysOfWeek.filter(
				(d): d is number => typeof d === 'number' && d >= 0 && d <= 6,
			)
		: [];
	return {
		id: asString(raw.id),
		issueKey: normalizeIssueKey(raw.issueKey),
		issueSummary:
			typeof raw.issueSummary === 'string'
				? raw.issueSummary.trim() || undefined
				: undefined,
		timeSpent: asString(raw.timeSpent).trim(),
		seconds:
			typeof raw.seconds === 'number' && Number.isFinite(raw.seconds)
				? raw.seconds
				: 0,
		comment: asString(raw.comment).trim(),
		daysOfWeek: [...new Set(days)].sort((a, b) => a - b),
		enabled: raw.enabled !== false,
	};
}

function normalizeCalendarMapping(mapping: CalendarMapping): CalendarMapping {
	const raw = mapping as Partial<CalendarMapping>;
	const summary =
		typeof raw.issueSummary === 'string' ? raw.issueSummary.trim() : '';
	return {
		pattern: normalizePattern(raw.pattern),
		issueKey: normalizeIssueKey(raw.issueKey),
		issueSummary: summary || undefined,
	};
}

function normalizeReportPreset(preset: ReportPreset): ReportPreset {
	const raw = preset as Partial<ReportPreset>;
	const trendWeeks =
		typeof raw.trendWeeks === 'number' && [4, 6, 8, 12].includes(raw.trendWeeks)
			? raw.trendWeeks
			: 6;
	return {
		id: asString(raw.id).trim(),
		label: asString(raw.label).trim(),
		viewMode: raw.viewMode === 'monthly' ? 'monthly' : 'weekly',
		searchQuery: asString(raw.searchQuery).trim(),
		onlyAttentionNeeded: raw.onlyAttentionNeeded === true,
		managerMode: raw.managerMode === true,
		trendWeeks,
		sortField:
			raw.sortField === 'total' || raw.sortField === 'gap'
				? raw.sortField
				: 'name',
		sortDirection: raw.sortDirection === 'desc' ? 'desc' : 'asc',
		selectedUser: asString(raw.selectedUser).trim(),
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
			reportPresets: [],

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

			saveReportPreset: (preset) =>
				set((state) => {
					const normalized = normalizeReportPreset(preset);
					if (!normalized.id || !normalized.label) {
						return state;
					}

					const existingIndex = state.reportPresets.findIndex(
						(item) => item.id === normalized.id,
					);
					if (existingIndex === -1) {
						return {
							reportPresets: [...state.reportPresets, normalized],
						};
					}

					return {
						reportPresets: state.reportPresets.map((item) =>
							item.id === normalized.id ? normalized : item,
						),
					};
				}),

			removeReportPreset: (id) =>
				set((state) => ({
					reportPresets: state.reportPresets.filter(
						(preset) => preset.id !== id,
					),
				})),
		}),
		{
			name: 'jira-timesheet-userdata',
			storage: createJSONStorage(getPersistStorage),
			version: USER_DATA_STORAGE_VERSION,
			migrate: (persistedState, _version) => {
				// All migrations collapse to the merge function's defensive
				// path today: drop malformed entries silently and re-shape
				// arrays/records via safe* guards. Branching is explicit so
				// future schema changes can intercept here without changing
				// the caller contract.
				return persistedState;
			},
			merge: (persisted, current) => {
				const persistedState = persisted as Partial<UserDataState> | undefined;
				const currentState = current as UserDataState;
				return {
					...currentState,
					favorites: dedupeByCaseInsensitive(
						safeArray<FavoriteIssue>(
							persistedState?.favorites,
							currentState.favorites,
						)
							.map(normalizeFavorite)
							.filter((favorite) => !!favorite.issueKey),
						(favorite) => favorite.issueKey,
					),
					templates: safeArray<RecurringTemplate>(
						persistedState?.templates,
						currentState.templates,
					)
						.map(normalizeTemplate)
						.filter((template) => !!template.issueKey),
					commentPresets: dedupeByCaseInsensitive(
						safeArray<string>(
							persistedState?.commentPresets,
							currentState.commentPresets,
						).filter((p): p is string => typeof p === 'string'),
						(preset) => preset,
					),
					dayNotes: safeStringRecord(
						persistedState?.dayNotes,
						currentState.dayNotes,
					),
					calendarMappings: dedupeByCaseInsensitive(
						safeArray<CalendarMapping>(
							persistedState?.calendarMappings,
							currentState.calendarMappings,
						)
							.map(normalizeCalendarMapping)
							.filter((mapping) => !!mapping.pattern && !!mapping.issueKey),
						(mapping) => mapping.pattern,
					),
					reportPresets: dedupeByCaseInsensitive(
						safeArray<ReportPreset>(
							persistedState?.reportPresets,
							currentState.reportPresets,
						)
							.map(normalizeReportPreset)
							.filter((preset) => !!preset.id && !!preset.label),
						(preset) => preset.id,
					),
				};
			},
		},
	),
);
