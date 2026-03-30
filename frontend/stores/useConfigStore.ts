import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getPersistStorage } from './persistStorage';

export interface CalendarFeed {
	label: string;
	url: string;
	type: 'suggestion' | 'absence';
}

export interface Config {
	jiraHost: string;
	email: string;
	apiToken: string;
	corsProxy: string;
	jqlFilter: string;
	allowedUsers: string;
	canAddWorklogs: boolean;
	canEditWorklogs: boolean;
	canDeleteWorklogs: boolean;
	gitlabToken: string;
	gitlabHost: string;
	rescueTimeApiKey: string;
	calendarFeeds: CalendarFeed[];
	complianceReminderEnabled: boolean;
	theme: 'system' | 'light' | 'dark';
	timeRounding: 'off' | '15m' | '30m';
}

interface ConfigState {
	config: Config;
	setConfig: (newConfig: Config) => void;
}

export const CONFIG_STORAGE_VERSION = 2;

function normalizeHost(value: unknown): string {
	if (typeof value !== 'string') return '';

	return value
		.trim()
		.replace(/^https?:\/\//i, '')
		.replace(/\/+$/g, '');
}

function normalizeProxyUrl(value: unknown): string {
	if (typeof value !== 'string') return '';
	return value.trim().replace(/\/+$/g, '');
}

function normalizeCsvList(value: unknown): string {
	if (typeof value !== 'string') return '';

	return value
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean)
		.join(', ');
}

function normalizeCalendarFeed(
	feed: Partial<CalendarFeed> | undefined,
): CalendarFeed | null {
	const url =
		typeof feed?.url === 'string' ? feed.url.trim().replace(/\/+$/g, '') : '';
	if (!url) return null;

	return {
		label: typeof feed?.label === 'string' ? feed.label.trim() : '',
		url,
		type: feed?.type === 'absence' ? 'absence' : 'suggestion',
	};
}

export function createDefaultConfig(): Config {
	return {
		jiraHost: '',
		email: '',
		apiToken: '',
		corsProxy: '',
		jqlFilter: '',
		allowedUsers: '',
		canAddWorklogs: true,
		canEditWorklogs: true,
		canDeleteWorklogs: true,
		gitlabToken: '',
		gitlabHost: '',
		rescueTimeApiKey: '',
		calendarFeeds: [],
		complianceReminderEnabled: false,
		theme: 'system',
		timeRounding: 'off',
	};
}

export function normalizeConfig(
	config: Partial<Config> | undefined,
	fallback: Config = createDefaultConfig(),
): Config {
	return {
		...fallback,
		...config,
		jiraHost: normalizeHost(config?.jiraHost ?? fallback.jiraHost),
		email:
			typeof config?.email === 'string'
				? config.email.trim()
				: fallback.email.trim(),
		apiToken:
			typeof config?.apiToken === 'string'
				? config.apiToken.trim()
				: fallback.apiToken.trim(),
		corsProxy: normalizeProxyUrl(config?.corsProxy ?? fallback.corsProxy),
		jqlFilter:
			typeof config?.jqlFilter === 'string'
				? config.jqlFilter.trim()
				: fallback.jqlFilter,
		allowedUsers: normalizeCsvList(
			config?.allowedUsers ?? fallback.allowedUsers,
		),
		canAddWorklogs:
			typeof config?.canAddWorklogs === 'boolean'
				? config.canAddWorklogs
				: fallback.canAddWorklogs,
		canEditWorklogs:
			typeof config?.canEditWorklogs === 'boolean'
				? config.canEditWorklogs
				: fallback.canEditWorklogs,
		canDeleteWorklogs:
			typeof config?.canDeleteWorklogs === 'boolean'
				? config.canDeleteWorklogs
				: fallback.canDeleteWorklogs,
		gitlabToken:
			typeof config?.gitlabToken === 'string'
				? config.gitlabToken.trim()
				: fallback.gitlabToken.trim(),
		gitlabHost: normalizeHost(config?.gitlabHost ?? fallback.gitlabHost),
		rescueTimeApiKey:
			typeof config?.rescueTimeApiKey === 'string'
				? config.rescueTimeApiKey.trim()
				: fallback.rescueTimeApiKey.trim(),
		calendarFeeds: Array.isArray(config?.calendarFeeds)
			? config.calendarFeeds
					.map(normalizeCalendarFeed)
					.filter((feed): feed is CalendarFeed => feed !== null)
			: fallback.calendarFeeds.map((feed) => ({ ...feed })),
		complianceReminderEnabled:
			typeof config?.complianceReminderEnabled === 'boolean'
				? config.complianceReminderEnabled
				: fallback.complianceReminderEnabled,
		theme:
			config?.theme === 'light' ||
			config?.theme === 'dark' ||
			config?.theme === 'system'
				? config.theme
				: fallback.theme,
		timeRounding:
			config?.timeRounding === '15m' ||
			config?.timeRounding === '30m' ||
			config?.timeRounding === 'off'
				? config.timeRounding
				: fallback.timeRounding,
	};
}

export function migratePersistedConfigState(
	persisted: unknown,
	version: number,
): Partial<ConfigState> {
	const persistedState = persisted as Partial<ConfigState> | undefined;
	const legacyConfig = persistedState?.config;

	if (version < CONFIG_STORAGE_VERSION) {
		return {
			config: normalizeConfig(legacyConfig),
		};
	}

	return {
		config: normalizeConfig(legacyConfig),
	};
}

export const useConfigStore = create<ConfigState>()(
	persist(
		(set) => ({
			config: createDefaultConfig(),
			setConfig: (newConfig) => set({ config: normalizeConfig(newConfig) }),
		}),
		{
			name: 'jira-timesheet-config',
			storage: createJSONStorage(getPersistStorage),
			version: CONFIG_STORAGE_VERSION,
			migrate: (persistedState, version) =>
				migratePersistedConfigState(persistedState, version),
			merge: (persisted, current) => {
				const persistedState = persisted as Partial<ConfigState> | undefined;
				return {
					...current,
					config: normalizeConfig(
						persistedState?.config,
						(current as ConfigState).config,
					),
				};
			},
		},
	),
);
