const fs = require('node:fs');
const path = require('node:path');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');

function pad(n) {
	return String(n).padStart(2, '0');
}

function toLocalDateString(date) {
	const year = date.getFullYear();
	const month = pad(date.getMonth() + 1);
	const day = pad(date.getDate());
	return `${year}-${month}-${day}`;
}

function parseIsoDateLocal(dateStr) {
	const [year, month, day] = dateStr.split('-').map(Number);
	return new Date(year, month - 1, day);
}

function addDaysToIsoDate(dateStr, days) {
	const date = parseIsoDateLocal(dateStr);
	date.setDate(date.getDate() + days);
	return toLocalDateString(date);
}

function getMonday(date) {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	d.setDate(diff);
	return toLocalDateString(d);
}

function getWeekdaysBetween(start, end) {
	const days = [];
	const current = parseIsoDateLocal(start);
	const last = parseIsoDateLocal(end);
	while (current <= last) {
		const day = current.getDay();
		if (day !== 0 && day !== 6) {
			days.push(toLocalDateString(current));
		}
		current.setDate(current.getDate() + 1);
	}
	return days;
}

function parseAllowedUsers(allowedUsers) {
	return allowedUsers
		.split(',')
		.map((email) => email.trim().toLowerCase())
		.filter(Boolean);
}

function buildBaseUrl(config, options = {}) {
	return !options.ignoreCorsProxy && config.corsProxy
		? `${config.corsProxy.replace(/\/$/, '')}/https://${config.jiraHost}`
		: `https://${config.jiraHost}`;
}

function createHttpClient(config, proxyUrl, options = {}) {
	const agent = proxyUrl ? new SocksProxyAgent(proxyUrl) : undefined;
	return axios.create({
		baseURL: buildBaseUrl(config, options),
		headers: {
			Authorization: `Bearer ${config.apiToken}`,
			Accept: 'application/json',
			'X-Atlassian-Token': 'no-check',
		},
		httpAgent: agent,
		httpsAgent: agent,
		proxy: false,
		timeout: 30000,
	});
}

async function fetchMonthWorklogs(client, config, year, month) {
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const startStr = `${year}-${pad(month + 1)}-01`;
	const endStr = `${year}-${pad(month + 1)}-${pad(daysInMonth)}`;
	let jql = `worklogDate >= "${startStr}" AND worklogDate <= "${endStr}"`;
	if (config.jqlFilter?.trim()) {
		jql += ` AND ${config.jqlFilter.trim()}`;
	}

	const issues = [];
	let startAt = 0;
	const maxResults = 100;
	const fields = 'key,summary,issuetype,parent,project,status,worklog';

	while (true) {
		const { data } = await client.get('/rest/api/2/search', {
			params: {
				jql,
				maxResults,
				startAt,
				fields,
			},
		});

		issues.push(...data.issues);
		if (issues.length >= data.total || data.issues.length === 0) break;
		startAt += maxResults;
	}

	const allWorklogs = [];
	const truncatedIssues = [];

	for (const issue of issues) {
		const embedded = issue.fields.worklog;
		if (!embedded) {
			truncatedIssues.push(issue);
			continue;
		}

		if (embedded.total <= embedded.maxResults) {
			for (const wl of embedded.worklogs) {
				const day = (wl.started ?? '').slice(0, 10);
				if (day >= startStr && day <= endStr) {
					allWorklogs.push({ ...wl, issue });
				}
			}
		} else {
			truncatedIssues.push(issue);
		}
	}

	if (truncatedIssues.length > 0) {
		const startMillis = new Date(year, month, 1).getTime();
		const endMillis = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();

		for (const issue of truncatedIssues) {
			const { data } = await client.get(
				`/rest/api/2/issue/${issue.key}/worklog`,
				{
					params: {
						startedAfter: startMillis,
						startedBefore: endMillis,
					},
				},
			);
			allWorklogs.push(
				...(data.worklogs || []).map((wl) => ({
					...wl,
					issue,
				})),
			);
		}
	}

	return allWorklogs;
}

function getMonthStart(year, month) {
	return `${year}-${pad(month + 1)}-01`;
}

function getMonthEnd(year, month) {
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	return `${year}-${pad(month + 1)}-${pad(daysInMonth)}`;
}

function getMondaysBetween(startDateStr, endDateStr) {
	const mondays = [];
	const current = parseIsoDateLocal(getMonday(parseIsoDateLocal(startDateStr)));
	const end = parseIsoDateLocal(endDateStr);

	while (current <= end) {
		mondays.push(toLocalDateString(current));
		current.setDate(current.getDate() + 7);
	}

	return mondays;
}

function formatSecondsAsHours(seconds) {
	return `${(seconds / 3600).toFixed(2)}h`;
}

function deriveMonthlyGrouped(worklogs, allowedUsers) {
	const allowedSet = allowedUsers.length > 0 ? new Set(allowedUsers) : null;
	const grouped = new Map();

	for (const wl of worklogs) {
		const email = wl.author?.emailAddress?.toLowerCase();
		if (allowedSet && (!email || !allowedSet.has(email))) continue;
		if (!email) continue;
		const day = toLocalDateString(new Date(wl.started ?? ''));
		let member = grouped.get(email);
		if (!member) {
			member = {
				email,
				displayName: wl.author?.displayName || email,
				dailySeconds: new Map(),
			};
			grouped.set(email, member);
		}
		member.dailySeconds.set(day, (member.dailySeconds.get(day) ?? 0) + (wl.timeSpentSeconds ?? 0));
	}

	return grouped;
}

function deriveTeamSummary(worklogs, weekStart, weekEnd, allowedUsers) {
	const allowedSet = allowedUsers.length > 0 ? new Set(allowedUsers) : null;
	const memberMap = new Map();
	const weekdays = getWeekdaysBetween(weekStart, weekEnd);
	const now = new Date();
	const yesterday = new Date(now);
	yesterday.setDate(yesterday.getDate() - 1);
	const yesterdayStr = toLocalDateString(yesterday);
	const todayStr = toLocalDateString(now);
	const effectiveEnd = weekEnd >= todayStr ? yesterdayStr : weekEnd;
	const targetWeekdays = getWeekdaysBetween(weekStart, effectiveEnd);
	const targetSeconds = targetWeekdays.length * 28800;

	for (const wl of worklogs) {
		const email = wl.author?.emailAddress?.toLowerCase();
		if (!email) continue;
		if (allowedSet && !allowedSet.has(email)) continue;

		const day = toLocalDateString(new Date(wl.started ?? ''));
		if (day < weekStart || day > weekEnd) continue;

		let member = memberMap.get(email);
		if (!member) {
			member = {
				displayName: wl.author?.displayName || email,
				dailySeconds: new Map(),
			};
			memberMap.set(email, member);
		}
		member.dailySeconds.set(day, (member.dailySeconds.get(day) ?? 0) + (wl.timeSpentSeconds ?? 0));
	}

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

	return [...memberMap.entries()]
		.map(([email, member]) => {
			let totalSeconds = 0;
			for (const day of weekdays) {
				totalSeconds += member.dailySeconds.get(day) ?? 0;
			}
			return {
				email,
				displayName: member.displayName,
				totalSeconds,
				targetSeconds,
				gapSeconds: Math.max(0, targetSeconds - totalSeconds),
			};
		})
		.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function deriveDashboardPersonal(worklogs, email, weekStart, weekEnd) {
	const lowerEmail = email.toLowerCase();
	return worklogs
		.filter((wl) => wl.author?.emailAddress?.toLowerCase() === lowerEmail)
		.filter((wl) => {
			const day = toLocalDateString(new Date(wl.started ?? ''));
			return day >= weekStart && day <= weekEnd;
		});
}

function sumGroupedWeek(grouped, weekStart, weekEnd) {
	let total = 0;
	for (const member of grouped.values()) {
		for (const [day, seconds] of member.dailySeconds.entries()) {
			if (day >= weekStart && day <= weekEnd) {
				total += seconds;
			}
		}
	}
	return total;
}

function deriveMonthlyWeekMembers(grouped, weekStart, weekEnd, allowedUsers) {
	const allowedSet = allowedUsers.length > 0 ? new Set(allowedUsers) : null;
	const members = [];

	for (const [email, member] of grouped.entries()) {
		if (allowedSet && !allowedSet.has(email)) continue;
		let totalSeconds = 0;
		for (const [day, seconds] of member.dailySeconds.entries()) {
			if (day >= weekStart && day <= weekEnd) {
				totalSeconds += seconds;
			}
		}
		members.push({
			email,
			displayName: member.displayName,
			totalSeconds,
		});
	}

	if (allowedSet) {
		for (const email of allowedSet) {
			if (!members.some((member) => member.email === email)) {
				members.push({
					email,
					displayName: email,
					totalSeconds: 0,
				});
			}
		}
	}

	return members.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function isFullWeekInsidePeriod(weekStart, weekEnd, periodStart, periodEnd) {
	return weekStart >= periodStart && weekEnd <= periodEnd;
}

function escapeCsv(value) {
	const text = String(value ?? '');
	if (/[",\n]/.test(text)) {
		return `"${text.replace(/"/g, '""')}"`;
	}
	return text;
}

function buildWeeklyChecks(groupedMonthly, allWorklogs, allowedUsers, configEmail, periodStart, periodEnd) {
	return getMondaysBetween(periodStart, periodEnd).map((weekStart) => {
		const weekEnd = addDaysToIsoDate(weekStart, 6);
		const fullWeekInsidePeriod = isFullWeekInsidePeriod(
			weekStart,
			weekEnd,
			periodStart,
			periodEnd,
		);
		const monthlyMembers = deriveMonthlyWeekMembers(
			groupedMonthly,
			weekStart,
			weekEnd,
			allowedUsers,
		);
		const teamMembers = deriveTeamSummary(
			allWorklogs,
			weekStart,
			weekEnd,
			allowedUsers,
		);
		const teamMembersByEmail = new Map(
			teamMembers.map((member) => [member.email.toLowerCase(), member]),
		);
		const perUser = monthlyMembers.map((member) => {
			const teamMember = teamMembersByEmail.get(member.email.toLowerCase());
			const teamSeconds = teamMember?.totalSeconds ?? 0;
			return {
				email: member.email,
				displayName: member.displayName,
				monthlySeconds: member.totalSeconds,
				teamSeconds,
				match: member.totalSeconds === teamSeconds,
			};
		});
		const monthlyWeekTotal = monthlyMembers.reduce(
			(sum, member) => sum + member.totalSeconds,
			0,
		);
		const teamWeekTotal = teamMembers.reduce(
			(sum, member) => sum + member.totalSeconds,
			0,
		);
		const dashboardPersonalWeekTotal = deriveDashboardPersonal(
			allWorklogs,
			configEmail,
			weekStart,
			weekEnd,
		).reduce((sum, wl) => sum + (wl.timeSpentSeconds ?? 0), 0);

		return {
			weekStart,
			weekEnd,
			fullWeekInsidePeriod,
			monthlyWeekTotalSeconds: monthlyWeekTotal,
			teamWeekTotalSeconds: teamWeekTotal,
			dashboardPersonalWeekTotalSeconds: dashboardPersonalWeekTotal,
			teamVsMonthlyWeekMatch: monthlyWeekTotal === teamWeekTotal,
			perUserMatch: perUser.every((member) => member.match),
			perUser,
		};
	});
}

function writeReports(result, reportDir) {
	fs.mkdirSync(reportDir, { recursive: true });
	const stamp = `${result.context.periodStart}_to_${result.context.periodEnd}`;
	const mdPath = path.join(reportDir, `jira-consistency-${stamp}.md`);
	const csvPath = path.join(reportDir, `jira-consistency-${stamp}.csv`);
	const relevantWeeks = result.weeklyChecks.filter((check) => check.fullWeekInsidePeriod);
	const mismatches = relevantWeeks.filter(
		(check) => !check.teamVsMonthlyWeekMatch || !check.perUserMatch,
	);

	const markdownLines = [
		'# Jira Timesheet Consistency Report',
		'',
		`- Period: ${result.context.periodStart} to ${result.context.periodEnd}`,
		`- Months back: ${result.context.monthsBack}`,
		`- Jira user: ${result.context.jiraUser}`,
		`- Reports include self: ${result.context.selfIncludedInReports ? 'yes' : 'no'}`,
		`- Full weeks checked: ${relevantWeeks.length}`,
		`- Mismatch weeks: ${mismatches.length}`,
		'',
		'## Current Week',
		'',
		`- Weekly reports total: ${result.totals.teamWeekTotalSeconds}s (${formatSecondsAsHours(result.totals.teamWeekTotalSeconds)})`,
		`- Monthly-derived total: ${result.totals.monthlyWeekTotalSeconds}s (${formatSecondsAsHours(result.totals.monthlyWeekTotalSeconds)})`,
		`- Dashboard personal total: ${result.totals.dashboardPersonalWeekTotalSeconds}s (${formatSecondsAsHours(result.totals.dashboardPersonalWeekTotalSeconds)})`,
		`- Dashboard vs reports comparable: ${result.consistency.dashboardVsReportsMatch === null ? 'no' : 'yes'}`,
		`- Dashboard vs reports match: ${result.consistency.dashboardVsReportsMatch === null ? 'n/a' : result.consistency.dashboardVsReportsMatch ? 'yes' : 'no'}`,
		'',
		'## Weekly Checks',
		'',
		'| Week | Full Week | Team Total | Monthly Total | Team vs Monthly | Per User |',
		'| --- | --- | ---: | ---: | --- | --- |',
		...result.weeklyChecks.map((check) =>
			`| ${check.weekStart} to ${check.weekEnd} | ${check.fullWeekInsidePeriod ? 'yes' : 'no'} | ${check.teamWeekTotalSeconds} | ${check.monthlyWeekTotalSeconds} | ${check.teamVsMonthlyWeekMatch ? 'match' : 'mismatch'} | ${check.perUserMatch ? 'match' : 'mismatch'} |`,
		),
	];

	if (mismatches.length > 0) {
		markdownLines.push('', '## Mismatch Detail', '');
		for (const week of mismatches) {
			markdownLines.push(`### ${week.weekStart} to ${week.weekEnd}`, '');
			for (const member of week.perUser.filter((entry) => !entry.match)) {
				markdownLines.push(
					`- ${member.displayName} (${member.email}): monthly ${member.monthlySeconds}s, team ${member.teamSeconds}s`,
				);
			}
			markdownLines.push('');
		}
	}

	const csvLines = [
		[
			'weekStart',
			'weekEnd',
			'fullWeekInsidePeriod',
			'teamWeekTotalSeconds',
			'monthlyWeekTotalSeconds',
			'dashboardPersonalWeekTotalSeconds',
			'teamVsMonthlyWeekMatch',
			'perUserMatch',
			'email',
			'displayName',
			'teamSeconds',
			'monthlySeconds',
			'memberMatch',
		].join(','),
	];

	for (const week of result.weeklyChecks) {
		for (const member of week.perUser) {
			csvLines.push(
				[
					week.weekStart,
					week.weekEnd,
					week.fullWeekInsidePeriod,
					week.teamWeekTotalSeconds,
					week.monthlyWeekTotalSeconds,
					week.dashboardPersonalWeekTotalSeconds,
					week.teamVsMonthlyWeekMatch,
					week.perUserMatch,
					member.email,
					member.displayName,
					member.teamSeconds,
					member.monthlySeconds,
					member.match,
				].map(escapeCsv).join(','),
			);
		}
	}

	fs.writeFileSync(mdPath, `${markdownLines.join('\n')}\n`);
	fs.writeFileSync(csvPath, `${csvLines.join('\n')}\n`);

	return { markdown: mdPath, csv: csvPath };
}

async function main() {
	const configPath = process.argv[2];
	if (!configPath) {
		console.error(
			'Usage: node scripts/validate-real-data-consistency.cjs <settings-backup.json> [proxyUrl] [monthsBack] [reportDir]',
		);
		process.exit(1);
	}

	const proxyUrl = process.argv[3] || 'socks5h://127.0.0.1:8080';
	const backup = JSON.parse(fs.readFileSync(path.resolve(configPath), 'utf8'));
	const config = backup.config;
	const client = createHttpClient(config, proxyUrl, { ignoreCorsProxy: !!proxyUrl });

	const myself = (await client.get('/rest/api/2/myself')).data;
	const now = new Date();
	const monthsBack = Number(process.argv[4] || 2);
	const targetMonths = [];
	for (let offset = monthsBack - 1; offset >= 0; offset--) {
		const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
		targetMonths.push({ year: date.getFullYear(), month: date.getMonth() });
	}

	const monthlyBuckets = [];
	const allWorklogs = [];
	for (const target of targetMonths) {
		const monthWorklogs = await fetchMonthWorklogs(
			client,
			config,
			target.year,
			target.month,
		);
		monthlyBuckets.push({
			year: target.year,
			month: target.month,
			start: getMonthStart(target.year, target.month),
			end: getMonthEnd(target.year, target.month),
			worklogs: monthWorklogs,
		});
		allWorklogs.push(...monthWorklogs);
	}

	const periodStart = monthlyBuckets[0].start;
	const periodEnd = monthlyBuckets[monthlyBuckets.length - 1].end;
	const currentWeekStart = getMonday(now);
	const currentWeekEnd = addDaysToIsoDate(currentWeekStart, 6);
	const reportDir = path.resolve(process.argv[5] || path.join(process.cwd(), 'tmp'));

	const allowedUsers = parseAllowedUsers(config.allowedUsers || '');
	const groupedMonthly = deriveMonthlyGrouped(allWorklogs, allowedUsers);
	const teamSummary = deriveTeamSummary(
		allWorklogs,
		currentWeekStart,
		currentWeekEnd,
		allowedUsers,
	);
	const dashboardPersonal = deriveDashboardPersonal(
		allWorklogs,
		config.email,
		currentWeekStart,
		currentWeekEnd,
	);

	const monthlyWeekTotal = sumGroupedWeek(
		groupedMonthly,
		currentWeekStart,
		currentWeekEnd,
	);
	const teamWeekTotal = teamSummary.reduce((sum, member) => sum + member.totalSeconds, 0);
	const personalWeekTotal = dashboardPersonal.reduce((sum, wl) => sum + (wl.timeSpentSeconds ?? 0), 0);
	const selfIncludedInReports = allowedUsers.length === 0 || allowedUsers.includes(config.email.toLowerCase());
	const weeklyChecks = buildWeeklyChecks(
		groupedMonthly,
		allWorklogs,
		allowedUsers,
		config.email,
		periodStart,
		periodEnd,
	);
	const relevantWeeks = weeklyChecks.filter((check) => check.fullWeekInsidePeriod);
	const reportPaths = writeReports(
		{
			context: {
				jiraUser: myself.displayName,
				email: config.email,
				currentWeekStart,
				currentWeekEnd,
				periodStart,
				periodEnd,
				monthsBack,
				jqlFilter: config.jqlFilter,
				allowedUsersCount: allowedUsers.length,
				selfIncludedInReports,
			},
			totals: {
				monthlyWeekTotalSeconds: monthlyWeekTotal,
				teamWeekTotalSeconds: teamWeekTotal,
				dashboardPersonalWeekTotalSeconds: personalWeekTotal,
			},
			consistency: {
				teamVsMonthlyWeekMatch: monthlyWeekTotal === teamWeekTotal,
				dashboardVsReportsMatch:
					selfIncludedInReports
						? personalWeekTotal ===
							(sumGroupedWeek(
								new Map(
									[...groupedMonthly.entries()].filter(([email]) =>
										email === config.email.toLowerCase(),
									),
								),
								currentWeekStart,
								currentWeekEnd,
							))
						: null,
			},
			weeklyChecks,
		},
		reportDir,
	);

	console.log(JSON.stringify({
		context: {
			jiraUser: myself.displayName,
			email: config.email,
			currentWeekStart,
			currentWeekEnd,
			periodStart,
			periodEnd,
			monthsBack,
			jqlFilter: config.jqlFilter,
			allowedUsersCount: allowedUsers.length,
			selfIncludedInReports,
		},
		reportPaths,
		totals: {
			monthlyWeekTotalSeconds: monthlyWeekTotal,
			teamWeekTotalSeconds: teamWeekTotal,
			dashboardPersonalWeekTotalSeconds: personalWeekTotal,
		},
		consistency: {
			teamVsMonthlyWeekMatch: monthlyWeekTotal === teamWeekTotal,
			dashboardVsReportsMatch:
				selfIncludedInReports
					? personalWeekTotal ===
						(sumGroupedWeek(
							new Map(
								[...groupedMonthly.entries()].filter(([email]) =>
									email === config.email.toLowerCase(),
								),
							),
							currentWeekStart,
							currentWeekEnd,
						))
					: null,
			relevantFullWeeksChecked: relevantWeeks.length,
			relevantFullWeeksAllMatch: relevantWeeks.every(
				(check) => check.teamVsMonthlyWeekMatch && check.perUserMatch,
			),
		},
		weeklyChecks,
		teamMembers: teamSummary,
	}, null, 2));
}

main().catch((error) => {
	console.error(error?.response?.data || error);
	process.exit(1);
});
