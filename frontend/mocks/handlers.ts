import { http, HttpResponse } from 'msw';
import type { JiraWorklog } from '../../types/JiraWorklog';
import MockTeamDevelopers from './MockTeamDevelopers';
import MockWorklogs from './MockWorklogs';
import MockIssueSummaries from './MockIssueSummaries';


export const handlers = [
  http.post('/api/timesheet', async ({ request }) => {
    const url = new URL(request.url);
    const yearParam = Number.parseInt(url.searchParams.get('year') || '', 10);
    const monthParam = Number.parseInt(url.searchParams.get('month') || '', 10);

    const now = new Date();
    const year = Number.isFinite(yearParam) && yearParam > 1900 ? yearParam : now.getUTCFullYear();
    const monthOneBased = Number.isFinite(monthParam) && monthParam >= 1 && monthParam <= 12 ? monthParam : (now.getUTCMonth() + 1);

    // Parse request body to get project configuration
    let projectConfig: any = {};
    try {
      const body = await request.json() as any;
      projectConfig = body?.projectConfig || {};
    } catch (error) {
      // If body parsing fails, use empty config
      projectConfig = {};
    }

    const start = new Date(Date.UTC(year, monthOneBased - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, monthOneBased, 0, 23, 59, 59, 999));

    const filtered = MockWorklogs.filter((wl) => {
      const ts = new Date(wl.started).getTime();
      return ts >= start.getTime() && ts <= end.getTime();
    });

    // Use project configuration team developers if provided, otherwise fall back to mock data
    const teamDevelopers = projectConfig.teamDevelopers && projectConfig.teamDevelopers.length > 0 
      ? projectConfig.teamDevelopers 
      : MockTeamDevelopers;

    return HttpResponse.json({
      jiraDomain: 'jira.example.com',
      worklogs: filtered,
      issueSummaries: MockIssueSummaries,
      teamDevelopers: teamDevelopers
    });
  })
];
