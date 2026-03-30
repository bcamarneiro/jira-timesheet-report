import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getPersistStorage } from './persistStorage';

interface UIPreferences {
	hideWeekends: boolean;
	compactView: boolean;
}

interface UIState {
	// Current active tab/page
	selectedTab: 'home' | 'timesheet' | 'settings';

	// User preferences
	preferences: UIPreferences;

	// Filters
	selectedProject: string;

	// Expanded state for collapsible sections (user: boolean)
	expandedUsers: Record<string, boolean>;

	// Product adoption preferences
	installPromptDismissed: boolean;

	// Actions
	setSelectedTab: (tab: 'home' | 'timesheet' | 'settings') => void;
	updatePreferences: (prefs: Partial<UIPreferences>) => void;
	setSelectedProject: (project: string) => void;
	toggleUserExpanded: (user: string) => void;
	resetPreferences: () => void;
	dismissInstallPrompt: () => void;
	resetInstallPrompt: () => void;
}

export const UI_STORAGE_VERSION = 1;

const defaultPreferences: UIPreferences = {
	hideWeekends: false,
	compactView: false,
};

function normalizeExpandedUsers(
	expandedUsers: unknown,
): Record<string, boolean> {
	if (!expandedUsers || typeof expandedUsers !== 'object') {
		return {};
	}

	return Object.fromEntries(
		Object.entries(expandedUsers).filter(
			([user, expanded]) => !!user.trim() && expanded === true,
		),
	);
}

function normalizeUIPersistedState(persisted: Partial<UIState> | undefined) {
	return {
		preferences: {
			...defaultPreferences,
			...(persisted?.preferences ?? {}),
		},
		selectedProject:
			typeof persisted?.selectedProject === 'string'
				? persisted.selectedProject.trim().toUpperCase()
				: '',
		expandedUsers: normalizeExpandedUsers(persisted?.expandedUsers),
		installPromptDismissed: persisted?.installPromptDismissed === true,
	};
}

export function migratePersistedUIState(
	persisted: unknown,
	version: number,
): Partial<UIState> {
	const persistedState = persisted as Partial<UIState> | undefined;

	if (version < UI_STORAGE_VERSION) {
		return normalizeUIPersistedState(persistedState);
	}

	return normalizeUIPersistedState(persistedState);
}

export const useUIStore = create<UIState>()(
	persist(
		(set) => ({
			selectedTab: 'home',
			preferences: defaultPreferences,
			selectedProject: '',
			expandedUsers: {},
			installPromptDismissed: false,

			setSelectedTab: (tab: 'home' | 'timesheet' | 'settings') => {
				set({ selectedTab: tab });
			},

			updatePreferences: (prefs: Partial<UIPreferences>) => {
				set((state) => ({
					preferences: {
						...state.preferences,
						...prefs,
					},
				}));
			},

			setSelectedProject: (project: string) => {
				set({ selectedProject: project.trim().toUpperCase() });
			},

			toggleUserExpanded: (user: string) => {
				set((state) => {
					const next = !state.expandedUsers[user];
					if (next) {
						return {
							expandedUsers: {
								...state.expandedUsers,
								[user]: true,
							},
						};
					}
					const expandedUsers = { ...state.expandedUsers };
					delete expandedUsers[user];
					return { expandedUsers };
				});
			},

			resetPreferences: () => {
				set({ preferences: defaultPreferences });
			},

			dismissInstallPrompt: () => {
				set({ installPromptDismissed: true });
			},

			resetInstallPrompt: () => {
				set({ installPromptDismissed: false });
			},
		}),
		{
			name: 'jira-timesheet-ui',
			storage: createJSONStorage(getPersistStorage),
			version: UI_STORAGE_VERSION,
			migrate: (persistedState, version) =>
				migratePersistedUIState(persistedState, version),
			partialize: (state) => ({
				preferences: state.preferences,
				selectedProject: state.selectedProject,
				expandedUsers: state.expandedUsers,
				installPromptDismissed: state.installPromptDismissed,
			}),
			merge: (persisted, current) => {
				const persistedState = normalizeUIPersistedState(
					persisted as Partial<UIState> | undefined,
				);
				return {
					...current,
					...persistedState,
				};
			},
		},
	),
);
