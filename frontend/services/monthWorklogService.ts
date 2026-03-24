import { logger } from '../react/utils/logger';
import type { EnrichedJiraWorklog, JiraUser } from '../../types/jira';
import type { Config } from '../stores/useConfigStore';

export type WorklogAuthor = JiraUser;
export type WorklogItem = EnrichedJiraWorklog;

export interface FetchMonthOptions {
	currentUserOnly?: boolean;
	jqlFilter?: string;
}

interface EmbeddedWorklog {
	self?: string;
	id?: string;
	author?: JiraUser;
	updateAuthor?: JiraUser;
	comment?: string | Record<string, unknown>;
	created?: string;
	updated?: string;
	started?: string;
	timeSpent?: string;
	timeSpentSeconds?: number;
	issueId?: string;
}

interface SearchIssue {
	id: string;
	key: string;
	self?: string;
	fields: {
		summary?: string;
		[key: string]: unknown;
		worklog?: {
			startAt: number;
			maxResults: number;
			total: number;
			worklogs: EmbeddedWorklog[];
		};
	};
}

function buildBaseUrl(config: Config): string {
	return config.corsProxy
		? `${config.corsProxy.replace(/\/$/, '')}/https://${config.jiraHost}`
		: `https://${config.jiraHost}`;
}

function pad(n: number): string {
	return String(n).padStart(2, '0');
}

export async function fetchMonthWorklogs(
	config: Config,
	year: number,
	month: number,
	options?: FetchMonthOptions,
	signal?: AbortSignal,
): Promise<WorklogItem[]> {
	if (!config.jiraHost || !config.apiToken) return [];

	const base = buildBaseUrl(config);
	const headers: Record<string, string> = {
		Authorization: `Bearer ${config.apiToken}`,
		Accept: 'application/json',
		'X-Atlassian-Token': 'no-check',
	};

	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const startStr = `${year}-${pad(month + 1)}-01`;
	const endStr = `${year}-${pad(month + 1)}-${pad(daysInMonth)}`;

	// Build JQL
	let jql = `worklogDate >= "${startStr}" AND worklogDate <= "${endStr}"`;
	if (options?.currentUserOnly) {
		jql += ' AND worklogAuthor = currentUser()';
	}
	if (options?.jqlFilter?.trim()) {
		jql += ` AND ${options.jqlFilter.trim()}`;
	}

	// Step 1: Search with embedded worklogs included
	// Jira embeds up to 20 worklogs per issue. For issues with ≤20 total
	// worklogs, we get everything from the search — no extra API call needed.
	const issues: SearchIssue[] = [];
	let startAt = 0;
	const maxResults = 100;
	const fields = 'key,summary,issuetype,parent,project,status,worklog';

	while (true) {
		const searchUrl = `${base}/rest/api/2/search?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&startAt=${startAt}&fields=${fields}`;
		const res = await fetch(searchUrl, { headers, signal });
		if (!res.ok) throw new Error(`Jira search error: ${res.status}`);
		const data = (await res.json()) as {
			issues: SearchIssue[];
			total: number;
		};

		for (const issue of data.issues) {
			issues.push(issue);
		}

		if (issues.length >= data.total || data.issues.length === 0) break;
		startAt += maxResults;
	}

	if (signal?.aborted) return [];

	// Step 2: Split issues into complete (embedded has all worklogs) vs truncated
	const allWorklogs: WorklogItem[] = [];
	const truncatedIssues: SearchIssue[] = [];

	for (const issue of issues) {
		const embedded = issue.fields.worklog;
		if (!embedded) {
			truncatedIssues.push(issue);
			continue;
		}

		if (embedded.total <= embedded.maxResults) {
			// Embedded worklogs are COMPLETE — use them directly, filter by date in JS
			for (const wl of embedded.worklogs) {
				const day = (wl.started ?? '').slice(0, 10);
				if (day >= startStr && day <= endStr) {
					allWorklogs.push({ ...wl, issue });
				}
			}
		} else {
			// Embedded worklogs are TRUNCATED — need separate fetch
			truncatedIssues.push(issue);
		}
	}

	// Step 3: Fetch full worklogs only for truncated issues (typically very few)
	if (truncatedIssues.length > 0) {
		logger.debug(
			`[MonthWorklogs] ${issues.length} issues: ${issues.length - truncatedIssues.length} complete from search, ${truncatedIssues.length} need separate fetch`,
		);

		const startMillis = new Date(year, month, 1).getTime();
		const endMillis = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
		const batchSize = 20;

		for (let i = 0; i < truncatedIssues.length; i += batchSize) {
			if (signal?.aborted) return [];
			const batch = truncatedIssues.slice(i, i + batchSize);
			const results = await Promise.all(
				batch.map(async (issue) => {
					try {
						const url = `${base}/rest/api/2/issue/${issue.key}/worklog?startedAfter=${startMillis}&startedBefore=${endMillis}`;
						const res = await fetch(url, { headers, signal });
						if (!res.ok) return [];
						const data = (await res.json()) as {
							worklogs: EmbeddedWorklog[];
						};
						return (data.worklogs || []).map((wl) => ({
							...wl,
							issue,
						}));
					} catch {
						return [];
					}
				}),
			);
			for (const worklogs of results) {
				allWorklogs.push(...worklogs);
			}
		}
	} else {
		logger.debug(
			`[MonthWorklogs] ${issues.length} issues — all worklogs from search response (0 extra requests)`,
		);
	}

	logger.debug(`[MonthWorklogs] Total: ${allWorklogs.length} worklogs`);
	return allWorklogs;
}
