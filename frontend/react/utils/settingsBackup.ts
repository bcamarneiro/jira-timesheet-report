import {
	createDefaultConfig,
	normalizeConfig,
	type CalendarFeed,
	type Config,
} from '../../stores/useConfigStore';
import type { CalendarMapping } from '../../stores/useUserDataStore';

type SettingsTransferKind = 'full-backup' | 'share-pack';

interface SettingsTransferBase {
	version: 2;
	kind: SettingsTransferKind;
	exportedAt: string;
	calendarMappings: CalendarMapping[];
}

export interface SettingsBackup extends SettingsTransferBase {
	kind: 'full-backup';
	config: Config;
}

export interface SettingsSharePack extends SettingsTransferBase {
	kind: 'share-pack';
	config: Partial<Config>;
}

export type SettingsTransferFile = SettingsBackup | SettingsSharePack;

function normalizeCalendarFeed(
	feed: Partial<CalendarFeed>,
): CalendarFeed | null {
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
	const pattern =
		typeof mapping.pattern === 'string' ? mapping.pattern.trim() : '';
	const issueKey =
		typeof mapping.issueKey === 'string'
			? mapping.issueKey.trim().toUpperCase()
			: '';
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

function createSharePackConfig(config: Config): Partial<Config> {
	return {
		jiraHost: config.jiraHost,
		jqlFilter: config.jqlFilter,
		allowedUsers: config.allowedUsers,
		gitlabHost: config.gitlabHost,
		calendarFeeds: config.calendarFeeds,
	};
}

export function createSettingsBackup(
	config: Config,
	calendarMappings: CalendarMapping[],
): SettingsBackup {
	return {
		version: 2,
		kind: 'full-backup',
		exportedAt: new Date().toISOString(),
		config,
		calendarMappings,
	};
}

export function createSettingsSharePack(
	config: Config,
	calendarMappings: CalendarMapping[],
): SettingsSharePack {
	return {
		version: 2,
		kind: 'share-pack',
		exportedAt: new Date().toISOString(),
		config: createSharePackConfig(config),
		calendarMappings,
	};
}

export function parseSettingsBackup(
	raw: string,
	defaultConfig: Config,
): {
	config: Config;
	calendarMappings: CalendarMapping[];
	kind: SettingsTransferKind;
} {
	let parsed: unknown;

	try {
		parsed = JSON.parse(raw);
	} catch {
		throw new Error('Invalid JSON file');
	}

	if (!parsed || typeof parsed !== 'object') {
		throw new Error('Settings backup must be a JSON object');
	}

	const data = parsed as
		| (Partial<SettingsTransferFile> & {
				config?: Partial<Config>;
				calendarMappings?: Partial<CalendarMapping>[];
		  })
		| (Partial<SettingsBackup> & {
				config?: Partial<Config>;
				calendarMappings?: Partial<CalendarMapping>[];
				version?: 1;
		  });

	if (!data.config || typeof data.config !== 'object') {
		throw new Error('Settings backup is missing a valid config object');
	}

	const kind: SettingsTransferKind =
		data.kind === 'share-pack' ? 'share-pack' : 'full-backup';
	const fallbackConfig =
		kind === 'share-pack' ? defaultConfig : createDefaultConfig();

	const config = normalizeConfig(
		{
			...data.config,
			calendarFeeds: Array.isArray(data.config.calendarFeeds)
				? data.config.calendarFeeds
						.map(normalizeCalendarFeed)
						.filter((feed): feed is CalendarFeed => feed !== null)
				: fallbackConfig.calendarFeeds,
		},
		fallbackConfig,
	);

	const calendarMappings = Array.isArray(data.calendarMappings)
		? data.calendarMappings
				.map(normalizeCalendarMapping)
				.filter((mapping): mapping is CalendarMapping => mapping !== null)
		: [];

	return { config, calendarMappings, kind };
}
