export interface JiraWorklog {
	self: string;
	author: JiraUser; // more explicit now
	updateAuthor: JiraUser; // same as author
	comment: string; // may be multi-line text
	created: string; // ISO date string
	updated: string; // ISO date string
	started: string; // ISO date string
	timeSpent: string; // e.g. "2h", "1d"
	timeSpentSeconds: number;
	id: string;
	issueId: string;
	// Enriched on server-side for convenience; Jira worklog payloads typically only include numeric issueId
	issueKey?: string;
}

export interface JiraUser {
	self: string;
	accountId: string;
	displayName: string;
	active: boolean;
	[key: string]: unknown; // allow extra Jira-provided fields
}
