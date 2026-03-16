import type { Config } from '../stores/useConfigStore';

export interface TeamMemberSummary {
	email: string;
	displayName: string;
	dailyHours: Map<string, number>;
	totalSeconds: number;
	targetSeconds: number;
	gapSeconds: number;
}

const SECONDS_PER_DAY = 28800; // 8h

function buildUrl(config: Config, path: string): string {
	const base = config.corsProxy
		? `${config.corsProxy.replace(/\/$/, '')}/https://${config.jiraHost}`
		: `https://${config.jiraHost}`;
	return `${base}${path}`;
}

function isWeekday(dateStr: string): boolean {
	const d = new Date(dateStr);
	const day = d.getDay();
	return day !== 0 && day !== 6;
}

function getWeekdaysBetween(start: string, end: string): string[] {
	const days: string[] = [];
	const current = new Date(start);
	const last = new Date(end);
	while (current <= last) {
		if (isWeekday(current.toISOString().slice(0, 10))) {
			days.push(current.toISOString().slice(0, 10));
		}
		current.setDate(current.getDate() + 1);
	}
	return days;
}

export async function fetchTeamWorklogs(
	config: Config,
	weekStart: string,
	weekEnd: string,
	signal?: AbortSignal,
): Promise<TeamMemberSummary[]> {
	if (!config.jiraHost || !config.apiToken) return [];

	const jql = encodeURIComponent(
		`worklogDate >= "${weekStart}" AND worklogDate <= "${weekEnd}"`,
	);

	let startAt = 0;
	const maxResults = 50;
	const allIssues: {
		key: string;
		fields: {
			summary?: string;
			worklog?: {
				worklogs: {
					author: { emailAddress?: string; displayName?: string };
					started: string;
					timeSpentSeconds: number;
				}[];
				total?: number;
			};
		};
	}[] = [];

	// Paginate through results
	while (true) {
		const res = await fetch(
			buildUrl(
				config,
				`/rest/api/2/search?jql=${jql}&maxResults=${maxResults}&startAt=${startAt}&fields=key,summary,worklog`,
			),
			{
				headers: {
					Authorization: `Bearer ${config.apiToken}`,
					Accept: 'application/json',
					'X-Atlassian-Token': 'no-check',
				},
				signal,
			},
		);

		if (!res.ok) throw new Error(`Jira API error: ${res.status}`);

		const data = (await res.json()) as {
			issues: typeof allIssues;
			total: number;
		};

		allIssues.push(...data.issues);

		if (allIssues.length >= data.total || data.issues.length === 0) {
			break;
		}
		startAt += maxResults;
	}

	// Parse the allowed users filter
	const allowedSet = config.allowedUsers
		? new Set(
				config.allowedUsers
					.split(',')
					.map((e) => e.trim().toLowerCase())
					.filter(Boolean),
			)
		: null;

	// Collect worklogs grouped by author email
	const memberMap = new Map<
		string,
		{ displayName: string; dailySeconds: Map<string, number> }
	>();

	for (const issue of allIssues) {
		for (const wl of issue.fields.worklog?.worklogs || []) {
			const email = wl.author?.emailAddress?.toLowerCase();
			if (!email) continue;

			// Filter by allowed users if configured
			if (allowedSet && !allowedSet.has(email)) continue;

			const day = wl.started.slice(0, 10);
			if (day < weekStart || day > weekEnd) continue;

			let member = memberMap.get(email);
			if (!member) {
				member = {
					displayName: wl.author.displayName || email,
					dailySeconds: new Map(),
				};
				memberMap.set(email, member);
			}

			const existing = member.dailySeconds.get(day) || 0;
			member.dailySeconds.set(day, existing + wl.timeSpentSeconds);
		}
	}

	// Ensure all allowed users appear even with zero hours
	if (allowedSet) {
		for (const email of allowedSet) {
			if (!memberMap.has(email)) {
				memberMap.set(email, {
					displayName: email,
					dailySeconds: new Map(),
				});
			}
		}
	}

	// Convert to TeamMemberSummary[]
	const weekdays = getWeekdaysBetween(weekStart, weekEnd);
	const targetSeconds = weekdays.length * SECONDS_PER_DAY;

	const summaries: TeamMemberSummary[] = [];

	for (const [email, member] of memberMap) {
		const dailyHours = new Map<string, number>();
		let totalSeconds = 0;

		for (const day of weekdays) {
			const seconds = member.dailySeconds.get(day) || 0;
			dailyHours.set(day, seconds / 3600);
			totalSeconds += seconds;
		}

		const gapSeconds = Math.max(0, targetSeconds - totalSeconds);

		summaries.push({
			email,
			displayName: member.displayName,
			dailyHours,
			totalSeconds,
			targetSeconds,
			gapSeconds,
		});
	}

	// Sort by display name
	summaries.sort((a, b) => a.displayName.localeCompare(b.displayName));

	return summaries;
}
