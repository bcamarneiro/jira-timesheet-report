import { HttpResponse, http } from 'msw';
import type { JiraIssue } from '../../types/JiraIssue';
import type { JiraWorklog } from '../../types/JiraWorklog';
import MockIssueSummariesSimple from './MockIssueSummariesSimple';
import MockWorklogsSimple from './MockWorklogsSimple';

// Use simple mock data for testing
const MockIssueSummaries = MockIssueSummariesSimple;
const MockWorklogs = MockWorklogsSimple;

// Group worklogs by issue key for easy lookup
const worklogsByIssue: Record<string, JiraWorklog[]> = {};
for (const wl of MockWorklogs) {
	const key = wl.issueKey || wl.issueId;
	if (!worklogsByIssue[key]) {
		worklogsByIssue[key] = [];
	}
	worklogsByIssue[key].push(wl);
}

// Get unique issue keys from worklogs
const uniqueIssueKeys = Object.keys(worklogsByIssue);

// Create mock issues (without worklogs embedded)
const mockIssues = uniqueIssueKeys.map((key) => {
	const issue: JiraIssue = {
		id: key,
		key: key,
		self: `https://mock.atlassian.net/rest/api/2/issue/${key}`,
		fields: {
			summary: MockIssueSummaries[key] || `Issue ${key}`,
			issuetype: {
				id: '10001',
				name: 'Story',
				self: 'https://mock.atlassian.net/rest/api/2/issuetype/10001',
			},
			project: {
				id: '10000',
				key: 'MOCK',
				name: 'Mock Project',
				self: 'https://mock.atlassian.net/rest/api/2/project/10000',
			},
			status: {
				id: '10001',
				name: 'Done',
				self: 'https://mock.atlassian.net/rest/api/2/status/10001',
			},
		},
	};
	return issue;
});

export const handlers = [
	// Mock for searching issues with JQL (Step 1 of the new architecture)
	// This returns issues without worklogs
	http.get('https://*.atlassian.net/rest/api/2/search', ({ request }) => {
		const url = new URL(request.url);
		const jql = url.searchParams.get('jql');
		const fields = url.searchParams.get('fields');

		console.log('[MSW] Intercepted Jira issue search:', { jql, fields });

		// For offline mode, just return all issues that have worklogs
		const filteredIssues = mockIssues.filter(
			(issue) => worklogsByIssue[issue.key]?.length > 0,
		);

		console.log(
			`[MSW] Returning ${filteredIssues.length} issues with worklogs`,
		);

		return HttpResponse.json({
			expand: '',
			startAt: 0,
			maxResults: 1000,
			total: filteredIssues.length,
			issues: filteredIssues,
		});
	}),

	// Mock for getting worklogs for a specific issue (Step 2 of the new architecture)
	// This is called for each issue returned from the search
	http.get(
		'https://*.atlassian.net/rest/api/2/issue/:issueKey/worklog',
		({ params, request }) => {
			const { issueKey } = params;
			const url = new URL(request.url);
			const startedAfter = url.searchParams.get('startedAfter');
			const startedBefore = url.searchParams.get('startedBefore');

			console.log('[MSW] Intercepted worklog fetch for issue:', {
				issueKey,
				startedAfter,
				startedBefore,
			});

			let worklogs = worklogsByIssue[issueKey as string] || [];

			// Filter worklogs by date range if parameters are provided
			if (startedAfter || startedBefore) {
				const afterMillis = startedAfter ? Number.parseInt(startedAfter) : 0;
				const beforeMillis = startedBefore
					? Number.parseInt(startedBefore)
					: Number.POSITIVE_INFINITY;

				worklogs = worklogs.filter((wl) => {
					const startedDate = new Date(wl.started);
					const worklogMillis = startedDate.getTime();
					return worklogMillis >= afterMillis && worklogMillis <= beforeMillis;
				});

				console.log(
					`[MSW] Filtered worklogs for ${issueKey}: ${worklogs.length} in date range`,
				);
			}

			return HttpResponse.json({
				startAt: 0,
				maxResults: 50,
				total: worklogs.length,
				worklogs,
			});
		},
	),
];
