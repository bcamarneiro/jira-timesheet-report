import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

	// Actions
	setSelectedTab: (tab: 'home' | 'timesheet' | 'settings') => void;
	updatePreferences: (prefs: Partial<UIPreferences>) => void;
	setSelectedProject: (project: string) => void;
	toggleUserExpanded: (user: string) => void;
	resetPreferences: () => void;
}

const defaultPreferences: UIPreferences = {
	hideWeekends: false,
	compactView: false,
};

export const useUIStore = create<UIState>()(
	persist(
		(set) => ({
			selectedTab: 'home',
			preferences: defaultPreferences,
			selectedProject: '',
			expandedUsers: {},

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
		}),
		{
			name: 'jira-timesheet-ui',
			partialize: (state) => ({
				preferences: state.preferences,
				selectedProject: state.selectedProject,
				expandedUsers: state.expandedUsers,
			}),
		},
	),
);
