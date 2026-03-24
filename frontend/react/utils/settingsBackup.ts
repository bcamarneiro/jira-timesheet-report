import type { CalendarFeed, Config } from '../../stores/useConfigStore';
import type { CalendarMapping } from '../../stores/useUserDataStore';

export interface SettingsBackup {
	version: 1;
	exportedAt: string;
	config: Config;
	calendarMappings: CalendarMapping[];
}

function normalizeCalendarFeed(feed: Partial<CalendarFeed>): CalendarFeed | null {
	const url = typeof feed.url === 'string' ? feed.url.trim() : '';
	if (!url) return null;

	return {
		label: typeof feed.label === 'string' ? feed.label.trim() : '',
		url,
		type: feed.type === 'absence' ? 'absence' : 'suggestion',
	};
}

function normalizeCalendarMapping(
	mapping: Partial<CalendarMapping>,
): CalendarMapping | null {
	const pattern = typeof mapping.pattern === 'string' ? mapping.pattern.trim() : '';
	const issueKey =
		typeof mapping.issueKey === 'string' ? mapping.issueKey.trim().toUpperCase() : '';
	if (!pattern || !issueKey) return null;

	return {
		pattern,
		issueKey,
		issueSummary:
			typeof mapping.issueSummary === 'string'
				? mapping.issueSummary.trim() || undefined
				: undefined,
	};
}

export function createSettingsBackup(
	config: Config,
	calendarMappings: CalendarMapping[],
): SettingsBackup {
	return {
		version: 1,
		exportedAt: new Date().toISOString(),
		config,
		calendarMappings,
	};
}

export function parseSettingsBackup(
	raw: string,
	defaultConfig: Config,
): { config: Config; calendarMappings: CalendarMapping[] } {
	let parsed: unknown;

	try {
		parsed = JSON.parse(raw);
	} catch {
		throw new Error('Invalid JSON file');
	}

	if (!parsed || typeof parsed !== 'object') {
		throw new Error('Settings backup must be a JSON object');
	}

	const data = parsed as Partial<SettingsBackup> & {
		config?: Partial<Config>;
		calendarMappings?: Partial<CalendarMapping>[];
	};

	if (!data.config || typeof data.config !== 'object') {
		throw new Error('Settings backup is missing a valid config object');
	}

	const config: Config = {
		...defaultConfig,
		...data.config,
		jiraHost: typeof data.config.jiraHost === 'string' ? data.config.jiraHost.trim() : defaultConfig.jiraHost,
		email: typeof data.config.email === 'string' ? data.config.email.trim() : defaultConfig.email,
		apiToken: typeof data.config.apiToken === 'string' ? data.config.apiToken.trim() : defaultConfig.apiToken,
		corsProxy: typeof data.config.corsProxy === 'string' ? data.config.corsProxy.trim() : defaultConfig.corsProxy,
		jqlFilter: typeof data.config.jqlFilter === 'string' ? data.config.jqlFilter.trim() : defaultConfig.jqlFilter,
		allowedUsers: typeof data.config.allowedUsers === 'string' ? data.config.allowedUsers.trim() : defaultConfig.allowedUsers,
		gitlabToken: typeof data.config.gitlabToken === 'string' ? data.config.gitlabToken.trim() : defaultConfig.gitlabToken,
		gitlabHost: typeof data.config.gitlabHost === 'string' ? data.config.gitlabHost.trim() : defaultConfig.gitlabHost,
		rescueTimeApiKey:
			typeof data.config.rescueTimeApiKey === 'string'
				? data.config.rescueTimeApiKey.trim()
				: defaultConfig.rescueTimeApiKey,
		calendarFeeds: Array.isArray(data.config.calendarFeeds)
			? data.config.calendarFeeds
					.map(normalizeCalendarFeed)
					.filter((feed): feed is CalendarFeed => feed !== null)
			: defaultConfig.calendarFeeds,
		complianceReminderEnabled:
			typeof data.config.complianceReminderEnabled === 'boolean'
				? data.config.complianceReminderEnabled
				: defaultConfig.complianceReminderEnabled,
		canAddWorklogs:
			typeof data.config.canAddWorklogs === 'boolean'
				? data.config.canAddWorklogs
				: defaultConfig.canAddWorklogs,
		canEditWorklogs:
			typeof data.config.canEditWorklogs === 'boolean'
				? data.config.canEditWorklogs
				: defaultConfig.canEditWorklogs,
		canDeleteWorklogs:
			typeof data.config.canDeleteWorklogs === 'boolean'
				? data.config.canDeleteWorklogs
				: defaultConfig.canDeleteWorklogs,
		theme:
			data.config.theme === 'light' ||
			data.config.theme === 'dark' ||
			data.config.theme === 'system'
				? data.config.theme
				: defaultConfig.theme,
		timeRounding:
			data.config.timeRounding === '15m' ||
			data.config.timeRounding === '30m' ||
			data.config.timeRounding === 'off'
				? data.config.timeRounding
				: defaultConfig.timeRounding,
	};

	const calendarMappings = Array.isArray(data.calendarMappings)
		? data.calendarMappings
				.map(normalizeCalendarMapping)
				.filter((mapping): mapping is CalendarMapping => mapping !== null)
		: [];

	return { config, calendarMappings };
}
