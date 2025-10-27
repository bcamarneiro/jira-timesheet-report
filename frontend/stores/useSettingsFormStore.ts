import type { AxiosInstance } from 'axios';
import { Version3Client } from 'jira.js';
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

			// Always use the actual Jira host for the client configuration
			const host = `https://${formData.jiraHost}`;

			const client = new Version3Client({
				host,
				authentication: {
					basic: {
						email: formData.email,
						apiToken: formData.apiToken,
					},
				},
			});

			// If CORS proxy is configured, add a request interceptor to modify the URL
			if (formData.corsProxy) {
				const corsProxyUrl = formData.corsProxy.replace(/\/$/, '');
				const targetHost = `https://${formData.jiraHost}`;

				// Access the internal axios instance and add an interceptor
				const axiosInstance = (client as any).instance as AxiosInstance;

				if (axiosInstance?.interceptors) {
					axiosInstance.interceptors.request.use((requestConfig) => {
						// Modify the URL to go through the CORS proxy
						if (requestConfig.url) {
							const originalUrl = requestConfig.url.startsWith('http')
								? requestConfig.url
								: `${targetHost}${requestConfig.url}`;
							requestConfig.url = `${corsProxyUrl}/${originalUrl}`;
							console.log('[CORS Proxy] Test connection rewriting URL to:', requestConfig.url);
						}
						return requestConfig;
					});
				}
			}

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
