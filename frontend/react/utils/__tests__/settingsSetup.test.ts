import { describe, expect, it } from 'vitest';
import type { Config } from '../../../stores/useConfigStore';
import type { SettingsIntegrationTests } from '../../../stores/useSettingsFormStore';
import { buildSettingsSetupModel } from '../settingsSetup';

const emptyTests: SettingsIntegrationTests = {
	jira: { loading: false, result: null },
	gitlab: { loading: false, result: null },
	calendar: { loading: false, result: null },
	rescuetime: { loading: false, result: null },
};

const baseConfig: Config = {
	jiraHost: 'jira.example.com',
	email: 'user@example.com',
	apiToken: 'token',
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

describe('buildSettingsSetupModel', () => {
	it('marks a missing Jira setup as pending', () => {
		const model = buildSettingsSetupModel(
			{
				...baseConfig,
				jiraHost: '',
				email: '',
				apiToken: '',
			},
			emptyTests,
			false,
		);

		expect(model.status).toBe('pending');
		expect(model.headline).toBe('Start with your Jira account details');
		expect(model.steps[0]?.status).toBe('pending');
		expect(model.surfaces.dashboard.status).toBe('pending');
		expect(
			model.diagnostics.find((item) => item.id === 'jira')?.detail,
		).toContain('Jira host');
	});

	it('treats a verified Jira-only setup as ready for core use', () => {
		const model = buildSettingsSetupModel(
			baseConfig,
			{
				...emptyTests,
				jira: {
					loading: false,
					result: { success: true, message: 'Connected as Bruno' },
				},
			},
			false,
		);

		expect(model.status).toBe('ready');
		expect(model.headline).toBe('Core setup is ready for Jira-only use');
		expect(model.steps.find((step) => step.id === 'signals')?.status).toBe(
			'pending',
		);
		expect(model.surfaces.dashboard.status).toBe('ready');
		expect(model.surfaces.reports.status).toBe('ready');
	});

	it('surfaces optional source failures without blocking the whole setup model', () => {
		const model = buildSettingsSetupModel(
			{
				...baseConfig,
				allowedUsers: 'one@example.com, two@example.com',
				gitlabHost: 'gitlab.example.com',
				gitlabToken: 'gl-token',
				calendarFeeds: [
					{
						label: 'Team',
						url: 'https://calendar.example.com/team.ics',
						type: 'suggestion',
					},
				],
			},
			{
				...emptyTests,
				jira: {
					loading: false,
					result: { success: true, message: 'Connected as Bruno' },
				},
				gitlab: {
					loading: false,
					result: { success: false, message: 'Invalid token' },
				},
			},
			false,
		);

		expect(model.status).toBe('ready');
		expect(model.steps.find((step) => step.id === 'signals')?.status).toBe(
			'warning',
		);
		expect(model.quickFacts.allowedUsersCount).toBe(2);
		expect(
			model.diagnostics.find((item) => item.id === 'signals')?.detail,
		).toContain('GitLab');
		expect(model.surfaces.reports.detail).toContain('2 allowed users');
	});
});
