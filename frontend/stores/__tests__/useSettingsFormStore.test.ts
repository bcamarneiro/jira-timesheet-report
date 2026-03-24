import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useConfigStore } from '../useConfigStore';
import { useSettingsFormStore } from '../useSettingsFormStore';

const baseConfig = {
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
	theme: 'system' as const,
	timeRounding: 'off' as const,
};

describe('useSettingsFormStore', () => {
	beforeEach(() => {
		act(() => {
			useConfigStore.setState({ config: baseConfig });
			useSettingsFormStore.setState({
				formData: baseConfig,
				integrationTests: {
					jira: {
						loading: false,
						result: { success: true, message: 'Connected' },
					},
					gitlab: {
						loading: false,
						result: { success: false, message: 'Invalid token' },
					},
					calendar: { loading: false, result: null },
					rescuetime: { loading: true, result: null },
				},
			});
		});
	});

	it('resets integration test state when loading from config', () => {
		act(() => {
			useSettingsFormStore.getState().loadFromConfig();
		});

		expect(useSettingsFormStore.getState().formData).toEqual(baseConfig);
		expect(useSettingsFormStore.getState().integrationTests).toEqual({
			jira: { loading: false, result: null },
			gitlab: { loading: false, result: null },
			calendar: { loading: false, result: null },
			rescuetime: { loading: false, result: null },
		});
	});

	it('saves the form back to config and clears stale test results', () => {
		act(() => {
			useSettingsFormStore
				.getState()
				.updateFormField('jiraHost', 'next.example.com');
			useSettingsFormStore.getState().saveSettings();
		});

		expect(useConfigStore.getState().config.jiraHost).toBe('next.example.com');
		expect(
			useSettingsFormStore.getState().integrationTests.jira.result,
		).toBeNull();
		expect(
			useSettingsFormStore.getState().integrationTests.gitlab.result,
		).toBeNull();
	});
});
