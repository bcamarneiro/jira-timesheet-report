import { HttpResponse, http } from 'msw';
import type { JiraIssue } from '../../types/JiraIssue';
import type { JiraWorklog } from '../../types/JiraWorklog';
import MockIssueSummaries from './MockIssueSummaries';
import MockWorklogs from './MockWorklogs';

// Group worklogs by issue key for easy lookup
const worklogsByIssue: Record<string, JiraWorklog[]> = {};
for (const wl of MockWorklogs) {
	const key = wl.issueKey || wl.issueId;
	if (!worklogsByIssue[key]) {
		worklogsByIssue[key] = [];
	}
	worklogsByIssue[key].push(wl);
}

// Create mock issues with worklogs embedded (as returned by expand=worklog)
const mockIssuesWithWorklogs = Object.entries(MockIssueSummaries).map(
	([key, summary]) => {
		const issue: JiraIssue & {
			fields: {
				summary: string;
				worklog?: {
					worklogs: JiraWorklog[];
					maxResults: number;
					total: number;
					startAt: number;
				};
			};
		} = {
			id: key,
			key: key,
			expand: 'worklog',
			self: `https://mock.atlassian.net/rest/api/3/issue/${key}`,
			fields: {
				summary,
				worklog: {
					worklogs: worklogsByIssue[key] || [],
					maxResults: 50,
					total: (worklogsByIssue[key] || []).length,
					startAt: 0,
				},
			},
		};
		return issue;
	},
);

export const handlers = [
	// Mock for searching issues with JQL (used by the new architecture)
	// This endpoint is used with expand=worklog to get issues with their worklogs
	http.get('https://*.atlassian.net/rest/api/3/search', ({ request }) => {
		const url = new URL(request.url);
		const jql = url.searchParams.get('jql');
		const expand = url.searchParams.get('expand');

		console.log('[MSW] Intercepted Jira search:', { jql, expand });

		// Filter issues that have worklogs in the requested date range
		// For simplicity in offline mode, return all issues with worklogs
		const issuesWithWorklogs = mockIssuesWithWorklogs.filter(
			(issue) => (issue.fields.worklog?.worklogs.length ?? 0) > 0,
		);

		return HttpResponse.json({
			expand: expand || '',
			startAt: 0,
			maxResults: 1000,
			total: issuesWithWorklogs.length,
			issues: issuesWithWorklogs,
		});
	}),

	// Fallback: Mock for getting worklogs for a specific issue (if needed)
	http.get(
		'https://*.atlassian.net/rest/api/3/issue/:issueKey/worklog',
		({ params }) => {
			const { issueKey } = params;
			const worklogs = worklogsByIssue[issueKey as string] || [];
			return HttpResponse.json({
				startAt: 0,
				maxResults: 50,
				total: worklogs.length,
				worklogs,
			});
		},
	),
];
