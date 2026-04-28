import { useQuery } from '@tanstack/react-query';
import {
	type AbsenceDay,
	fetchAbsenceDaysByUser,
	type UserAbsenceDays,
} from '../../services/absenceService';
import { useConfigStore } from '../../stores/useConfigStore';

type Options = {
	enabled?: boolean;
};

const EMPTY_ABSENCE_DAYS_BY_USER: UserAbsenceDays = new Map();
const EMPTY_ABSENCE_DAYS: Map<string, AbsenceDay> = new Map();

function buildAbsenceQueryKey(
	rangeStart: string,
	rangeEnd: string,
	feeds: ReturnType<typeof useConfigStore.getState>['config']['calendarFeeds'],
	assignments: ReturnType<
		typeof useConfigStore.getState
	>['config']['absenceAssignments'],
	currentUserEmail: string,
	corsProxy: string,
) {
	return [
		'absenceDaysByUser',
		rangeStart,
		rangeEnd,
		corsProxy,
		currentUserEmail.trim().toLowerCase(),
		feeds
			.map(
				(feed) =>
					`${feed.type}|${feed.url}|${feed.label}|${feed.absenceAttribution ?? ''}|${feed.titleFilter ?? ''}`,
			)
			.join('||'),
		assignments
			.map((assignment) => `${assignment.pattern}|${assignment.userEmail}`)
			.join('||'),
	] as const;
}

export function useAbsenceDaysByUser(
	rangeStart: string,
	rangeEnd: string,
	options?: Options,
) {
	const config = useConfigStore((s) => s.config);
	const absenceFeeds = (config.calendarFeeds ?? []).filter(
		(feed) => feed.type === 'absence' && feed.url.trim(),
	);
	const enabled = (options?.enabled ?? true) && absenceFeeds.length > 0;

	return useQuery<UserAbsenceDays>({
		queryKey: buildAbsenceQueryKey(
			rangeStart,
			rangeEnd,
			absenceFeeds,
			config.absenceAssignments ?? [],
			config.email,
			config.corsProxy,
		),
		queryFn: ({ signal }) =>
			fetchAbsenceDaysByUser(
				config.calendarFeeds,
				config.absenceAssignments ?? [],
				config.email,
				config.corsProxy,
				rangeStart,
				rangeEnd,
				signal,
			),
		enabled,
		staleTime: 30 * 60 * 1000,
		placeholderData: EMPTY_ABSENCE_DAYS_BY_USER,
	});
}

/**
 * Hook that fetches absence days from calendar feeds marked as type 'absence'.
 * Returns a Map<string, AbsenceDay> keyed by ISO date string.
 */
export function useAbsenceDays(
	rangeStart: string,
	rangeEnd: string,
	options?: Options,
) {
	const config = useConfigStore((s) => s.config);
	const absenceByUserQuery = useAbsenceDaysByUser(rangeStart, rangeEnd, options);
	const currentUserEmail = config.email.trim().toLowerCase();

	return {
		...absenceByUserQuery,
		data:
			absenceByUserQuery.data?.get(currentUserEmail) ??
			EMPTY_ABSENCE_DAYS,
	};
}
