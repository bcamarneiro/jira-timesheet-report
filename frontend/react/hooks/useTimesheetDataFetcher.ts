import type { Version2Models } from 'jira.js';
import { useEffect, useRef } from 'react';
import { useConfigStore } from '../../stores/useConfigStore';
import type { EnrichedJiraWorklog } from '../../stores/useTimesheetStore';
import { useTimesheetStore } from '../../stores/useTimesheetStore';
import { useJiraClient } from './useJiraClient';

// Simple in-memory cache keyed by year-month-jqlFilter
const cache = new Map<string, EnrichedJiraWorklog[]>();

/**
 * Hook that fetches timesheet data and populates the Zustand store.
 * Includes AbortController for request cancellation and month-level caching.
 */
export function useTimesheetDataFetcher() {
	const jiraClient = useJiraClient();
	const currentYear = useTimesheetStore((state) => state.currentYear);
	const currentMonth = useTimesheetStore((state) => state.currentMonth);
	const setData = useTimesheetStore((state) => state.setData);
	const setLoading = useTimesheetStore((state) => state.setLoading);
	const setError = useTimesheetStore((state) => state.setError);
	const jqlFilter = useConfigStore((state) => state.config.jqlFilter);
	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		// Abort any in-flight request
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		const fetchTimesheetData = async () => {
			if (!jiraClient) {
				setError('Jira client is not configured. Please check your settings.');
				return;
			}

			// Check cache
			const cacheKey = `${currentYear}-${currentMonth}-${jqlFilter || ''}`;
			const cached = cache.get(cacheKey);
			if (cached) {
				setData(cached);
				return;
			}

			setLoading(true);
			setError(null);

			const config = useConfigStore.getState().config;
			const viaProxy = config.corsProxy
				? ` via proxy ${config.corsProxy}`
				: ' (direct)';

			try {
				const startDate = new Date(currentYear, currentMonth, 1);
				const endDate = new Date(currentYear, currentMonth + 1, 0);

				const startMillis = startDate.getTime();
				const endMillis = new Date(
					endDate.getFullYear(),
					endDate.getMonth(),
					endDate.getDate(),
					23,
					59,
					59,
					999,
				).getTime();

				let jql = `worklogDate >= "${startDate
					.toISOString()
					.substring(0, 10)}" AND worklogDate <= "${endDate
					.toISOString()
					.substring(0, 10)}"`;

				if (jqlFilter?.trim()) {
					jql += ` AND ${jqlFilter.trim()}`;
				}

				console.log(`[Fetch] Searching issues${viaProxy} | JQL: ${jql}`);
				const searchStart = performance.now();

				const searchResult =
					await jiraClient.issueSearch.searchForIssuesUsingJql({
						jql,
						fields: ['summary', 'issuetype', 'parent', 'project', 'status'],
						maxResults: 1000,
					});

				if (abortController.signal.aborted) return;

				console.log(
					`[Fetch] Search returned ${searchResult.total ?? 0} issues in ${Math.round(performance.now() - searchStart)}ms`,
				);

				let allWorklogs: EnrichedJiraWorklog[] = [];

				if (searchResult.total && searchResult.total > 0) {
					const issues = searchResult.issues ?? [];
					const worklogStart = performance.now();

					console.log(
						`[Fetch] Fetching worklogs for ${issues.length} issues${viaProxy}`,
					);

					const worklogPromises = issues
						.filter(
							(issue): issue is typeof issue & { key: string } => !!issue.key,
						)
						.map(async (issue) => {
							try {
								const worklogResponse =
									await jiraClient.issueWorklogs.getIssueWorklog({
										issueIdOrKey: issue.key,
										startedAfter: startMillis,
										startedBefore: endMillis,
									});

								if (
									worklogResponse.worklogs &&
									worklogResponse.worklogs.length > 0
								) {
									return worklogResponse.worklogs.map(
										(wl: Version2Models.Worklog): EnrichedJiraWorklog => ({
											...wl,
											issue: issue,
										}),
									);
								}
								return [];
							} catch (worklogError) {
								console.error(
									`[Fetch] Failed to fetch worklogs for ${issue.key}:`,
									worklogError,
								);
								return [];
							}
						});

					const worklogResults = await Promise.all(worklogPromises);

					if (abortController.signal.aborted) return;

					allWorklogs = worklogResults.flat();

					const worklogDuration = Math.round(performance.now() - worklogStart);
					const totalDuration = Math.round(performance.now() - searchStart);
					console.log(
						`[Fetch] Done: ${allWorklogs.length} worklogs from ${issues.length} issues | worklogs: ${worklogDuration}ms | total: ${totalDuration}ms`,
					);
				}

				// Store in cache
				cache.set(cacheKey, allWorklogs);
				setData(allWorklogs);
			} catch (e) {
				if (abortController.signal.aborted) return;
				console.error(`[Fetch] Error fetching data${viaProxy}:`, e);
				if (e instanceof Error) {
					setError(`Failed to fetch data from Jira: ${e.message}`);
				} else {
					setError('An unknown error occurred.');
				}
			} finally {
				if (!abortController.signal.aborted) {
					setLoading(false);
				}
			}
		};

		fetchTimesheetData();

		return () => {
			abortController.abort();
		};
	}, [
		currentYear,
		currentMonth,
		jiraClient,
		jqlFilter,
		setData,
		setLoading,
		setError,
	]);
}

/** Clear the month cache (call after creating/updating/deleting worklogs) */
export function invalidateTimesheetCache() {
	cache.clear();
}
