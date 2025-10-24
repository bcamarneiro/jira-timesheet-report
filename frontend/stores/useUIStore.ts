import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIPreferences {
	hideWeekends: boolean;
	showKarmaOnly: boolean;
	compactView: boolean;
}

interface UIState {
	// Current active tab/page
	selectedTab: 'home' | 'timesheet' | 'settings';

	// User preferences
	preferences: UIPreferences;

	// Expanded state for collapsible sections (user: boolean)
	expandedUsers: Record<string, boolean>;

	// Actions
	setSelectedTab: (tab: 'home' | 'timesheet' | 'settings') => void;
	updatePreferences: (prefs: Partial<UIPreferences>) => void;
	toggleUserExpanded: (user: string) => void;
	resetPreferences: () => void;
}

const defaultPreferences: UIPreferences = {
	hideWeekends: false,
	showKarmaOnly: false,
	compactView: false,
};

export const useUIStore = create<UIState>()(
	persist(
		(set) => ({
			selectedTab: 'home',
			preferences: defaultPreferences,
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

			toggleUserExpanded: (user: string) => {
				set((state) => ({
					expandedUsers: {
						...state.expandedUsers,
						[user]: !state.expandedUsers[user],
					},
				}));
			},

			resetPreferences: () => {
				set({ preferences: defaultPreferences });
			},
		}),
		{
			name: 'jira-timesheet-ui',
		},
	),
);
