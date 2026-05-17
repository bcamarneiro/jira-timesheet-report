import type { Config } from '../stores/useConfigStore';
import { rewriteForHostedProxy } from './jiraGateway';
import { fromHttpResponse } from './serviceErrors';

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

	const initialUrl = `${base}/rest/api/2/search?jql=${jql}&maxResults=10&fields=key,summary`;
	const initialHeaders = {
		Authorization: `Bearer ${config.apiToken}`,
		Accept: 'application/json',
		'X-Atlassian-Token': 'no-check',
	};
	const rewritten = rewriteForHostedProxy(initialUrl, initialHeaders, {
		jiraHost: config.jiraHost,
		email: config.email,
		apiToken: config.apiToken,
	});
	const res = await fetch(rewritten.url, {
		headers: rewritten.headers,
		signal,
	});

	if (!res.ok) throw fromHttpResponse('Jira search', res.status);

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
