import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useTimeOffStore } from '../useTimeOffStore';

describe('useTimeOffStore', () => {
	beforeEach(() => {
		// Reset store before each test
		act(() => {
			useTimeOffStore.getState().clearAll();
		});
	});

	describe('getTimeOffHours', () => {
		it('should return 0 for unset time off', () => {
			const hours = useTimeOffStore
				.getState()
				.getTimeOffHours('Alex Thompson', '2025-10-15');

			expect(hours).toBe(0);
		});

		it('should return set value', () => {
			act(() => {
				useTimeOffStore
					.getState()
					.setTimeOffHours('Alex Thompson', '2025-10-15', 4);
			});

			const hours = useTimeOffStore
				.getState()
				.getTimeOffHours('Alex Thompson', '2025-10-15');

			expect(hours).toBe(4);
		});
	});

	describe('setTimeOffHours', () => {
		it('should set time off hours', () => {
			act(() => {
				useTimeOffStore
					.getState()
					.setTimeOffHours('Alex Thompson', '2025-10-15', 8);
			});

			expect(
				useTimeOffStore
					.getState()
					.getTimeOffHours('Alex Thompson', '2025-10-15'),
			).toBe(8);
		});

		it('should clamp hours to max 8', () => {
			act(() => {
				useTimeOffStore
					.getState()
					.setTimeOffHours('Alex Thompson', '2025-10-15', 10);
			});

			expect(
				useTimeOffStore
					.getState()
					.getTimeOffHours('Alex Thompson', '2025-10-15'),
			).toBe(8);
		});

		it('should remove entry when setting 0 hours', () => {
			act(() => {
				useTimeOffStore
					.getState()
					.setTimeOffHours('Alex Thompson', '2025-10-15', 4);
			});

			expect(Object.keys(useTimeOffStore.getState().timeOffMap)).toHaveLength(
				1,
			);

			act(() => {
				useTimeOffStore
					.getState()
					.setTimeOffHours('Alex Thompson', '2025-10-15', 0);
			});

			expect(Object.keys(useTimeOffStore.getState().timeOffMap)).toHaveLength(
				0,
			);
		});

		it('should handle multiple users and dates', () => {
			act(() => {
				useTimeOffStore
					.getState()
					.setTimeOffHours('Alex Thompson', '2025-10-15', 4);
				useTimeOffStore
					.getState()
					.setTimeOffHours('Alex Thompson', '2025-10-16', 8);
				useTimeOffStore
					.getState()
					.setTimeOffHours('Sarah Johnson', '2025-10-15', 2);
			});

			expect(
				useTimeOffStore
					.getState()
					.getTimeOffHours('Alex Thompson', '2025-10-15'),
			).toBe(4);
			expect(
				useTimeOffStore
					.getState()
					.getTimeOffHours('Alex Thompson', '2025-10-16'),
			).toBe(8);
			expect(
				useTimeOffStore
					.getState()
					.getTimeOffHours('Sarah Johnson', '2025-10-15'),
			).toBe(2);
		});

		it('should update existing entry', () => {
			act(() => {
				useTimeOffStore
					.getState()
					.setTimeOffHours('Alex Thompson', '2025-10-15', 4);
			});

			expect(
				useTimeOffStore
					.getState()
					.getTimeOffHours('Alex Thompson', '2025-10-15'),
			).toBe(4);

			act(() => {
				useTimeOffStore
					.getState()
					.setTimeOffHours('Alex Thompson', '2025-10-15', 6);
			});

			expect(
				useTimeOffStore
					.getState()
					.getTimeOffHours('Alex Thompson', '2025-10-15'),
			).toBe(6);
		});
	});

	describe('clearUserTimeOff', () => {
		it('should clear all time off for a specific user', () => {
			act(() => {
				useTimeOffStore
					.getState()
					.setTimeOffHours('Alex Thompson', '2025-10-15', 4);
				useTimeOffStore
					.getState()
					.setTimeOffHours('Alex Thompson', '2025-10-16', 8);
				useTimeOffStore
					.getState()
					.setTimeOffHours('Sarah Johnson', '2025-10-15', 2);
			});

			act(() => {
				useTimeOffStore.getState().clearUserTimeOff('Alex Thompson');
			});

			expect(
				useTimeOffStore
					.getState()
					.getTimeOffHours('Alex Thompson', '2025-10-15'),
			).toBe(0);
			expect(
				useTimeOffStore
					.getState()
					.getTimeOffHours('Alex Thompson', '2025-10-16'),
			).toBe(0);
			expect(
				useTimeOffStore
					.getState()
					.getTimeOffHours('Sarah Johnson', '2025-10-15'),
			).toBe(2);
		});

		it('should not affect other users', () => {
			act(() => {
				useTimeOffStore
					.getState()
					.setTimeOffHours('Alex Thompson', '2025-10-15', 4);
				useTimeOffStore
					.getState()
					.setTimeOffHours('Sarah Johnson', '2025-10-15', 2);
			});

			act(() => {
				useTimeOffStore.getState().clearUserTimeOff('Alex Thompson');
			});

			expect(
				useTimeOffStore
					.getState()
					.getTimeOffHours('Sarah Johnson', '2025-10-15'),
			).toBe(2);
		});
	});

	describe('clearAll', () => {
		it('should clear all time off data', () => {
			act(() => {
				useTimeOffStore
					.getState()
					.setTimeOffHours('Alex Thompson', '2025-10-15', 4);
				useTimeOffStore
					.getState()
					.setTimeOffHours('Sarah Johnson', '2025-10-16', 8);
			});

			expect(Object.keys(useTimeOffStore.getState().timeOffMap)).toHaveLength(
				2,
			);

			act(() => {
				useTimeOffStore.getState().clearAll();
			});

			expect(Object.keys(useTimeOffStore.getState().timeOffMap)).toHaveLength(
				0,
			);
		});
	});
});
