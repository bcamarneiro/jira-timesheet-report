import type { JiraWorklog } from '../../types/JiraWorklog';

/**
 * Simplified mock worklogs for October 2025 to test the bug
 *
 * Alex Thompson: 23 working days × 8h = 184h expected
 * But the UI shows 332h (bug to be investigated)
 */

const MockWorklogsSimple: JiraWorklog[] = [];

// Alex Thompson - 23 working days in October 2025 with 8h each day
const alexUser = {
	self: 'https://mock.atlassian.net/rest/api/2/user?accountId=alex123',
	accountId: 'alex123',
	emailAddress: 'alex.thompson@example.com',
	displayName: 'Alex Thompson',
	active: true,
	timeZone: 'America/Sao_Paulo',
};

// October 2025 working days (excluding weekends)
const octoberWorkingDays = [
	1, 2, 3, 6, 7, 8, 9, 10, 13, 14, 15, 16, 17, 20, 21, 22, 23, 24, 27, 28, 29,
	30, 31,
]; // 23 days

let worklogId = 1;

// Create worklogs for Alex - each day has one 8h worklog
for (const day of octoberWorkingDays) {
	const dateStr = `2025-10-${day.toString().padStart(2, '0')}`;
	const started = `${dateStr}T09:00:00.000-0300`;

	MockWorklogsSimple.push({
		self: `https://mock.atlassian.net/rest/api/2/issue/PROJ-100/worklog/${worklogId}`,
		id: worklogId.toString(),
		issueId: 'PROJ-100',
		issueKey: 'PROJ-100',
		author: alexUser,
		updateAuthor: alexUser,
		comment: 'Development work',
		created: started,
		updated: started,
		started: started,
		timeSpent: '8h',
		timeSpentSeconds: 28800, // 8 hours
	});

	worklogId++;
}

// Sarah Johnson - 20 working days + 2 retroactive from September = 22 days total
const sarahUser = {
	self: 'https://mock.atlassian.net/rest/api/2/user?accountId=sarah456',
	accountId: 'sarah456',
	emailAddress: 'sarah.johnson@example.com',
	displayName: 'Sarah Johnson',
	active: true,
	timeZone: 'America/Sao_Paulo',
};

// October working days for Sarah (20 days)
const sarahOctoberDays = [
	1, 2, 3, 6, 7, 8, 9, 10, 13, 14, 15, 16, 17, 20, 21, 22, 23, 24, 27, 28,
]; // 20 days

for (const day of sarahOctoberDays) {
	const dateStr = `2025-10-${day.toString().padStart(2, '0')}`;
	const started = `${dateStr}T09:00:00.000-0300`;

	MockWorklogsSimple.push({
		self: `https://mock.atlassian.net/rest/api/2/issue/PROJ-101/worklog/${worklogId}`,
		id: worklogId.toString(),
		issueId: 'PROJ-101',
		issueKey: 'PROJ-101',
		author: sarahUser,
		updateAuthor: sarahUser,
		comment: 'Development work',
		created: started,
		updated: started,
		started: started,
		timeSpent: '8h',
		timeSpentSeconds: 28800,
	});

	worklogId++;
}

// Sarah - 2 retroactive worklogs logged in October but for September
const sarahRetroactiveDays = [5, 10]; // Logged on Oct 5 and Oct 10

for (const loggedDay of sarahRetroactiveDays) {
	const loggedDateStr = `2025-10-${loggedDay.toString().padStart(2, '0')}`;
	const loggedStarted = `${loggedDateStr}T14:00:00.000-0300`;

	// The retroactive date (from September)
	const retroDay = 25 + sarahRetroactiveDays.indexOf(loggedDay);
	const retroDateStr = `2025-09-${retroDay.toString().padStart(2, '0')}`;

	MockWorklogsSimple.push({
		self: `https://mock.atlassian.net/rest/api/2/issue/PROJ-102/worklog/${worklogId}`,
		id: worklogId.toString(),
		issueId: 'PROJ-102',
		issueKey: 'PROJ-102',
		author: sarahUser,
		updateAuthor: sarahUser,
		comment: `Late entry. Original Worklog Date was: ${retroDateStr.replace(/-/g, '/')}`,
		created: loggedStarted,
		updated: loggedStarted,
		started: loggedStarted, // Actually logged in October
		timeSpent: '8h',
		timeSpentSeconds: 28800,
	});

	worklogId++;
}

// Mike Chen - similar to Sarah
const mikeUser = {
	self: 'https://mock.atlassian.net/rest/api/2/user?accountId=mike789',
	accountId: 'mike789',
	emailAddress: 'mike.chen@example.com',
	displayName: 'Mike Chen',
	active: true,
	timeZone: 'America/Sao_Paulo',
};

// October working days for Mike (19 days)
const mikeOctoberDays = [
	1, 2, 3, 6, 7, 8, 9, 10, 13, 14, 15, 16, 17, 20, 21, 22, 23, 27, 28,
]; // 19 days

for (const day of mikeOctoberDays) {
	const dateStr = `2025-10-${day.toString().padStart(2, '0')}`;
	const started = `${dateStr}T09:00:00.000-0300`;

	MockWorklogsSimple.push({
		self: `https://mock.atlassian.net/rest/api/2/issue/PROJ-103/worklog/${worklogId}`,
		id: worklogId.toString(),
		issueId: 'PROJ-103',
		issueKey: 'PROJ-103',
		author: mikeUser,
		updateAuthor: mikeUser,
		comment: 'Development work',
		created: started,
		updated: started,
		started: started,
		timeSpent: '8h',
		timeSpentSeconds: 28800,
	});

	worklogId++;
}

// Mike - 3 retroactive worklogs from September
const mikeRetroactiveDays = [6, 12, 18];

for (const loggedDay of mikeRetroactiveDays) {
	const loggedDateStr = `2025-10-${loggedDay.toString().padStart(2, '0')}`;
	const loggedStarted = `${loggedDateStr}T15:00:00.000-0300`;

	const retroDay = 20 + mikeRetroactiveDays.indexOf(loggedDay);
	const retroDateStr = `2025-09-${retroDay.toString().padStart(2, '0')}`;

	MockWorklogsSimple.push({
		self: `https://mock.atlassian.net/rest/api/2/issue/PROJ-104/worklog/${worklogId}`,
		id: worklogId.toString(),
		issueId: 'PROJ-104',
		issueKey: 'PROJ-104',
		author: mikeUser,
		updateAuthor: mikeUser,
		comment: `Retroactive entry. Original Worklog Date was: ${retroDateStr.replace(/-/g, '/')}`,
		created: loggedStarted,
		updated: loggedStarted,
		started: loggedStarted,
		timeSpent: '8h',
		timeSpentSeconds: 28800,
	});

	worklogId++;
}

console.log('[MOCK DATA] Generated mock worklogs:');
console.log(
	`  - Alex: ${MockWorklogsSimple.filter((w) => w.author.displayName === 'Alex Thompson').length} worklogs (expected: 23 × 8h = 184h)`,
);
console.log(
	`  - Sarah: ${MockWorklogsSimple.filter((w) => w.author.displayName === 'Sarah Johnson').length} worklogs (20 regular + 2 retroactive)`,
);
console.log(
	`  - Mike: ${MockWorklogsSimple.filter((w) => w.author.displayName === 'Mike Chen').length} worklogs (19 regular + 3 retroactive)`,
);

export default MockWorklogsSimple;
