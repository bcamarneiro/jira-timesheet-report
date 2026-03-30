import { describe, expect, it } from 'vitest';
import {
	CONFIG_STORAGE_VERSION,
	createDefaultConfig,
	migratePersistedConfigState,
	normalizeConfig,
} from '../useConfigStore';

describe('useConfigStore helpers', () => {
	it('normalizes host-like fields and CSV lists', () => {
		const config = normalizeConfig({
			jiraHost: ' https://jira.example.com/ ',
			email: ' user@example.com ',
			apiToken: ' token ',
			corsProxy: ' http://localhost:8081/ ',
			allowedUsers: ' one@example.com,  two@example.com ,, ',
			gitlabHost: ' https://gitlab.example.com/ ',
		});

		expect(config.jiraHost).toBe('jira.example.com');
		expect(config.email).toBe('user@example.com');
		expect(config.apiToken).toBe('token');
		expect(config.corsProxy).toBe('http://localhost:8081');
		expect(config.allowedUsers).toBe('one@example.com, two@example.com');
		expect(config.gitlabHost).toBe('gitlab.example.com');
	});

	it('migrates old persisted config into the current normalized shape', () => {
		const migrated = migratePersistedConfigState(
			{
				config: {
					jiraHost: ' https://jira.example.com/ ',
					calendarFeeds: [{ label: 'Work', url: ' https://calendar.test/feed ' }],
				},
			},
			0,
		);

		expect(migrated.config?.jiraHost).toBe('jira.example.com');
		expect(migrated.config?.calendarFeeds).toEqual([
			{
				label: 'Work',
				url: 'https://calendar.test/feed',
				type: 'suggestion',
			},
		]);
	});

	it('keeps the default schema complete when normalizing sparse input', () => {
		const config = normalizeConfig(
			{
				jiraHost: 'jira.example.com',
			},
			createDefaultConfig(),
		);

		expect(config).toMatchObject({
			jiraHost: 'jira.example.com',
			theme: 'system',
			timeRounding: 'off',
			canAddWorklogs: true,
		});
		expect(CONFIG_STORAGE_VERSION).toBeGreaterThan(0);
	});
});
