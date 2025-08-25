import { JiraWorklog } from "../../types/JiraWorklog";
import { JiraWorklogPaginatedResponse } from "../../types/JiraWorklogPaginatedResponse";
import { JIRA_DOMAIN, JIRA_PAT, getMonthBounds } from "./common";

export async function fetchWorklogs(issues: string[], year: number, monthOneBased: number): Promise<JiraWorklog[]> {
	const { startMillis, endMillis } = getMonthBounds(year, monthOneBased);
	const allWorklogs: JiraWorklog[] = [];

	for (const issueKey of issues) {
		let startAt = 0;
		let totalWorklogs = 0;

		do {
			const params = new URLSearchParams({
				startedAfter: startMillis.toString(),
				startedBefore: endMillis.toString(),
				maxResults: '100',
				startAt: startAt.toString(),
			});

			const url = `https://${JIRA_DOMAIN}/rest/api/2/issue/${encodeURIComponent(issueKey)}/worklog?${params.toString()}`;

			const resp = await fetch(url, {
				headers: {
					Authorization: `Bearer ${JIRA_PAT}`,
					Accept: 'application/json',
				},
			});

			if (!resp.ok) {
				const text = await resp.text();
				console.error(`Error fetching worklogs for ${issueKey}: ${resp.status} - ${text}`);
				throw new Error(`Failed to fetch worklogs for ${issueKey}: ${resp.status} - ${text}`);
			}

			const data: JiraWorklogPaginatedResponse = await resp.json();

			const enriched = (data.worklogs || []).map((wl) => ({
				...wl,
				issueKey,
			}));

			allWorklogs.push(...enriched);

			startAt += data.worklogs.length;
			totalWorklogs = data.total;
		} while (startAt < totalWorklogs);
	}

	return allWorklogs;
}


