import type { AxiosInstance } from 'axios';
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

	console.log('[Jira Client] Creating client with config:', {
		host,
		corsProxy: config.corsProxy,
	});

	const client = new Version3Client({
		host,
		authentication: {
			basic: {
				email: config.email,
				apiToken: config.apiToken,
			},
		},
	});

	// If CORS proxy is configured, add a request interceptor to modify the URL
	if (config.corsProxy) {
		const corsProxyUrl = config.corsProxy.replace(/\/$/, '');
		const targetHost = `https://${config.jiraHost}`;

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
					console.log('[CORS Proxy] Rewriting URL to:', requestConfig.url);
				}
				return requestConfig;
			});
		}
	}

	return client;
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
