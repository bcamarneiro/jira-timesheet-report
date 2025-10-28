import type { Config } from '../stores/useConfigStore';

export interface JiraUser {
	accountId: string;
	displayName: string;
	emailAddress?: string;
}

export interface JiraWorklog {
	id: string;
	author: {
		accountId: string;
		displayName: string;
	};
	started: string;
	timeSpentSeconds: number;
	comment?: string;
}

export interface JiraIssue {
	key: string;
	fields: {
		summary: string;
		issuetype?: { name: string };
		parent?: { key: string };
		project?: { name: string };
		status?: { name: string };
		worklog?: {
			worklogs: JiraWorklog[];
		};
	};
}

export interface JiraSearchResult {
	issues: JiraIssue[];
	total: number;
}

export class SimpleJiraClient {
	private baseUrl: string;
	private token: string;

	constructor(config: Config) {
		// If CORS proxy is configured, use it
		const host = config.corsProxy
			? `${config.corsProxy.replace(/\/$/, '')}/https://${config.jiraHost}`
			: `https://${config.jiraHost}`;

		this.baseUrl = host;
		this.token = config.apiToken;
	}

	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;

		const headers: HeadersInit = {
			'Authorization': `Bearer ${this.token}`,
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			...options.headers,
		};

		const response = await fetch(url, {
			...options,
			headers,
		});

		if (!response.ok) {
			const text = await response.text();
			throw new Error(`Jira API error: ${response.status} - ${text}`);
		}

		return response.json();
	}

	async getCurrentUser(): Promise<JiraUser> {
		return this.request<JiraUser>('/rest/api/3/myself');
	}

	async searchIssues(jql: string, fields: string[] = [], expand: string[] = [], maxResults = 1000): Promise<JiraSearchResult> {
		const params = new URLSearchParams({
			jql,
			maxResults: maxResults.toString(),
		});

		if (fields.length > 0) {
			params.append('fields', fields.join(','));
		}

		if (expand.length > 0) {
			params.append('expand', expand.join(','));
		}

		return this.request<JiraSearchResult>(`/rest/api/3/search?${params.toString()}`);
	}
}
