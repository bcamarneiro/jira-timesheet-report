import { Version3Client } from 'jira.js';
import { create } from 'zustand';
import type { Config } from './useConfigStore';
import { useConfigStore } from './useConfigStore';

interface JiraClientState {
	client: Version3Client | null;
	lastConfig: string | null; // JSON stringified config for comparison

	// Get the current client (creates or returns cached)
	getClient: () => Version3Client | null;

	// Force reinitialize the client
	reinitialize: () => void;

	// Clear the client
	clear: () => void;
}

const createClient = (config: Config): Version3Client | null => {
	if (!config.jiraHost || !config.apiToken) {
		return null;
	}

	// Always use the actual Jira host for the client configuration
	const host = `https://${config.jiraHost}`;

	// If CORS proxy is configured, override the baseURL
	const baseRequestConfig = config.corsProxy
		? {
				baseURL: `${config.corsProxy.replace(/\/$/, '')}/https://${config.jiraHost}`,
		  }
		: undefined;

	return new Version3Client({
		host,
		authentication: {
			basic: {
				email: config.email,
				apiToken: config.apiToken,
			},
		},
		baseRequestConfig,
	});
};

const configToKey = (config: Config): string => {
	return JSON.stringify({
		jiraHost: config.jiraHost,
		email: config.email,
		apiToken: config.apiToken,
		corsProxy: config.corsProxy,
	});
};

export const useJiraClientStore = create<JiraClientState>((set, get) => ({
	client: null,
	lastConfig: null,

	getClient: () => {
		const { client, lastConfig } = get();
		const currentConfig = useConfigStore.getState().config;
		const currentConfigKey = configToKey(currentConfig);

		// If config hasn't changed and we have a client, return it
		if (client && lastConfig === currentConfigKey) {
			return client;
		}

		// Config changed or no client exists, create new one
		const newClient = createClient(currentConfig);
		set({ client: newClient, lastConfig: currentConfigKey });
		return newClient;
	},

	reinitialize: () => {
		const currentConfig = useConfigStore.getState().config;
		const newClient = createClient(currentConfig);
		const currentConfigKey = configToKey(currentConfig);
		set({ client: newClient, lastConfig: currentConfigKey });
	},

	clear: () => {
		set({ client: null, lastConfig: null });
	},
}));
