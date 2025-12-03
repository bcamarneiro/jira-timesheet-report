import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Config {
	jiraHost: string;
	email: string;
	apiToken: string;
	corsProxy: string;
	jqlFilter: string;
	allowedUsers: string;
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
			},
			setConfig: (newConfig) => set({ config: newConfig }),
		}),
		{
			name: 'jira-timesheet-config',
		},
	),
);
