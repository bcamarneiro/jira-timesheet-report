import { JiraIssuePaginatedResponse } from "../../types/JiraIssuePaginatedResponse";
import { JiraConfig, getMonthBounds } from "./common";

export async function fetchIssues(year: number, monthOneBased: number, jiraConfig: JiraConfig): Promise<{ keys: string[]; summaries: Record<string, string> }> {
	const { jqlStartDate, jqlEndDate } = getMonthBounds(year, monthOneBased);
	const issues: string[] = [];
	const summaries: Record<string, string> = {};
	let startAt = 0;
	
	// Build component filter from configuration
	let componentFilter = '';
	if (jiraConfig.components.length > 0) {
		// Use project configuration components
		const componentConditions = jiraConfig.components.map(component => `component = "${component}"`).join(' OR ');
		componentFilter = ` AND (${componentConditions})`;
	}
	
	const jql = `worklogDate >= '${jqlStartDate}' AND worklogDate <= '${jqlEndDate}'${componentFilter}`;

	let totalIssues = 0;

	do {
		const params = new URLSearchParams({
			jql,
			fields: 'key,summary',
			maxResults: '100',
			startAt: startAt.toString(),
		});

		const url = `https://${jiraConfig.domain}/rest/api/2/search?${params.toString()}`;

		const resp = await fetch(url, {
			headers: {
				'Authorization': `Bearer ${jiraConfig.pat}`,
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


