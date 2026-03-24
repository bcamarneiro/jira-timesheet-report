import { useQuery } from '@tanstack/react-query';
import {
	type AbsenceDay,
	fetchAbsenceDays,
} from '../../services/absenceService';
import { useConfigStore } from '../../stores/useConfigStore';

/**
 * Hook that fetches absence days from calendar feeds marked as type 'absence'.
 * Returns a Map<string, AbsenceDay> keyed by ISO date string.
 */
export function useAbsenceDays(rangeStart: string, rangeEnd: string) {
	const config = useConfigStore((s) => s.config);
	const absenceFeeds = (config.calendarFeeds ?? []).filter(
		(f) => f.type === 'absence' && f.url.trim(),
	);

	return useQuery<Map<string, AbsenceDay>>({
		queryKey: [
			'absenceDays',
			rangeStart,
			rangeEnd,
			absenceFeeds.map((f) => f.url).join(','),
		],
		queryFn: ({ signal }) =>
			fetchAbsenceDays(
				config.calendarFeeds,
				config.corsProxy,
				rangeStart,
				rangeEnd,
				signal,
			),
		enabled: absenceFeeds.length > 0,
		staleTime: 30 * 60 * 1000, // Absence calendars change rarely
		placeholderData: new Map(),
	});
}
