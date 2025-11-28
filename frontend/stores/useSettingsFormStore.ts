import { Version2Client } from 'jira.js';
import { create } from 'zustand';
import type { Config } from './useConfigStore';
import { useConfigStore } from './useConfigStore';
import { useJiraClientStore } from './useJiraClientStore';

interface SettingsFormState {
	// Form state (separate from saved config)
	formData: Config;

	// Test connection state
	isTesting: boolean;
	testResult: {
		success: boolean;
		message: string;
	} | null;

	// Actions
	updateFormField: (field: keyof Config, value: string) => void;
	loadFromConfig: () => void;
	saveSettings: () => void;
	resetForm: () => void;
	testConnection: () => Promise<void>;
}

export const useSettingsFormStore = create<SettingsFormState>((set, get) => ({
	// Initialize form data from config store
	formData: useConfigStore.getState().config,

	isTesting: false,
	testResult: null,

	updateFormField: (field: keyof Config, value: string) => {
		set((state) => ({
			formData: {
				...state.formData,
				[field]: value,
			},
		}));
	},

	loadFromConfig: () => {
		const config = useConfigStore.getState().config;
		set({ formData: config });
	},

	saveSettings: () => {
		const { formData } = get();
		useConfigStore.getState().setConfig(formData);
		// Force reinitialize the Jira client with new config
		useJiraClientStore.getState().reinitialize();
	},

	resetForm: () => {
		const config = useConfigStore.getState().config;
		set({ formData: config, testResult: null });
	},

	testConnection: async () => {
		set({ isTesting: true, testResult: null });

		try {
			const { formData } = get();

			const host = formData.corsProxy
				? `${formData.corsProxy.replace(/\/$/, '')}/https://${formData.jiraHost}`
				: `https://${formData.jiraHost}`;

			const client = new Version2Client({
				host,
				authentication: {
					oauth2: {
						accessToken: formData.apiToken,
					},
				},
			});

			const myself = await client.myself.getCurrentUser();
			set({
				testResult: {
					success: true,
					message: `Connection successful! Hello, ${myself.displayName}.`,
				},
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Connection failed.';
			set({
				testResult: { success: false, message },
			});
		} finally {
			set({ isTesting: false });
		}
	},
}));
