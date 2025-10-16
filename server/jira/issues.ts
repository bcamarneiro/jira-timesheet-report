import type { JiraIssuePaginatedResponse } from "../../types/JiraIssuePaginatedResponse";
import {
	getMonthBounds,
	JIRA_COMPONENT,
	JIRA_DOMAIN,
	JIRA_PAT,
} from "./common";

export async function fetchIssues(
	year: number,
	monthOneBased: number,
): Promise<{ keys: string[]; summaries: Record<string, string> }> {
	const { jqlStartDate, jqlEndDate } = getMonthBounds(year, monthOneBased);
	const issues: string[] = [];
	const summaries: Record<string, string> = {};
	let startAt = 0;

	const componentFilter = JIRA_COMPONENT
		? ` AND component = "${JIRA_COMPONENT}"`
		: "";
	const jql = `worklogDate >= '${jqlStartDate}' AND worklogDate <= '${jqlEndDate}'${componentFilter}`;

	let totalIssues = 0;

	do {
		const params = new URLSearchParams({
			jql,
			fields: "key,summary",
			maxResults: "100",
			startAt: startAt.toString(),
		});

		const url = `https://${JIRA_DOMAIN}/rest/api/2/search?${params.toString()}`;

		const resp = await fetch(url, {
			headers: {
				Authorization: `Bearer ${JIRA_PAT}`,
				Accept: "application/json",
			},
		});

		if (!resp.ok) {
			const text = await resp.text();
			console.error(`Error fetching issues: ${resp.status} - ${text}`);
			throw new Error(`Failed to fetch issues: ${resp.status} - ${text}`);
		}

		const data: JiraIssuePaginatedResponse = await resp.json();

		for (const issue of data.issues) {
			issues.push(issue.key);
			const summary = issue.fields?.summary;
			if (summary) {
				summaries[issue.key] = summary;
			}
		}
		startAt += data.issues.length;
		totalIssues = data.total;
	} while (startAt < totalIssues);

	return { keys: issues, summaries };
}
