import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useUIStore } from '../useUIStore';

describe('useUIStore', () => {
	beforeEach(() => {
		// Reset store to defaults
		act(() => {
			useUIStore.setState({
				selectedTab: 'home',
				preferences: {
					hideWeekends: false,
					compactView: false,
				},
				selectedProject: '',
				expandedUsers: {},
			});
		});
	});

	describe('setSelectedTab', () => {
		it('should set selected tab to home', () => {
			act(() => {
				useUIStore.getState().setSelectedTab('home');
			});

			expect(useUIStore.getState().selectedTab).toBe('home');
		});

		it('should set selected tab to timesheet', () => {
			act(() => {
				useUIStore.getState().setSelectedTab('timesheet');
			});

			expect(useUIStore.getState().selectedTab).toBe('timesheet');
		});

		it('should set selected tab to settings', () => {
			act(() => {
				useUIStore.getState().setSelectedTab('settings');
			});

			expect(useUIStore.getState().selectedTab).toBe('settings');
		});
	});

	describe('updatePreferences', () => {
		it('should update hideWeekends preference', () => {
			act(() => {
				useUIStore.getState().updatePreferences({ hideWeekends: true });
			});

			expect(useUIStore.getState().preferences.hideWeekends).toBe(true);
			expect(useUIStore.getState().preferences.compactView).toBe(false);
		});

		it('should update compactView preference', () => {
			act(() => {
				useUIStore.getState().updatePreferences({ compactView: true });
			});

			expect(useUIStore.getState().preferences.compactView).toBe(true);
			expect(useUIStore.getState().preferences.hideWeekends).toBe(false);
		});

		it('should update multiple preferences at once', () => {
			act(() => {
				useUIStore
					.getState()
					.updatePreferences({ hideWeekends: true, compactView: true });
			});

			expect(useUIStore.getState().preferences.hideWeekends).toBe(true);
			expect(useUIStore.getState().preferences.compactView).toBe(true);
		});

		it('should preserve other preferences when updating one', () => {
			act(() => {
				useUIStore.getState().updatePreferences({ hideWeekends: true });
			});

			act(() => {
				useUIStore.getState().updatePreferences({ compactView: true });
			});

			expect(useUIStore.getState().preferences.hideWeekends).toBe(true);
			expect(useUIStore.getState().preferences.compactView).toBe(true);
		});
	});

	describe('setSelectedProject', () => {
		it('should set selected project', () => {
			act(() => {
				useUIStore.getState().setSelectedProject('PROJ');
			});

			expect(useUIStore.getState().selectedProject).toBe('PROJ');
		});

		it('should clear selected project', () => {
			act(() => {
				useUIStore.getState().setSelectedProject('PROJ');
			});

			act(() => {
				useUIStore.getState().setSelectedProject('');
			});

			expect(useUIStore.getState().selectedProject).toBe('');
		});
	});

	describe('toggleUserExpanded', () => {
		it('should expand user when collapsed', () => {
			act(() => {
				useUIStore.getState().toggleUserExpanded('Alex Thompson');
			});

			expect(useUIStore.getState().expandedUsers['Alex Thompson']).toBe(true);
		});

		it('should collapse user when expanded', () => {
			act(() => {
				useUIStore.getState().toggleUserExpanded('Alex Thompson');
			});

			act(() => {
				useUIStore.getState().toggleUserExpanded('Alex Thompson');
			});

			expect(useUIStore.getState().expandedUsers['Alex Thompson']).toBe(false);
		});

		it('should handle multiple users independently', () => {
			act(() => {
				useUIStore.getState().toggleUserExpanded('Alex Thompson');
				useUIStore.getState().toggleUserExpanded('Sarah Johnson');
			});

			expect(useUIStore.getState().expandedUsers['Alex Thompson']).toBe(true);
			expect(useUIStore.getState().expandedUsers['Sarah Johnson']).toBe(true);

			act(() => {
				useUIStore.getState().toggleUserExpanded('Alex Thompson');
			});

			expect(useUIStore.getState().expandedUsers['Alex Thompson']).toBe(false);
			expect(useUIStore.getState().expandedUsers['Sarah Johnson']).toBe(true);
		});
	});

	describe('resetPreferences', () => {
		it('should reset preferences to defaults', () => {
			act(() => {
				useUIStore
					.getState()
					.updatePreferences({ hideWeekends: true, compactView: true });
			});

			expect(useUIStore.getState().preferences.hideWeekends).toBe(true);
			expect(useUIStore.getState().preferences.compactView).toBe(true);

			act(() => {
				useUIStore.getState().resetPreferences();
			});

			expect(useUIStore.getState().preferences.hideWeekends).toBe(false);
			expect(useUIStore.getState().preferences.compactView).toBe(false);
		});

		it('should not affect other state', () => {
			act(() => {
				useUIStore.getState().setSelectedTab('timesheet');
				useUIStore.getState().setSelectedProject('PROJ');
				useUIStore.getState().updatePreferences({ hideWeekends: true });
			});

			act(() => {
				useUIStore.getState().resetPreferences();
			});

			expect(useUIStore.getState().selectedTab).toBe('timesheet');
			expect(useUIStore.getState().selectedProject).toBe('PROJ');
		});
	});
});
