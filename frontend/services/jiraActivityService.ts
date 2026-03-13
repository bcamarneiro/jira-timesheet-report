import type { WorklogSuggestion } from '../../types/Suggestion';
import type { Config } from '../stores/useConfigStore';

const JIRA_KEY_RE = /([A-Z][A-Z0-9]+-\d+)/;

interface JiraChangelog {
	histories: {
		created: string;
		author: { emailAddress?: string; displayName?: string };
		items: { field: string; fromString?: string; toString?: string }[];
	}[];
}

interface JiraIssueWithChangelog {
	key: string;
	fields: { summary?: string };
	changelog?: JiraChangelog;
}

function buildUrl(config: Config, path: string): string {
	const base = config.corsProxy
		? `${config.corsProxy.replace(/\/$/, '')}/https://${config.jiraHost}`
		: `https://${config.jiraHost}`;
	return `${base}${path}`;
}

async function jiraFetch(
	config: Config,
	path: string,
	signal?: AbortSignal,
): Promise<unknown> {
	const res = await fetch(buildUrl(config, path), {
		headers: {
			Authorization: `Bearer ${config.apiToken}`,
			Accept: 'application/json',
			'X-Atlassian-Token': 'no-check',
		},
		signal,
	});
	if (!res.ok) throw new Error(`Jira API error: ${res.status}`);
	return res.json();
}

function dateOnly(iso: string): string {
	return iso.slice(0, 10);
}

/**
 * Fetch Jira issues the user interacted with during the given week,
 * then analyze changelogs to produce worklog suggestions.
 */
export async function fetchJiraActivitySuggestions(
	config: Config,
	weekStart: string,
	weekEnd: string,
	signal?: AbortSignal,
): Promise<WorklogSuggestion[]> {
	if (!config.jiraHost || !config.apiToken) return [];

	const jql = encodeURIComponent(
		`(assignee = currentUser() OR worklogAuthor = currentUser()) AND updated >= "${weekStart}" AND updated <= "${weekEnd}"`,
	);
	const searchResult = (await jiraFetch(
		config,
		`/rest/api/2/search?jql=${jql}&maxResults=20&fields=summary`,
		signal,
	)) as { issues: { key: string; fields: { summary?: string } }[] };

	const suggestions: WorklogSuggestion[] = [];

	// Fetch changelogs in parallel (max 20 issues)
	const issueDetails = await Promise.all(
		searchResult.issues.map((issue) =>
			jiraFetch(
				config,
				`/rest/api/2/issue/${issue.key}?expand=changelog&fields=summary`,
				signal,
			).then((data) => data as JiraIssueWithChangelog),
		),
	);

	const userEmail = config.email.toLowerCase();

	for (const issue of issueDetails) {
		if (!issue.changelog?.histories) continue;

		// Group activity by date
		const activityDays = new Map<
			string,
			{ transitions: number; comments: number }
		>();

		for (const history of issue.changelog.histories) {
			const authorEmail = history.author?.emailAddress?.toLowerCase() ?? '';
			if (authorEmail !== userEmail) continue;

			const day = dateOnly(history.created);
			if (day < weekStart || day > weekEnd) continue;

			const existing = activityDays.get(day) || {
				transitions: 0,
				comments: 0,
			};

			for (const item of history.items) {
				if (item.field === 'status') {
					existing.transitions++;
				} else if (item.field === 'comment') {
					existing.comments++;
				}
			}

			activityDays.set(day, existing);
		}

		for (const [day, activity] of activityDays) {
			// Estimate: 1h per transition, 30m per comment, min 30m
			const estimatedSeconds = Math.max(
				1800,
				activity.transitions * 3600 + activity.comments * 1800,
			);
			const hours = estimatedSeconds / 3600;
			const timeSpent =
				hours >= 1
					? `${Math.floor(hours)}h${estimatedSeconds % 3600 > 0 ? ` ${Math.round((estimatedSeconds % 3600) / 60)}m` : ''}`
					: `${Math.round(estimatedSeconds / 60)}m`;

			suggestions.push({
				id: `jira-${issue.key}-${day}`,
				source: 'jira-activity',
				issueKey: issue.key,
				issueSummary: issue.fields.summary,
				date: day,
				suggestedTimeSpent: timeSpent,
				suggestedSeconds: estimatedSeconds,
				confidence: activity.transitions > 0 ? 'medium' : 'low',
				reason: [
					activity.transitions > 0
						? `${activity.transitions} status change${activity.transitions > 1 ? 's' : ''}`
						: '',
					activity.comments > 0
						? `${activity.comments} comment${activity.comments > 1 ? 's' : ''}`
						: '',
				]
					.filter(Boolean)
					.join(', '),
				logged: false,
			});
		}
	}

	return suggestions;
}

export { JIRA_KEY_RE };
