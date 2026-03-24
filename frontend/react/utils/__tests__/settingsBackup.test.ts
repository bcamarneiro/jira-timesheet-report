import { describe, expect, it } from 'vitest';
import {
	createSettingsBackup,
	parseSettingsBackup,
} from '../settingsBackup';

const defaultConfig = {
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
	theme: 'system' as const,
	timeRounding: 'off' as const,
};

describe('settingsBackup', () => {
	it('creates a versioned backup payload', () => {
		const backup = createSettingsBackup(defaultConfig, [
			{ pattern: 'Standup', issueKey: 'PROJ-1' },
		]);

		expect(backup.version).toBe(1);
		expect(backup.config).toEqual(defaultConfig);
		expect(backup.calendarMappings).toEqual([
			{ pattern: 'Standup', issueKey: 'PROJ-1' },
		]);
	});

	it('parses and normalizes imported backups', () => {
		const raw = JSON.stringify({
			version: 1,
			config: {
				jiraHost: ' jira.example.com ',
				email: ' user@example.com ',
				apiToken: ' secret ',
				calendarFeeds: [
					{ label: ' Work ', url: ' https://example.com/work.ics ', type: 'absence' },
					{ label: 'Ignored', url: '   ' },
				],
				timeRounding: '15m',
			},
			calendarMappings: [
				{ pattern: ' Standup ', issueKey: 'proj-10' },
				{ pattern: '', issueKey: 'proj-11' },
			],
		});

		const parsed = parseSettingsBackup(raw, defaultConfig);

		expect(parsed.config.jiraHost).toBe('jira.example.com');
		expect(parsed.config.email).toBe('user@example.com');
		expect(parsed.config.apiToken).toBe('secret');
		expect(parsed.config.timeRounding).toBe('15m');
		expect(parsed.config.calendarFeeds).toEqual([
			{
				label: 'Work',
				url: 'https://example.com/work.ics',
				type: 'absence',
			},
		]);
		expect(parsed.calendarMappings).toEqual([
			{ pattern: 'Standup', issueKey: 'PROJ-10', issueSummary: undefined },
		]);
	});

	it('rejects invalid files', () => {
		expect(() => parseSettingsBackup('not-json', defaultConfig)).toThrow(
			'Invalid JSON file',
		);
		expect(() => parseSettingsBackup('{}', defaultConfig)).toThrow(
			'Settings backup is missing a valid config object',
		);
	});
});
