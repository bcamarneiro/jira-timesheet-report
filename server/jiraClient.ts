import { JiraIssuePaginatedResponse } from "../types/JiraIssuePaginatedResponse";
import { JiraWorklog } from "../types/JiraWorklog";
import { JiraWorklogPaginatedResponse } from "../types/JiraWorklogPaginatedResponse";

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;

const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
const endDate = new Date(Date.UTC(year, month, 0, 0, 0, 0));
const startMillis = startDate.getTime();
const endMillis = endDate.getTime();
const jqlStartDate = startDate.toISOString().substring(0, 10);
const jqlEndDate = endDate.toISOString().substring(0, 10);

const JIRA_DOMAIN = process.env.JIRA_DOMAIN;
const JIRA_PAT = process.env.JIRA_PAT;

if (!JIRA_DOMAIN || !JIRA_PAT) {
  throw new Error('Missing required environment variables: JIRA_DOMAIN, JIRA_PAT');
}

export async function fetchIssues(): Promise<{ keys: string[]; summaries: Record<string, string> }> {
  const issues: string[] = [];
  const summaries: Record<string, string> = {};
  let startAt = 0;
  const jql = `worklogDate >= '${jqlStartDate}' AND worklogDate <= '${jqlEndDate}' AND component = "INV_III"`;

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

export async function fetchWorklogs(issues: string[]): Promise<JiraWorklog[]> {
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

      // Attach issueKey for easier linking on the client
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
