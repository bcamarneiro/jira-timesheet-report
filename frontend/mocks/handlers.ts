import { HttpResponse, http } from 'msw';
import type { JiraIssue } from '../../types/JiraIssue';
import type { JiraWorklog } from '../../types/JiraWorklog';
import { logger } from '../react/utils/logger';
import { addDaysToIsoDate, parseIsoDateLocal, toLocalDateString } from '../react/utils/date';
import MockIssueSummariesSimple from './MockIssueSummariesSimple';
import MockWorklogsSimple from './MockWorklogsSimple';

// Use simple mock data for testing
const MockIssueSummaries = MockIssueSummariesSimple;
const MockWorklogs = MockWorklogsSimple;

// ── Dev user (matches the offline mode config in main.tsx) ──────────
const devUser = {
	self: 'https://mock.atlassian.net/rest/api/2/user?accountId=dev001',
	accountId: 'dev001',
	emailAddress: 'dev@example.com',
	displayName: 'Dev User',
	active: true,
	timeZone: 'America/Sao_Paulo',
};

// ── Date helpers ────────────────────────────────────────────────────
function getMonday(date: Date): string {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	d.setDate(diff);
	return toLocalDateString(d);
}

function getWeekdays(monday: string): string[] {
	return Array.from({ length: 5 }, (_, index) => addDaysToIsoDate(monday, index));
}

function shiftWeek(monday: string, weeks: number): string {
	const d = parseIsoDateLocal(monday);
	d.setDate(d.getDate() + weeks * 7);
	return toLocalDateString(d);
}

// ── Generate dev user worklogs for current & previous weeks ─────────
const todayMonday = getMonday(new Date());
const prevMonday = shiftWeek(todayMonday, -1);

// Current week: some days with work, some partial (to create gaps)
const devIssues: Record<string, string> = {
	'DEV-1': 'Implement authentication flow',
	'DEV-2': 'Fix dashboard performance issues',
	'DEV-3': 'Update API documentation',
};

let devWorklogId = 5000;

function makeDevWorklog(
	issueKey: string,
	dateStr: string,
	hours: number,
): JiraWorklog {
	const id = (devWorklogId++).toString();
	const started = `${dateStr}T09:00:00.000-0300`;
	return {
		self: `https://mock.atlassian.net/rest/api/2/issue/${issueKey}/worklog/${id}`,
		id,
		issueId: issueKey,
		issueKey,
		author: devUser,
		updateAuthor: devUser,
		comment: 'Development work',
		created: started,
		updated: started,
		started,
		timeSpent: `${hours}h`,
		timeSpentSeconds: hours * 3600,
	};
}

const devWorklogs: JiraWorklog[] = [];

// Current week: Mon 4h DEV-1 + 4h DEV-2, Tue 8h DEV-1, Wed 6h DEV-2, Thu 0h (gap), Fri 0h (gap)
const currentWeekdays = getWeekdays(todayMonday);
if (currentWeekdays[0]) {
	devWorklogs.push(makeDevWorklog('DEV-1', currentWeekdays[0], 4));
	devWorklogs.push(makeDevWorklog('DEV-2', currentWeekdays[0], 4));
}
if (currentWeekdays[1]) {
	devWorklogs.push(makeDevWorklog('DEV-1', currentWeekdays[1], 8));
}
if (currentWeekdays[2]) {
	devWorklogs.push(makeDevWorklog('DEV-2', currentWeekdays[2], 6));
}
// Thu and Fri have no worklogs -> gaps for testing

// Previous week: full 8h every day on DEV-3 (for "Copy Prev Week")
for (const day of getWeekdays(prevMonday)) {
	devWorklogs.push(makeDevWorklog('DEV-3', day, 8));
}

// ── Group ALL worklogs (existing mock + dev user) by issue key ──────
const allWorklogs = [...MockWorklogs, ...devWorklogs];

const worklogsByIssue: Record<string, JiraWorklog[]> = {};
for (const wl of allWorklogs) {
	const key = wl.issueKey || wl.issueId;
	if (!worklogsByIssue[key]) {
		worklogsByIssue[key] = [];
	}
	worklogsByIssue[key].push(wl);
}

// Get unique issue keys from worklogs
const uniqueIssueKeys = Object.keys(worklogsByIssue);

// Merge issue summaries
const allIssueSummaries: Record<string, string> = {
	...MockIssueSummaries,
	...devIssues,
};

// Create mock issues
const mockIssues = uniqueIssueKeys.map((key) => {
	const issue: JiraIssue = {
		id: key,
		key: key,
		self: `https://mock.atlassian.net/rest/api/2/issue/${key}`,
		fields: {
			summary: allIssueSummaries[key] || `Issue ${key}`,
			issuetype: {
				id: '10001',
				name: 'Story',
				self: 'https://mock.atlassian.net/rest/api/2/issuetype/10001',
			},
			project: {
				id: '10000',
				key: key.split('-')[0],
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

// ── MSW Handlers ────────────────────────────────────────────────────
export const handlers = [
	// Search issues — returns worklog data embedded when fields include "worklog"
	http.get('https://*.atlassian.net/rest/api/2/search', ({ request }) => {
		const url = new URL(request.url);
		const jql = url.searchParams.get('jql') || '';
		const fields = url.searchParams.get('fields') || '';

		logger.debug('[MSW] Intercepted Jira issue search:', { jql, fields });

		const filteredIssues = mockIssues.filter(
			(issue) => worklogsByIssue[issue.key]?.length > 0,
		);

		// If the request asks for worklog fields, embed them in the response
		const includeWorklogs = fields.includes('worklog');

		const issues = filteredIssues.map((issue) => {
			if (!includeWorklogs) return issue;

			const issueWorklogs = worklogsByIssue[issue.key] || [];
			return {
				...issue,
				fields: {
					...issue.fields,
					worklog: {
						startAt: 0,
						maxResults: 50,
						total: issueWorklogs.length,
						worklogs: issueWorklogs,
					},
				},
			};
		});

		logger.debug(
			`[MSW] Returning ${issues.length} issues (worklogs embedded: ${includeWorklogs})`,
		);

		return HttpResponse.json({
			expand: '',
			startAt: 0,
			maxResults: 1000,
			total: issues.length,
			issues,
		});
	}),

	// Issue detail — supports ?expand=changelog and ?fields=summary
	http.get(
		'https://*.atlassian.net/rest/api/2/issue/:issueKey',
		({ params, request }) => {
			const { issueKey } = params;
			const url = new URL(request.url);
			const expand = url.searchParams.get('expand') || '';

			logger.debug('[MSW] Intercepted issue detail:', {
				issueKey,
				expand,
			});

			const issue = mockIssues.find((i) => i.key === issueKey);

			const result: Record<string, unknown> = {
				id: issue?.id || issueKey,
				key: issueKey,
				self: `https://mock.atlassian.net/rest/api/2/issue/${issueKey}`,
				fields: {
					summary: allIssueSummaries[issueKey as string] || `Issue ${issueKey}`,
					issuetype: issue?.fields.issuetype || {
						id: '10001',
						name: 'Story',
						self: 'https://mock.atlassian.net/rest/api/2/issuetype/10001',
					},
					project: issue?.fields.project || {
						id: '10000',
						key: 'MOCK',
						name: 'Mock Project',
						self: 'https://mock.atlassian.net/rest/api/2/project/10000',
					},
					status: issue?.fields.status || {
						id: '10001',
						name: 'Done',
						self: 'https://mock.atlassian.net/rest/api/2/status/10001',
					},
				},
			};

			// If requesting changelog, provide mock activity data
			if (expand.includes('changelog')) {
				const worklogs = worklogsByIssue[issueKey as string] || [];
				// Create one changelog entry per day that has worklogs
				const dates = new Set(worklogs.map((wl) => wl.started.slice(0, 10)));
				result.changelog = {
					startAt: 0,
					maxResults: 100,
					total: dates.size,
					histories: [...dates].map((date) => ({
						id: `hist-${issueKey}-${date}`,
						created: `${date}T10:00:00.000-0300`,
						author:
							worklogs.find((wl) => wl.started.slice(0, 10) === date)?.author ||
							devUser,
						items: [
							{
								field: 'status',
								fromString: 'In Progress',
								toString: 'Done',
							},
						],
					})),
				};
			}

			return HttpResponse.json(result);
		},
	),

	// Get worklogs for a specific issue
	http.get(
		'https://*.atlassian.net/rest/api/2/issue/:issueKey/worklog',
		({ params, request }) => {
			const { issueKey } = params;
			const url = new URL(request.url);
			const startedAfter = url.searchParams.get('startedAfter');
			const startedBefore = url.searchParams.get('startedBefore');

			logger.debug('[MSW] Intercepted worklog fetch for issue:', {
				issueKey,
				startedAfter,
				startedBefore,
			});

			let worklogs = worklogsByIssue[issueKey as string] || [];

			// Filter worklogs by date range if parameters are provided
			if (startedAfter || startedBefore) {
				const afterMillis = startedAfter
					? Number.parseInt(startedAfter, 10)
					: 0;
				const beforeMillis = startedBefore
					? Number.parseInt(startedBefore, 10)
					: Number.POSITIVE_INFINITY;

				worklogs = worklogs.filter((wl) => {
					const startedDate = new Date(wl.started);
					const worklogMillis = startedDate.getTime();
					return worklogMillis >= afterMillis && worklogMillis <= beforeMillis;
				});

				logger.debug(
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

	// Create worklog
	http.post(
		'https://*.atlassian.net/rest/api/2/issue/:issueKey/worklog',
		async ({ params, request }) => {
			const { issueKey } = params;
			const body = (await request.json()) as Record<string, unknown>;
			const id = (devWorklogId++).toString();

			logger.debug('[MSW] Creating worklog for:', { issueKey, body });

			return HttpResponse.json({
				self: `https://mock.atlassian.net/rest/api/2/issue/${issueKey}/worklog/${id}`,
				id,
				issueId: issueKey,
				author: devUser,
				updateAuthor: devUser,
				comment: body.comment || '',
				created: body.started || new Date().toISOString(),
				updated: body.started || new Date().toISOString(),
				started: body.started || new Date().toISOString(),
				timeSpent: body.timeSpent || '1h',
				timeSpentSeconds:
					typeof body.timeSpentSeconds === 'number'
						? body.timeSpentSeconds
						: 3600,
			});
		},
	),

	// Delete worklog
	http.delete(
		'https://*.atlassian.net/rest/api/2/issue/:issueKey/worklog/:worklogId',
		({ params }) => {
			logger.debug('[MSW] Deleting worklog:', params);
			return new HttpResponse(null, { status: 204 });
		},
	),
];
