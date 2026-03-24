import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { RescueTimeDaySummary } from '../../../types/Suggestion';
import { fetchCalendarSuggestions } from '../../services/calendarService';
import { fetchGitlabSuggestions } from '../../services/gitlabService';
import { fetchJiraActivitySuggestions } from '../../services/jiraActivityService';
import {
	fetchMonthWorklogs,
	type WorklogItem,
} from '../../services/monthWorklogService';
import { fetchRescueTimeData } from '../../services/rescueTimeService';
import { mergeSuggestions } from '../../services/suggestionMerger';
import { useConfigStore } from '../../stores/useConfigStore';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { useUserDataStore } from '../../stores/useUserDataStore';
import { monthWorklogsQueryKey } from './useMonthWorklogs';

interface WorklogEntry {
	date: string;
	issueKey?: string;
	issueSummary?: string;
	timeSpentSeconds: number;
}

/** Derive WorklogEntry[] from the shared month query, filtered to a week range */
function deriveWeekWorklogs(
	worklogs: WorklogItem[],
	email: string,
	weekStart: string,
	weekEnd: string,
): WorklogEntry[] {
	const lowerEmail = email.toLowerCase();
	const entries: WorklogEntry[] = [];

	for (const wl of worklogs) {
		if (wl.author?.emailAddress?.toLowerCase() !== lowerEmail) continue;
		const day = (wl.started ?? '').slice(0, 10);
		if (day >= weekStart && day <= weekEnd) {
			entries.push({
				date: day,
				issueKey: wl.issue.key,
				issueSummary: wl.issue.fields.summary as string,
				timeSpentSeconds: wl.timeSpentSeconds ?? 0,
			});
		}
	}

	return entries;
}

export function useDashboardDataFetcher() {
	const jiraHost = useConfigStore((s) => s.config.jiraHost);
	const email = useConfigStore((s) => s.config.email);
	const apiToken = useConfigStore((s) => s.config.apiToken);
	const corsProxy = useConfigStore((s) => s.config.corsProxy);
	const jqlFilterValue = useConfigStore((s) => s.config.jqlFilter);
	const gitlabToken = useConfigStore((s) => s.config.gitlabToken);
	const gitlabHost = useConfigStore((s) => s.config.gitlabHost);
	const rescueTimeApiKey = useConfigStore((s) => s.config.rescueTimeApiKey);
	const calendarFeeds = useConfigStore((s) => s.config.calendarFeeds);
	const timeRounding = useConfigStore((s) => s.config.timeRounding);
	const weekStart = useDashboardStore((s) => s.weekStart);
	const weekEnd = useDashboardStore((s) => s.weekEnd);
	const setLoading = useDashboardStore((s) => s.setLoading);
	const setError = useDashboardStore((s) => s.setError);
	const favorites = useUserDataStore((s) => s.favorites);
	const templates = useUserDataStore((s) => s.templates);
	const calendarMappings = useUserDataStore((s) => s.calendarMappings);
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!jiraHost || !apiToken) return;

		const controller = new AbortController();
		const { signal } = controller;
		const config = {
			...useConfigStore.getState().config,
			jiraHost,
			email,
			apiToken,
			corsProxy,
			jqlFilter: jqlFilterValue,
			gitlabToken,
			gitlabHost,
			rescueTimeApiKey,
			calendarFeeds,
			timeRounding,
		};

		async function run() {
			// Reset errors
			setError('worklogs', null);
			setError('jira', null);
			setError('gitlab', null);
			setError('calendar', null);
			setError('rescuetime', null);

			// Set loading states
			setLoading('worklogs', true);
			setLoading('jira', true);
			if (gitlabToken && gitlabHost) setLoading('gitlab', true);
			const suggestionFeeds = (config.calendarFeeds ?? []).filter(
				(f) => f.type !== 'absence',
			);
			const hasCalendar = suggestionFeeds.length > 0;
			if (hasCalendar) setLoading('calendar', true);
			if (rescueTimeApiKey) setLoading('rescuetime', true);

			// Determine which month(s) the week spans
			const [startYear, startMonthStr] = weekStart.split('-').map(Number);
			const [endYear, endMonthStr] = weekEnd.split('-').map(Number);
			const startMonth = startMonthStr - 1; // 0-indexed
			const endMonth = endMonthStr - 1;
			const spansMonths = startYear !== endYear || startMonth !== endMonth;

			// Fetch worklogs via shared TanStack Query cache
			const jqlFilter = jqlFilterValue?.trim() || '';
			const fetchOpts = {
				jqlFilter: jqlFilter || undefined,
			};
			const buildKey = (y: number, m: number) =>
				monthWorklogsQueryKey(
					y,
					m,
					config.jiraHost,
					config.corsProxy,
					false,
					jqlFilter,
				);

			const [
				worklogs,
				jiraSuggestions,
				gitlabSuggestions,
				calendarSuggestions,
				rescueTimeData,
			] = await Promise.all([
				// Worklogs: fetch from shared month query (cached/deduplicated)
				(async () => {
					try {
						const month1Data = await queryClient.fetchQuery({
							queryKey: buildKey(startYear, startMonth),
							queryFn: ({ signal: s }) =>
								fetchMonthWorklogs(config, startYear, startMonth, fetchOpts, s),
							staleTime: 15 * 60 * 1000,
						});

						let allData = month1Data;
						if (spansMonths) {
							const month2Data = await queryClient.fetchQuery({
								queryKey: buildKey(endYear, endMonth),
								queryFn: ({ signal: s }) =>
									fetchMonthWorklogs(config, endYear, endMonth, fetchOpts, s),
								staleTime: 15 * 60 * 1000,
							});
							allData = [...month1Data, ...month2Data];
						}

						return deriveWeekWorklogs(
							allData,
							email,
							weekStart,
							weekEnd,
						);
					} catch (e) {
						if (!signal.aborted)
							setError(
								'worklogs',
								e instanceof Error ? e.message : 'Failed to fetch worklogs',
							);
						return [] as WorklogEntry[];
					} finally {
						setLoading('worklogs', false);
					}
				})(),

				fetchJiraActivitySuggestions(config, weekStart, weekEnd, signal)
					.catch((e) => {
						if (!signal.aborted) setError('jira', e.message);
						return [];
					})
					.finally(() => setLoading('jira', false)),

				gitlabToken && gitlabHost
					? fetchGitlabSuggestions(
							gitlabToken,
							gitlabHost,
							corsProxy,
							weekStart,
							weekEnd,
							signal,
						)
							.catch((e) => {
								if (!signal.aborted) setError('gitlab', e.message);
								return [];
							})
							.finally(() => setLoading('gitlab', false))
					: Promise.resolve([]),

				hasCalendar
					? fetchCalendarSuggestions(
							suggestionFeeds,
							corsProxy,
							weekStart,
							weekEnd,
							calendarMappings,
							signal,
						)
							.catch((e) => {
								if (!signal.aborted) setError('calendar', e.message);
								return [];
							})
							.finally(() => setLoading('calendar', false))
					: Promise.resolve([]),

				rescueTimeApiKey
					? fetchRescueTimeData(
							rescueTimeApiKey,
							corsProxy,
							weekStart,
							weekEnd,
							signal,
						)
							.catch((e) => {
								if (!signal.aborted) setError('rescuetime', e.message);
								return new Map<string, RescueTimeDaySummary>();
							})
							.finally(() => setLoading('rescuetime', false))
					: Promise.resolve(new Map<string, RescueTimeDaySummary>()),
			]);

			if (signal.aborted) return;

			// Store worklogs with issueKey for weekly summary export
			const worklogsWithKey = worklogs.filter(
				(w): w is WorklogEntry & { issueKey: string } => !!w.issueKey,
			);

			const summaries = mergeSuggestions({
				weekStart,
				jiraSuggestions,
				gitlabSuggestions,
				calendarSuggestions,
				rescueTimeData,
				existingWorklogs: worklogs,
				favorites,
				templates,
				timeRounding,
			});

			// Batch all store updates together to avoid cascading re-renders
			useDashboardStore.setState({
				weekWorklogs: worklogsWithKey,
				daySummaries: summaries,
				lastFetchedAt: new Date().toISOString(),
			});
		}

		run();

		return () => controller.abort();
	}, [
		jiraHost,
		email,
		apiToken,
		corsProxy,
		jqlFilterValue,
		gitlabToken,
		gitlabHost,
		rescueTimeApiKey,
		calendarFeeds,
		timeRounding,
		weekStart,
		weekEnd,
		setLoading,
		setError,
		favorites,
		templates,
		calendarMappings,
		queryClient,
	]);
}
