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
import {
	buildJiraConnectionFingerprint,
	useUIStore,
} from '../../stores/useUIStore';
import { useUserDataStore } from '../../stores/useUserDataStore';
import { classifyWorklog } from '../utils/worklogClassifier';
import { useAbsenceDays } from './useAbsenceDays';
import { monthWorklogsQueryKey } from './useMonthWorklogs';

interface WorklogEntry {
	date: string;
	issueKey?: string;
	issueSummary?: string;
	timeSpentSeconds: number;
	created?: string;
	comment?: string;
	/**
	 * Backdated worklogs (resolved by the classifier at fetch time) are
	 * carried through so downstream day/week totals can skip them. They still
	 * appear in the UI as side notes / ghost reconciliations.
	 */
	isBackdated?: boolean;
}

/** Derive WorklogEntry[] from the shared month query, filtered to a week range */
export function deriveWeekWorklogs(
	worklogs: WorklogItem[],
	email: string,
	weekStart: string,
	weekEnd: string,
): WorklogEntry[] {
	const lowerEmail = email.toLowerCase();
	const entries: WorklogEntry[] = [];

	for (const wl of worklogs) {
		if (wl.author?.emailAddress?.toLowerCase() !== lowerEmail) continue;
		const c = classifyWorklog(wl);
		const day = c.loggedOn;
		if (day >= weekStart && day <= weekEnd) {
			entries.push({
				date: day,
				issueKey: wl.issue.key,
				issueSummary: wl.issue.fields.summary as string,
				timeSpentSeconds: wl.timeSpentSeconds ?? 0,
				created: wl.created,
				comment: typeof wl.comment === 'string' ? wl.comment : undefined,
				isBackdated: c.isBackdated,
			});
		}
	}

	return entries;
}

/**
 * Derive ghost reconciliations for a week: worklogs whose intendedFor falls
 * inside [weekStart, weekEnd] but whose loggedOn falls OUTSIDE the range.
 * These render on the dashboard as non-counting placeholders on intendedFor.
 */
export function deriveWeekGhosts(
	worklogs: WorklogItem[],
	email: string,
	weekStart: string,
	weekEnd: string,
): import('../../stores/useDashboardStore').WeekGhostEntry[] {
	const lowerEmail = email.toLowerCase();
	const ghosts: import('../../stores/useDashboardStore').WeekGhostEntry[] = [];

	for (const wl of worklogs) {
		if (wl.author?.emailAddress?.toLowerCase() !== lowerEmail) continue;
		const c = classifyWorklog(wl);
		if (!c.isBackdated) continue;
		if (!c.intendedFor || !c.loggedOn) continue;
		if (c.intendedFor === c.loggedOn) continue; // not a ghost
		const inWeek = c.intendedFor >= weekStart && c.intendedFor <= weekEnd;
		const loggedOutside = c.loggedOn < weekStart || c.loggedOn > weekEnd;
		if (!inWeek || !loggedOutside) continue;

		ghosts.push({
			date: c.intendedFor,
			intendedFor: c.intendedFor,
			loggedOn: c.loggedOn,
			daysLate: c.daysLate,
			issueKey: wl.issue?.key,
			issueSummary: wl.issue?.fields?.summary as string | undefined,
			timeSpentSeconds: wl.timeSpentSeconds ?? 0,
		});
	}

	return ghosts;
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
	const setWorklogsLoadingProgress = useDashboardStore(
		(s) => s.setWorklogsLoadingProgress,
	);
	const favorites = useUserDataStore((s) => s.favorites);
	const templates = useUserDataStore((s) => s.templates);
	const calendarMappings = useUserDataStore((s) => s.calendarMappings);
	const queryClient = useQueryClient();
	const hasAbsenceFeeds = (calendarFeeds ?? []).some(
		(feed) =>
			(feed.type === 'absence' || feed.type === 'holiday') && feed.url.trim(),
	);
	const { data: absenceDays } = useAbsenceDays(weekStart, weekEnd, {
		enabled: hasAbsenceFeeds,
	});

	useEffect(() => {
		if (!jiraHost || !apiToken) return;
		// Do NOT block on absence-feed readiness. If the absence query is
		// slow / unreachable, the dashboard renders with an empty absence
		// map and re-runs (via the `absenceDays` dep below) once it resolves.
		// Errors surface via the absence query's own error state — handled
		// upstream in DashboardPage so the rest of the dashboard stays usable.

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
			setWorklogsLoadingProgress({
				phase: 'searching',
				percent: 8,
				message: 'Preparing weekly worklog fetch',
				detail: `${weekStart} to ${weekEnd}`,
			});
			setLoading('jira', true);
			if (gitlabToken && gitlabHost) setLoading('gitlab', true);
			const suggestionFeeds = (config.calendarFeeds ?? []).filter(
				(f) => f.type === 'suggestion',
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
				worklogsResult,
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
								fetchMonthWorklogs(
									config,
									startYear,
									startMonth,
									{
										...fetchOpts,
										onProgress: setWorklogsLoadingProgress,
									},
									s,
								),
							staleTime: 15 * 60 * 1000,
						});

						let allData = month1Data;
						if (spansMonths) {
							const month2Data = await queryClient.fetchQuery({
								queryKey: buildKey(endYear, endMonth),
								queryFn: ({ signal: s }) =>
									fetchMonthWorklogs(
										config,
										endYear,
										endMonth,
										{
											...fetchOpts,
											onProgress: setWorklogsLoadingProgress,
										},
										s,
									),
								staleTime: 15 * 60 * 1000,
							});
							allData = [...month1Data, ...month2Data];
						}

						useUIStore
							.getState()
							.markJiraConnectionEvidence(
								buildJiraConnectionFingerprint(config),
								'fetch',
							);

						return {
							entries: deriveWeekWorklogs(allData, email, weekStart, weekEnd),
							ghosts: deriveWeekGhosts(allData, email, weekStart, weekEnd),
						};
					} catch (e) {
						if (!signal.aborted)
							setError(
								'worklogs',
								e instanceof Error ? e.message : 'Failed to fetch worklogs',
							);
						return { entries: [] as WorklogEntry[], ghosts: [] };
					} finally {
						setLoading('worklogs', false);
						setWorklogsLoadingProgress(null);
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

			const worklogs = worklogsResult.entries;
			const weekGhosts = worklogsResult.ghosts;

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
				absenceDays,
			});

			// Batch all store updates together to avoid cascading re-renders.
			// `weekGhosts` is a separate field — gap calculations run off
			// `loggedSeconds` only, so ghosts never affect day/week totals.
			useDashboardStore.setState({
				weekWorklogs: worklogsWithKey,
				weekGhosts,
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
		absenceDays,
		setLoading,
		setError,
		setWorklogsLoadingProgress,
		favorites,
		templates,
		calendarMappings,
		queryClient,
	]);
}
