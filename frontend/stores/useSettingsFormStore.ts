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
	updateFormField: <K extends keyof Config>(field: K, value: Config[K]) => void;
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

	updateFormField: <K extends keyof Config>(field: K, value: Config[K]) => {
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

			console.log(`[Test] Connecting to ${host}`);
			console.log(
				`[Test] Jira host: ${formData.jiraHost} | Proxy: ${formData.corsProxy || 'none'}`,
			);
			const tokenPreview = formData.apiToken
				? `${formData.apiToken.substring(0, 8)}...`
				: 'empty';
			console.log(`[Test] Token: ${tokenPreview}`);

			const client = new Version2Client({
				host,
				authentication: {
					oauth2: {
						accessToken: formData.apiToken,
					},
				},
			});

			const startTime = performance.now();
			const myself = await client.myself.getCurrentUser();
			const duration = Math.round(performance.now() - startTime);

			console.log(`[Test] Success in ${duration}ms: ${myself.displayName}`);

			// Try to auto-detect worklog permissions
			try {
				const perms = await client.permissions.getMyPermissions({
					permissions:
						'WORK_ON_ISSUES,EDIT_ALL_WORKLOGS,EDIT_OWN_WORKLOGS,DELETE_ALL_WORKLOGS,DELETE_OWN_WORKLOGS',
				});
				const p = (
					perms as { permissions?: Record<string, { havePermission: boolean }> }
				).permissions;
				if (p) {
					const canAdd = p.WORK_ON_ISSUES?.havePermission ?? true;
					const canEdit =
						(p.EDIT_ALL_WORKLOGS?.havePermission ||
							p.EDIT_OWN_WORKLOGS?.havePermission) ??
						true;
					const canDelete =
						(p.DELETE_ALL_WORKLOGS?.havePermission ||
							p.DELETE_OWN_WORKLOGS?.havePermission) ??
						true;
					console.log(
						`[Test] Permissions detected — add: ${canAdd}, edit: ${canEdit}, delete: ${canDelete}`,
					);
					set((state) => ({
						formData: {
							...state.formData,
							canAddWorklogs: canAdd,
							canEditWorklogs: canEdit,
							canDeleteWorklogs: canDelete,
						},
					}));
				}
			} catch (permError) {
				console.warn(
					'[Test] Could not detect worklog permissions, using defaults',
					permError,
				);
			}

			set({
				testResult: {
					success: true,
					message: `Connection successful! Hello, ${myself.displayName}.`,
				},
			});
		} catch (error) {
			console.error('[Test] Connection failed:', error);
			if (error instanceof Error) {
				console.error(`[Test] Name: ${error.name} | Message: ${error.message}`);
				if ('status' in error)
					console.error(
						`[Test] HTTP Status: ${(error as { status: number }).status}`,
					);
				if ('response' in error) {
					const resp = (
						error as {
							response: { data?: unknown; status?: number; headers?: unknown };
						}
					).response;
					console.error(`[Test] Response status: ${resp?.status}`);
					console.error(`[Test] Response body:`, resp?.data);
					console.error(`[Test] Response headers:`, resp?.headers);
				}
			}
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
