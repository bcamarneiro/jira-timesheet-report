import { useEffect } from 'react';
import type { RescueTimeDaySummary } from '../../../types/Suggestion';
import { fetchCalendarSuggestions } from '../../services/calendarService';
import { fetchGitlabSuggestions } from '../../services/gitlabService';
import { fetchJiraActivitySuggestions } from '../../services/jiraActivityService';
import { fetchRescueTimeData } from '../../services/rescueTimeService';
import { mergeSuggestions } from '../../services/suggestionMerger';
import {
	fetchWeekWorklogs,
	type WorklogEntry,
} from '../../services/worklogService';
import { useConfigStore } from '../../stores/useConfigStore';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { useUserDataStore } from '../../stores/useUserDataStore';

export function useDashboardDataFetcher() {
	const config = useConfigStore((s) => s.config);
	const weekStart = useDashboardStore((s) => s.weekStart);
	const weekEnd = useDashboardStore((s) => s.weekEnd);
	const setLoading = useDashboardStore((s) => s.setLoading);
	const setError = useDashboardStore((s) => s.setError);
	const favorites = useUserDataStore((s) => s.favorites);
	const templates = useUserDataStore((s) => s.templates);
	const calendarMappings = useUserDataStore((s) => s.calendarMappings);

	useEffect(() => {
		if (!config.jiraHost || !config.apiToken) return;

		const controller = new AbortController();
		const { signal } = controller;

		async function run() {
			// Reset errors
			setError('worklogs', null);
			setError('jira', null);
			setError('gitlab', null);
			setError('calendar', null);
			setError('rescuetime', null);

			// Fetch all sources in parallel
			setLoading('worklogs', true);
			setLoading('jira', true);
			if (config.gitlabToken && config.gitlabHost) setLoading('gitlab', true);
			const hasCalendar =
				config.calendarFeeds && config.calendarFeeds.length > 0;
			if (hasCalendar) setLoading('calendar', true);
			if (config.rescueTimeApiKey) setLoading('rescuetime', true);

			const [
				worklogs,
				jiraSuggestions,
				gitlabSuggestions,
				calendarSuggestions,
				rescueTimeData,
			] = await Promise.all([
				fetchWeekWorklogs(config, weekStart, weekEnd, signal)
					.catch((e) => {
						if (!signal.aborted) setError('worklogs', e.message);
						return [] as WorklogEntry[];
					})
					.finally(() => setLoading('worklogs', false)),

				fetchJiraActivitySuggestions(config, weekStart, weekEnd, signal)
					.catch((e) => {
						if (!signal.aborted) setError('jira', e.message);
						return [];
					})
					.finally(() => setLoading('jira', false)),

				config.gitlabToken && config.gitlabHost
					? fetchGitlabSuggestions(
							config.gitlabToken,
							config.gitlabHost,
							config.corsProxy,
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
							config.calendarFeeds,
							config.corsProxy,
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

				config.rescueTimeApiKey
					? fetchRescueTimeData(
							config.rescueTimeApiKey,
							config.corsProxy,
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
				timeRounding: config.timeRounding,
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
		config,
		weekStart,
		weekEnd,
		setLoading,
		setError,
		favorites,
		templates,
		calendarMappings,
	]);
}
