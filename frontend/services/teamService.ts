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

/** Format a local Date as YYYY-MM-DD without UTC conversion */
function toDateStr(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
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
		const dateStr = toDateStr(current);
		if (isWeekday(dateStr)) {
			days.push(dateStr);
		}
		current.setDate(current.getDate() + 1);
	}
	return days;
}

interface WorklogEntry {
	author: { emailAddress?: string; displayName?: string };
	started: string;
	timeSpentSeconds: number;
}

interface SearchIssue {
	key: string;
	fields: {
		worklog?: {
			startAt: number;
			maxResults: number;
			total: number;
			worklogs: WorklogEntry[];
		};
	};
}

export async function fetchTeamWorklogs(
	config: Config,
	weekStart: string,
	weekEnd: string,
	signal?: AbortSignal,
): Promise<TeamMemberSummary[]> {
	if (!config.jiraHost || !config.apiToken) return [];

	const headers: HeadersInit = {
		Authorization: `Bearer ${config.apiToken}`,
		Accept: 'application/json',
		'X-Atlassian-Token': 'no-check',
	};

	const jql = encodeURIComponent(
		`worklogDate >= "${weekStart}" AND worklogDate <= "${weekEnd}"`,
	);

	// Step 1: Search with embedded worklogs
	const issues: SearchIssue[] = [];
	let startAt = 0;
	const maxResults = 50;

	while (true) {
		const res = await fetch(
			buildUrl(
				config,
				`/rest/api/2/search?jql=${jql}&maxResults=${maxResults}&startAt=${startAt}&fields=key,worklog`,
			),
			{ headers, signal },
		);

		if (!res.ok) throw new Error(`Jira API error: ${res.status}`);

		const data = (await res.json()) as {
			issues: SearchIssue[];
			total: number;
		};

		for (const issue of data.issues) {
			issues.push(issue);
		}

		if (issues.length >= data.total || data.issues.length === 0) {
			break;
		}
		startAt += maxResults;
	}

	// Step 2: Use embedded worklogs when complete, fetch separately only for truncated
	const allWorklogs: WorklogEntry[] = [];
	const truncatedKeys: string[] = [];

	for (const issue of issues) {
		const embedded = issue.fields.worklog;
		if (!embedded) {
			truncatedKeys.push(issue.key);
			continue;
		}

		if (embedded.total <= embedded.maxResults) {
			// All worklogs are in the embedded response — filter by date in JS
			for (const wl of embedded.worklogs) {
				const day = wl.started.slice(0, 10);
				if (day >= weekStart && day <= weekEnd) {
					allWorklogs.push(wl);
				}
			}
		} else {
			truncatedKeys.push(issue.key);
		}
	}

	// Fetch full worklogs only for truncated issues
	if (truncatedKeys.length > 0) {
		const weekStartMillis = new Date(weekStart).getTime();
		const weekEndMillis = new Date(`${weekEnd}T23:59:59.999`).getTime();
		const batchSize = 10;

		for (let i = 0; i < truncatedKeys.length; i += batchSize) {
			const batch = truncatedKeys.slice(i, i + batchSize);
			const results = await Promise.all(
				batch.map(async (key) => {
					try {
						const res = await fetch(
							buildUrl(
								config,
								`/rest/api/2/issue/${key}/worklog?startedAfter=${weekStartMillis}&startedBefore=${weekEndMillis}`,
							),
							{ headers, signal },
						);
						if (!res.ok) return [];
						const data = (await res.json()) as {
							worklogs: WorklogEntry[];
						};
						return data.worklogs || [];
					} catch {
						return [];
					}
				}),
			);
			for (const worklogs of results) {
				allWorklogs.push(...worklogs);
			}
		}
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

	for (const wl of allWorklogs) {
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
	// For the current/future week, cap the target at today so we don't
	// penalise people for days that haven't happened yet.
	const today = toDateStr(new Date());
	const effectiveEnd = weekEnd > today ? today : weekEnd;
	const weekdays = getWeekdaysBetween(weekStart, weekEnd);
	const targetWeekdays = getWeekdaysBetween(weekStart, effectiveEnd);
	const targetSeconds = targetWeekdays.length * SECONDS_PER_DAY;

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
