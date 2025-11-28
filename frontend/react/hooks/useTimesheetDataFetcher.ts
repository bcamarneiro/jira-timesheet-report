import type { Version2Models } from 'jira.js';
import { useEffect } from 'react';
import { useConfigStore } from '../../stores/useConfigStore';
import type { EnrichedJiraWorklog } from '../../stores/useTimesheetStore';
import { useTimesheetStore } from '../../stores/useTimesheetStore';
import { useJiraClient } from './useJiraClient';

/**
 * Hook that fetches timesheet data and populates the Zustand store.
 * This replaces the old useTimesheetData hook which returned local state.
 */
export function useTimesheetDataFetcher() {
	const jiraClient = useJiraClient();
	const currentYear = useTimesheetStore((state) => state.currentYear);
	const currentMonth = useTimesheetStore((state) => state.currentMonth);
	const setData = useTimesheetStore((state) => state.setData);
	const setLoading = useTimesheetStore((state) => state.setLoading);
	const setError = useTimesheetStore((state) => state.setError);
	const jqlFilter = useConfigStore((state) => state.config.jqlFilter);

	useEffect(() => {
		const fetchTimesheetData = async () => {
			if (!jiraClient) {
				setError('Jira client is not configured. Please check your settings.');
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const startDate = new Date(currentYear, currentMonth, 1);
				const endDate = new Date(currentYear, currentMonth + 1, 0);

				// Get timestamps in milliseconds for the worklog API
				// startedAfter: beginning of first day (00:00:00)
				const startMillis = startDate.getTime();
				// startedBefore: END of last day (set to 23:59:59.999)
				// This ensures worklogs on the last day of the month are included
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

				// Apply additional JQL filter if configured
				if (jqlFilter && jqlFilter.trim()) {
					jql += ` AND ${jqlFilter.trim()}`;
				}

				// Step 1: Search for issues that have worklogs in the date range
				const searchResult =
					await jiraClient.issueSearch.searchForIssuesUsingJql({
						jql,
						fields: ['summary', 'issuetype', 'parent', 'project', 'status'],
						maxResults: 1000,
					});

				// Step 2: Fetch worklogs for each issue IN PARALLEL
				let allWorklogs: EnrichedJiraWorklog[] = [];

				if (searchResult.total && searchResult.total > 0) {
					const issues = searchResult.issues ?? [];
					const startTime = performance.now();

					// Create array of promises to fetch worklogs in parallel
					const worklogPromises = issues
						.filter((issue) => issue.key)
						.map(async (issue) => {
							try {
								// Fetch worklogs for this issue with date filtering
								const worklogResponse =
									await jiraClient.issueWorklogs.getIssueWorklog({
										issueIdOrKey: issue.key!,
										startedAfter: startMillis,
										startedBefore: endMillis,
									});

								if (
									worklogResponse.worklogs &&
									worklogResponse.worklogs.length > 0
								) {
									// Add issue reference to each worklog
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
									`Failed to fetch worklogs for ${issue.key}:`,
									worklogError,
								);
								// Return empty array on error, continue with other issues
								return [];
							}
						});

					// Wait for all worklog fetches to complete
					const worklogResults = await Promise.all(worklogPromises);

					// Flatten the array of arrays into a single array
					allWorklogs = worklogResults.flat();

					const endTime = performance.now();
					console.log(
						`[Performance] Fetched ${allWorklogs.length} worklogs from ${issues.length} issues in ${Math.round(endTime - startTime)}ms (parallel)`,
					);
				}

				setData(allWorklogs);
			} catch (e) {
				if (e instanceof Error) {
					setError(`Failed to fetch data from Jira: ${e.message}`);
				} else {
					setError('An unknown error occurred.');
				}
			} finally {
				setLoading(false);
			}
		};

		fetchTimesheetData();
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
