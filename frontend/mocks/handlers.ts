import { HttpResponse, http } from 'msw';
import MockIssueSummaries from './MockIssueSummaries';
import MockTeamDevelopers from './MockTeamDevelopers';
import MockWorklogs from './MockWorklogs';

export const handlers = [
	http.get('/api/timesheet', ({ request }) => {
		const url = new URL(request.url);
		const yearParam = Number.parseInt(url.searchParams.get('year') || '', 10);
		const monthParam = Number.parseInt(url.searchParams.get('month') || '', 10);

		const now = new Date();
		const year =
			Number.isFinite(yearParam) && yearParam > 1900
				? yearParam
				: now.getUTCFullYear();
		const monthOneBased =
			Number.isFinite(monthParam) && monthParam >= 1 && monthParam <= 12
				? monthParam
				: now.getUTCMonth() + 1;

		const start = new Date(Date.UTC(year, monthOneBased - 1, 1, 0, 0, 0));
		const end = new Date(Date.UTC(year, monthOneBased, 0, 23, 59, 59, 999));

		const filtered = MockWorklogs.filter((wl) => {
			const ts = new Date(wl.started).getTime();
			return ts >= start.getTime() && ts <= end.getTime();
		});

		return HttpResponse.json({
			jiraDomain: 'jira.example.com',
			worklogs: filtered,
			issueSummaries: MockIssueSummaries,
			teamDevelopers: MockTeamDevelopers,
		});
	}),
];
