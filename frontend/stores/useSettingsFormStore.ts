import { Version2Client } from 'jira.js';
import { create } from 'zustand';
import type { Config } from './useConfigStore';
import { useConfigStore } from './useConfigStore';
import { useJiraClientStore } from './useJiraClientStore';

interface IntegrationTestResult {
	loading: boolean;
	result: { success: boolean; message: string } | null;
}

interface SettingsFormState {
	// Form state (separate from saved config)
	formData: Config;

	// Per-integration test state
	integrationTests: {
		jira: IntegrationTestResult;
		gitlab: IntegrationTestResult;
		calendar: IntegrationTestResult;
		rescuetime: IntegrationTestResult;
	};

	// Actions
	updateFormField: <K extends keyof Config>(field: K, value: Config[K]) => void;
	loadFromConfig: () => void;
	saveSettings: () => void;
	resetForm: () => void;
	testJira: () => Promise<void>;
	testGitlab: () => Promise<void>;
	testCalendar: () => Promise<void>;
	testRescueTime: () => Promise<void>;
}

const emptyTest: IntegrationTestResult = { loading: false, result: null };

export const useSettingsFormStore = create<SettingsFormState>((set, get) => ({
	// Initialize form data from config store
	formData: useConfigStore.getState().config,

	integrationTests: {
		jira: { ...emptyTest },
		gitlab: { ...emptyTest },
		calendar: { ...emptyTest },
		rescuetime: { ...emptyTest },
	},

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
		set({
			formData: config,
			integrationTests: {
				jira: { ...emptyTest },
				gitlab: { ...emptyTest },
				calendar: { ...emptyTest },
				rescuetime: { ...emptyTest },
			},
		});
	},

	testJira: async () => {
		set((s) => ({
			integrationTests: {
				...s.integrationTests,
				jira: { loading: true, result: null },
			},
		}));

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

			const startTime = performance.now();
			const myself = await client.myself.getCurrentUser();
			const duration = Math.round(performance.now() - startTime);
			console.log(`[Test] Jira OK in ${duration}ms: ${myself.displayName}`);

			// Auto-detect worklog permissions
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
					set((state) => ({
						formData: {
							...state.formData,
							canAddWorklogs: canAdd,
							canEditWorklogs: canEdit,
							canDeleteWorklogs: canDelete,
						},
					}));
				}
			} catch {
				// permissions check is optional
			}

			set((s) => ({
				integrationTests: {
					...s.integrationTests,
					jira: {
						loading: false,
						result: {
							success: true,
							message: `Connected as ${myself.displayName}`,
						},
					},
				},
			}));
		} catch (error) {
			console.error('[Test] Jira failed:', error);
			set((s) => ({
				integrationTests: {
					...s.integrationTests,
					jira: {
						loading: false,
						result: {
							success: false,
							message:
								error instanceof Error ? error.message : 'Connection failed',
						},
					},
				},
			}));
		}
	},

	testGitlab: async () => {
		set((s) => ({
			integrationTests: {
				...s.integrationTests,
				gitlab: { loading: true, result: null },
			},
		}));

		try {
			const { formData } = get();
			if (!formData.gitlabToken || !formData.gitlabHost) {
				throw new Error('GitLab host and token are required');
			}

			const cleanHost = formData.gitlabHost
				.replace(/^https?:\/\//, '')
				.replace(/\/$/, '');
			const gitlabOrigin = `https://${cleanHost}`;
			const baseUrl = formData.corsProxy
				? `${formData.corsProxy.replace(/\/$/, '')}/${gitlabOrigin}`
				: gitlabOrigin;

			const res = await fetch(`${baseUrl}/api/v4/user`, {
				headers: {
					'PRIVATE-TOKEN': formData.gitlabToken,
					Accept: 'application/json',
				},
			});

			if (!res.ok) {
				if (res.status === 401) throw new Error('Invalid GitLab token');
				throw new Error(`GitLab API error: ${res.status}`);
			}

			const user = (await res.json()) as { username: string };
			set((s) => ({
				integrationTests: {
					...s.integrationTests,
					gitlab: {
						loading: false,
						result: {
							success: true,
							message: `Connected as @${user.username}`,
						},
					},
				},
			}));
		} catch (error) {
			console.error('[Test] GitLab failed:', error);
			set((s) => ({
				integrationTests: {
					...s.integrationTests,
					gitlab: {
						loading: false,
						result: {
							success: false,
							message:
								error instanceof Error ? error.message : 'Connection failed',
						},
					},
				},
			}));
		}
	},

	testCalendar: async () => {
		set((s) => ({
			integrationTests: {
				...s.integrationTests,
				calendar: { loading: true, result: null },
			},
		}));

		try {
			const { formData } = get();
			const feeds = (formData.calendarFeeds ?? []).filter((f) => f.url.trim());
			if (feeds.length === 0) {
				throw new Error('No calendar feeds configured');
			}

			const results: string[] = [];
			for (const feed of feeds) {
				const url = formData.corsProxy
					? `${formData.corsProxy.replace(/\/$/, '')}/${feed.url}`
					: feed.url;
				const res = await fetch(url);
				if (!res.ok) {
					throw new Error(
						`Feed "${feed.label || feed.url}" returned ${res.status}`,
					);
				}
				const text = await res.text();
				if (!text.includes('BEGIN:VCALENDAR')) {
					throw new Error(
						`Feed "${feed.label || feed.url}" is not a valid ICS file`,
					);
				}
				const eventCount = (text.match(/BEGIN:VEVENT/g) || []).length;
				results.push(
					`${feed.label || 'Feed'}: ${eventCount} event${eventCount !== 1 ? 's' : ''}`,
				);
			}

			set((s) => ({
				integrationTests: {
					...s.integrationTests,
					calendar: {
						loading: false,
						result: {
							success: true,
							message: results.join(', '),
						},
					},
				},
			}));
		} catch (error) {
			console.error('[Test] Calendar failed:', error);
			set((s) => ({
				integrationTests: {
					...s.integrationTests,
					calendar: {
						loading: false,
						result: {
							success: false,
							message:
								error instanceof Error ? error.message : 'Connection failed',
						},
					},
				},
			}));
		}
	},

	testRescueTime: async () => {
		set((s) => ({
			integrationTests: {
				...s.integrationTests,
				rescuetime: { loading: true, result: null },
			},
		}));

		try {
			const { formData } = get();
			if (!formData.rescueTimeApiKey) {
				throw new Error('RescueTime API key is required');
			}

			const today = new Date().toISOString().slice(0, 10);
			const params = new URLSearchParams({
				key: formData.rescueTimeApiKey,
				perspective: 'interval',
				restrict_kind: 'activity',
				resolution_time: 'day',
				restrict_begin: today,
				restrict_end: today,
				format: 'json',
			});

			const baseUrl = 'https://www.rescuetime.com/anapi/data';
			const url = formData.corsProxy
				? `${formData.corsProxy.replace(/\/$/, '')}/${baseUrl}?${params}`
				: `${baseUrl}?${params}`;

			const res = await fetch(url);
			if (!res.ok) {
				if (res.status === 403) throw new Error('Invalid RescueTime API key');
				throw new Error(`RescueTime API error: ${res.status}`);
			}

			const data = (await res.json()) as { rows: unknown[] };
			set((s) => ({
				integrationTests: {
					...s.integrationTests,
					rescuetime: {
						loading: false,
						result: {
							success: true,
							message: `Connected — ${data.rows.length} activit${data.rows.length !== 1 ? 'ies' : 'y'} today`,
						},
					},
				},
			}));
		} catch (error) {
			console.error('[Test] RescueTime failed:', error);
			set((s) => ({
				integrationTests: {
					...s.integrationTests,
					rescuetime: {
						loading: false,
						result: {
							success: false,
							message:
								error instanceof Error ? error.message : 'Connection failed',
						},
					},
				},
			}));
		}
	},
}));
