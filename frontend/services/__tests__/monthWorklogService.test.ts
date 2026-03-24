import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Config } from '../../stores/useConfigStore';
import { fetchMonthWorklogs } from '../monthWorklogService';

const baseConfig: Config = {
	jiraHost: 'example.atlassian.net',
	email: 'dev@example.com',
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

describe('fetchMonthWorklogs', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('uses embedded worklogs when the search response is complete', async () => {
		const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				total: 1,
				issues: [
					{
						id: '10000',
						key: 'PROJ-1',
						fields: {
							summary: 'Issue summary',
							worklog: {
								startAt: 0,
								maxResults: 20,
								total: 1,
								worklogs: [
									{
										id: 'w1',
										started: '2025-10-15T09:00:00.000+0000',
										timeSpentSeconds: 3600,
										author: {
											displayName: 'Alex',
											emailAddress: 'alex@example.com',
										},
									},
								],
							},
						},
					},
				],
			}),
		} as Response);

		const result = await fetchMonthWorklogs(baseConfig, 2025, 9);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(result).toHaveLength(1);
		expect(result[0]?.issue.key).toBe('PROJ-1');
	});

	it('fetches full issue worklogs when embedded worklogs are truncated', async () => {
		const fetchMock = vi
			.spyOn(global, 'fetch')
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					total: 1,
					issues: [
						{
							id: '10000',
							key: 'PROJ-1',
							fields: {
								summary: 'Issue summary',
								worklog: {
									startAt: 0,
									maxResults: 20,
									total: 30,
									worklogs: [],
								},
							},
						},
					],
				}),
			} as Response)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					worklogs: [
						{
							id: 'w2',
							started: '2025-10-20T09:00:00.000+0000',
							timeSpentSeconds: 7200,
							author: {
								displayName: 'Alex',
								emailAddress: 'alex@example.com',
							},
						},
					],
				}),
			} as Response);

		const result = await fetchMonthWorklogs(baseConfig, 2025, 9);

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock.mock.calls[1]?.[0]).toContain('/issue/PROJ-1/worklog');
		expect(result).toHaveLength(1);
		expect(result[0]?.id).toBe('w2');
	});
});
