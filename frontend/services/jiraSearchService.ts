import type { Config } from '../stores/useConfigStore';

export interface JiraSearchResult {
	key: string;
	summary: string;
}

function buildBaseUrl(config: Config): string {
	return config.corsProxy
		? `${config.corsProxy.replace(/\/$/, '')}/https://${config.jiraHost}`
		: `https://${config.jiraHost}`;
}

export async function searchJiraIssues(
	config: Config,
	query: string,
	signal?: AbortSignal,
): Promise<JiraSearchResult[]> {
	if (!config.jiraHost || !config.apiToken || !query.trim()) return [];

	const base = buildBaseUrl(config);
	const trimmed = query.trim();

	// Build JQL: exact key match OR summary text search
	const jqlParts: string[] = [];

	// Check if the query looks like a Jira key (e.g., PROJ-123)
	const looksLikeKey = /^[A-Z][A-Z0-9]+-\d+$/i.test(trimmed);
	if (looksLikeKey) {
		jqlParts.push(`key = "${trimmed.toUpperCase()}"`);
	}

	jqlParts.push(`summary ~ "${trimmed}"`);

	const jql = encodeURIComponent(jqlParts.join(' OR '));

	const res = await fetch(
		`${base}/rest/api/2/search?jql=${jql}&maxResults=10&fields=key,summary`,
		{
			headers: {
				Authorization: `Bearer ${config.apiToken}`,
				Accept: 'application/json',
				'X-Atlassian-Token': 'no-check',
			},
			signal,
		},
	);

	if (!res.ok) throw new Error(`Jira search error: ${res.status}`);

	const data = (await res.json()) as {
		issues: {
			key: string;
			fields: { summary?: string };
		}[];
	};

	return data.issues.map((issue) => ({
		key: issue.key,
		summary: issue.fields.summary ?? '',
	}));
}
