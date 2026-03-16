import { useEffect, useState } from 'react';
import { useConfigStore } from '../../stores/useConfigStore';

interface MonthHeatmapResult {
	data: Map<string, number>;
	isLoading: boolean;
	month: number;
	year: number;
}

function buildBaseUrl(jiraHost: string, corsProxy: string): string {
	return corsProxy
		? `${corsProxy.replace(/\/$/, '')}/https://${jiraHost}`
		: `https://${jiraHost}`;
}

export function useMonthHeatmapData(): MonthHeatmapResult {
	const config = useConfigStore((s) => s.config);
	const now = new Date();
	const month = now.getMonth();
	const year = now.getFullYear();

	const [data, setData] = useState<Map<string, number>>(new Map());
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!config.jiraHost || !config.apiToken) return;

		const controller = new AbortController();
		const { signal } = controller;

		async function fetchMonth() {
			setIsLoading(true);

			const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
			const daysInMonth = new Date(year, month + 1, 0).getDate();
			const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

			const base = buildBaseUrl(config.jiraHost, config.corsProxy);
			const jql = encodeURIComponent(
				`worklogDate >= "${monthStart}" AND worklogDate <= "${monthEnd}" AND worklogAuthor = currentUser()`,
			);

			try {
				const res = await fetch(
					`${base}/rest/api/2/search?jql=${jql}&maxResults=100&fields=key,summary,worklog`,
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

				const result = (await res.json()) as {
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

				if (signal.aborted) return;

				const dayMap = new Map<string, number>();
				const email = config.email.toLowerCase();

				for (const issue of result.issues) {
					for (const wl of issue.fields.worklog?.worklogs ?? []) {
						if (wl.author?.emailAddress?.toLowerCase() !== email) continue;
						const day = wl.started.slice(0, 10);
						if (day >= monthStart && day <= monthEnd) {
							dayMap.set(day, (dayMap.get(day) ?? 0) + wl.timeSpentSeconds);
						}
					}
				}

				setData(dayMap);
			} catch (e) {
				if (!signal.aborted) {
					console.error('Failed to fetch month heatmap data:', e);
				}
			} finally {
				if (!signal.aborted) {
					setIsLoading(false);
				}
			}
		}

		fetchMonth();

		return () => controller.abort();
	}, [
		config.jiraHost,
		config.apiToken,
		config.corsProxy,
		config.email,
		month,
		year,
	]);

	return { data, isLoading, month, year };
}
