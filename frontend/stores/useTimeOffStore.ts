import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TimeOffMap = Record<string, number>;

interface TimeOffState {
	timeOffMap: TimeOffMap;

	// Get time off hours for a specific user and date
	getTimeOffHours: (user: string, iso: string) => number;

	// Set time off hours for a specific user and date
	setTimeOffHours: (user: string, iso: string, hours: number) => void;

	// Clear all time off for a specific user
	clearUserTimeOff: (user: string) => void;

	// Clear all time off data
	clearAll: () => void;
}

const keyFor = (user: string, iso: string) => `${user}::${iso}`;

export const useTimeOffStore = create<TimeOffState>()(
	persist(
		(set, get) => ({
			timeOffMap: {},

			getTimeOffHours: (user: string, iso: string): number => {
				const { timeOffMap } = get();
				return timeOffMap[keyFor(user, iso)] || 0;
			},

			setTimeOffHours: (user: string, iso: string, hours: number) => {
				set((state) => {
					const next = { ...state.timeOffMap };
					const k = keyFor(user, iso);
					if (hours > 0) {
						next[k] = Math.max(0, Math.min(8, hours));
					} else {
						delete next[k];
					}
					return { timeOffMap: next };
				});
			},

			clearUserTimeOff: (user: string) => {
				set((state) => {
					const next = { ...state.timeOffMap };
					for (const key of Object.keys(next)) {
						if (key.startsWith(`${user}::`)) {
							delete next[key];
						}
					}
					return { timeOffMap: next };
				});
			},

			clearAll: () => {
				set({ timeOffMap: {} });
			},
		}),
		{
			name: 'timeOff:v2', // Changed version to differentiate from old hook-based storage
		},
	),
);
