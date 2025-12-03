import { Version2Client } from 'jira.js';
import { create } from 'zustand';
import type { Config } from './useConfigStore';
import { useConfigStore } from './useConfigStore';

interface JiraClientState {
	client: Version2Client | null;
	lastConfig: string | null; // JSON stringified config for comparison

	// Get the current client (creates or returns cached)
	getClient: () => Version2Client | null;

	// Force reinitialize the client
	reinitialize: () => void;

	// Clear the client
	clear: () => void;
}

const createClient = (config: Config): Version2Client | null => {
	if (!config.jiraHost || !config.apiToken) {
		return null;
	}

	const host = config.corsProxy
		? `${config.corsProxy.replace(/\/$/, '')}/https://${config.jiraHost}`
		: `https://${config.jiraHost}`;

	console.log('[Jira Client] Creating V2 client with config:', {
		host,
		corsProxy: config.corsProxy,
	});

	return new Version2Client({
		host,
		authentication: {
			oauth2: {
				accessToken: config.apiToken,
			},
		},
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
