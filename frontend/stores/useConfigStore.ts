import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CalendarFeed {
	label: string;
	url: string;
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

export const useConfigStore = create<ConfigState>()(
	persist(
		(set) => ({
			config: {
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
			},
			setConfig: (newConfig) => set({ config: newConfig }),
		}),
		{
			name: 'jira-timesheet-config',
			merge: (persisted, current) => {
				const persistedState = persisted as Partial<ConfigState> | undefined;
				return {
					...current,
					config: {
						...(current as ConfigState).config,
						...persistedState?.config,
					},
				};
			},
		},
	),
);
