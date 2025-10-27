import { Version3Client } from 'jira.js';
import { create } from 'zustand';
import type { Config } from './useConfigStore';
import { useConfigStore } from './useConfigStore';

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
	},

	resetForm: () => {
		const config = useConfigStore.getState().config;
		set({ formData: config, testResult: null });
	},

	testConnection: async () => {
		set({ isTesting: true, testResult: null });

		try {
			const { formData } = get();

			// Always use the actual Jira host for the client configuration
			const host = `https://${formData.jiraHost}`;

			// If CORS proxy is configured, override the baseURL
			const baseRequestConfig = formData.corsProxy
				? {
						baseURL: `${formData.corsProxy.replace(/\/$/, '')}/https://${formData.jiraHost}`,
				  }
				: undefined;

			const client = new Version3Client({
				host,
				authentication: {
					basic: {
						email: formData.email,
						apiToken: formData.apiToken,
					},
				},
				baseRequestConfig,
			});

			const myself = await client.myself.getCurrentUser();
			if (myself) {
				set({
					testResult: {
						success: true,
						message: `Connection successful! Hello, ${myself.displayName}.`,
					},
				});
			} else {
				throw new Error('Could not verify user.');
			}
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
