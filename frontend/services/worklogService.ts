import { logger } from '../react/utils/logger';

export interface WorklogEntry {
	date: string;
	issueKey?: string;
	issueSummary?: string;
	timeSpentSeconds: number;
}

export interface WorklogFetchConfig {
	jiraHost: string;
	apiToken: string;
	corsProxy: string;
	email: string;
}

interface JiraWorklogItem {
	author: { emailAddress?: string };
	started: string;
	timeSpentSeconds: number;
}

interface JiraWorklogResponse {
	startAt: number;
	maxResults: number;
	total: number;
	worklogs: JiraWorklogItem[];
}

interface JiraSearchIssue {
	key: string;
	fields: {
		summary?: string;
		worklog?: JiraWorklogResponse;
	};
}

export async function fetchWeekWorklogs(
	config: WorklogFetchConfig,
	weekStart: string,
	weekEnd: string,
	signal?: AbortSignal,
): Promise<WorklogEntry[]> {
	if (!config.jiraHost || !config.apiToken) return [];

	const base = config.corsProxy
		? `${config.corsProxy.replace(/\/$/, '')}/https://${config.jiraHost}`
		: `https://${config.jiraHost}`;

	const headers = {
		Authorization: `Bearer ${config.apiToken}`,
		Accept: 'application/json',
		'X-Atlassian-Token': 'no-check',
	};

	const jql = encodeURIComponent(
		`worklogDate >= "${weekStart}" AND worklogDate <= "${weekEnd}" AND worklogAuthor = currentUser()`,
	);

	const res = await fetch(
		`${base}/rest/api/2/search?jql=${jql}&maxResults=50&fields=key,summary,worklog`,
		{ headers, signal },
	);

	if (!res.ok) throw new Error(`Jira API error: ${res.status}`);

	const data = (await res.json()) as { issues: JiraSearchIssue[] };

	const entries: WorklogEntry[] = [];
	const email = config.email.toLowerCase();

	// Convert date range to millis for the separate worklog endpoint
	const startMillis = new Date(weekStart).getTime();
	const endDate = new Date(weekEnd);
	endDate.setHours(23, 59, 59, 999);
	const endMillis = endDate.getTime();

	for (const issue of data.issues) {
		const embedded = issue.fields.worklog;
		let worklogs: JiraWorklogItem[];

		if (embedded && embedded.total > embedded.worklogs.length) {
			// Embedded worklogs are truncated — fetch all via the dedicated endpoint
			worklogs = await fetchAllIssueWorklogs(
				base,
				headers,
				issue.key,
				startMillis,
				endMillis,
				signal,
			);
		} else {
			worklogs = embedded?.worklogs || [];
		}

		for (const wl of worklogs) {
			if (wl.author?.emailAddress?.toLowerCase() !== email) continue;
			const day = wl.started.slice(0, 10);
			if (day >= weekStart && day <= weekEnd) {
				entries.push({
					date: day,
					issueKey: issue.key,
					issueSummary: issue.fields.summary,
					timeSpentSeconds: wl.timeSpentSeconds,
				});
			}
		}
	}

	return entries;
}

/** Fetch all worklogs for a specific issue, paginating if needed. */
async function fetchAllIssueWorklogs(
	base: string,
	headers: Record<string, string>,
	issueKey: string,
	startedAfter: number,
	startedBefore: number,
	signal?: AbortSignal,
): Promise<JiraWorklogItem[]> {
	const url = `${base}/rest/api/2/issue/${issueKey}/worklog?startedAfter=${startedAfter}&startedBefore=${startedBefore}`;

	const res = await fetch(url, { headers, signal });
	if (!res.ok) {
		logger.error(
			`[worklogService] Failed to fetch worklogs for ${issueKey}: ${res.status}`,
		);
		return [];
	}

	const data = (await res.json()) as JiraWorklogResponse;
	return data.worklogs || [];
}
