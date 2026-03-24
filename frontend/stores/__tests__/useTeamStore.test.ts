import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useTeamStore } from '../useTeamStore';

describe('useTeamStore', () => {
	beforeEach(() => {
		act(() => {
			useTeamStore.setState({
				weekStart: '2025-03-10',
				weekEnd: '2025-03-16',
			});
		});
	});

	it('keeps week end aligned when setting a week explicitly', () => {
		act(() => {
			useTeamStore.getState().setWeek('2025-10-27');
		});

		expect(useTeamStore.getState().weekStart).toBe('2025-10-27');
		expect(useTeamStore.getState().weekEnd).toBe('2025-11-02');
	});

	it('navigates to previous and next weeks without month drift', () => {
		act(() => {
			useTeamStore.getState().goToPrevWeek();
		});

		expect(useTeamStore.getState().weekStart).toBe('2025-03-03');
		expect(useTeamStore.getState().weekEnd).toBe('2025-03-09');

		act(() => {
			useTeamStore.getState().goToNextWeek();
			useTeamStore.getState().goToNextWeek();
		});

		expect(useTeamStore.getState().weekStart).toBe('2025-03-17');
		expect(useTeamStore.getState().weekEnd).toBe('2025-03-23');
	});
});
