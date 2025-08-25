import { JiraIssuePaginatedResponse } from "../../types/JiraIssuePaginatedResponse";
import { JIRA_DOMAIN, JIRA_PAT, JIRA_COMPONENT, getMonthBounds } from "./common";

export async function fetchIssues(year: number, monthOneBased: number): Promise<{ keys: string[]; summaries: Record<string, string> }> {
	const { jqlStartDate, jqlEndDate } = getMonthBounds(year, monthOneBased);
	const issues: string[] = [];
	const summaries: Record<string, string> = {};
	let startAt = 0;
	
	const componentFilter = JIRA_COMPONENT ? ` AND component = "${JIRA_COMPONENT}"` : '';
	const jql = `worklogDate >= '${jqlStartDate}' AND worklogDate <= '${jqlEndDate}'${componentFilter}`;

	let totalIssues = 0;

	do {
		const params = new URLSearchParams({
			jql,
			fields: 'key,summary',
			maxResults: '100',
			startAt: startAt.toString(),
		});

		const url = `https://${JIRA_DOMAIN}/rest/api/2/search?${params.toString()}`;

		const resp = await fetch(url, {
			headers: {
				'Authorization': `Bearer ${JIRA_PAT}`,
				'Accept': 'application/json',
			},
		});

		if (!resp.ok) {
			const text = await resp.text();
			console.error(`Error fetching issues: ${resp.status} - ${text}`);
			throw new Error(`Failed to fetch issues: ${resp.status} - ${text}`);
		}

		const data: JiraIssuePaginatedResponse = await resp.json();

		data.issues.forEach(issue => {
			issues.push(issue.key);
			const summary = (issue as any)?.fields?.summary as string | undefined;
			if (summary) {
				summaries[issue.key] = summary;
			}
		});
		startAt += data.issues.length;
		totalIssues = data.total;
	} while (startAt < totalIssues);

	return { keys: issues, summaries };
}


