import { useEffect } from 'react';
import type { RescueTimeDaySummary } from '../../../types/Suggestion';
import { fetchGitlabSuggestions } from '../../services/gitlabService';
import { fetchJiraActivitySuggestions } from '../../services/jiraActivityService';
import { fetchRescueTimeData } from '../../services/rescueTimeService';
import { mergeSuggestions } from '../../services/suggestionMerger';
import { useConfigStore } from '../../stores/useConfigStore';
import { useDashboardStore } from '../../stores/useDashboardStore';

interface WorklogEntry {
	date: string;
	issueKey?: string;
	timeSpentSeconds: number;
}

async function fetchWeekWorklogs(
	config: {
		jiraHost: string;
		apiToken: string;
		corsProxy: string;
		email: string;
	},
	weekStart: string,
	weekEnd: string,
	signal?: AbortSignal,
): Promise<WorklogEntry[]> {
	if (!config.jiraHost || !config.apiToken) return [];

	const base = config.corsProxy
		? `${config.corsProxy.replace(/\/$/, '')}/https://${config.jiraHost}`
		: `https://${config.jiraHost}`;

	const jql = encodeURIComponent(
		`worklogDate >= "${weekStart}" AND worklogDate <= "${weekEnd}" AND worklogAuthor = currentUser()`,
	);

	const res = await fetch(
		`${base}/rest/api/2/search?jql=${jql}&maxResults=50&fields=key,summary,worklog`,
		{
			headers: {
				Authorization: `Bearer ${config.apiToken}`,
				Accept: 'application/json',
				'X-Atlassian-Token': 'no-check',
			},
			signal,
		},
	);

	if (!res.ok) throw new Error(`Jira API error: ${res.status}`);

	const data = (await res.json()) as {
		issues: {
			key: string;
			fields: {
				worklog?: {
					worklogs: {
						author: { emailAddress?: string };
						started: string;
						timeSpentSeconds: number;
					}[];
				};
			};
		}[];
	};

	const entries: WorklogEntry[] = [];
	const email = config.email.toLowerCase();

	for (const issue of data.issues) {
		for (const wl of issue.fields.worklog?.worklogs || []) {
			if (wl.author?.emailAddress?.toLowerCase() !== email) continue;
			const day = wl.started.slice(0, 10);
			if (day >= weekStart && day <= weekEnd) {
				entries.push({
					date: day,
					issueKey: issue.key,
					timeSpentSeconds: wl.timeSpentSeconds,
				});
			}
		}
	}

	return entries;
}

export function useDashboardDataFetcher() {
	const config = useConfigStore((s) => s.config);
	const weekStart = useDashboardStore((s) => s.weekStart);
	const weekEnd = useDashboardStore((s) => s.weekEnd);
	const setDaySummaries = useDashboardStore((s) => s.setDaySummaries);
	const setLoading = useDashboardStore((s) => s.setLoading);
	const setError = useDashboardStore((s) => s.setError);

	useEffect(() => {
		if (!config.jiraHost || !config.apiToken) return;

		const controller = new AbortController();
		const { signal } = controller;

		async function run() {
			// Reset errors
			setError('worklogs', null);
			setError('jira', null);
			setError('gitlab', null);
			setError('rescuetime', null);

			// Fetch all sources in parallel
			setLoading('worklogs', true);
			setLoading('jira', true);
			if (config.gitlabToken && config.gitlabHost) setLoading('gitlab', true);
			if (config.rescueTimeApiKey) setLoading('rescuetime', true);

			const [worklogs, jiraSuggestions, gitlabSuggestions, rescueTimeData] =
				await Promise.all([
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

			const summaries = mergeSuggestions(
				weekStart,
				jiraSuggestions,
				gitlabSuggestions,
				rescueTimeData,
				worklogs,
			);

			setDaySummaries(summaries);
		}

		run();

		return () => controller.abort();
	}, [config, weekStart, weekEnd, setDaySummaries, setLoading, setError]);
}
