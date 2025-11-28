import type { JiraWorklog } from '../../types/JiraWorklog';

/**
 * Simplified mock worklogs for October 2025 to test the bug
 *
 * Adriano Ferreira: 23 working days × 8h = 184h expected
 * But the UI shows 332h (bug to be investigated)
 */

const MockWorklogsSimple: JiraWorklog[] = [];

// Adriano Ferreira - 23 working days in October 2025 with 8h each day
const adrianoUser = {
	self: 'https://mock.atlassian.net/rest/api/2/user?accountId=adriano123',
	accountId: 'adriano123',
	emailAddress: 'adriano.ferreira@example.com',
	displayName: 'Adriano Ferreira',
	active: true,
	timeZone: 'America/Sao_Paulo',
};

// October 2025 working days (excluding weekends)
const octoberWorkingDays = [
	1, 2, 3, 6, 7, 8, 9, 10, 13, 14, 15, 16, 17, 20, 21, 22, 23, 24, 27, 28, 29,
	30, 31,
]; // 23 days

let worklogId = 1;

// Create worklogs for Adriano - each day has one 8h worklog
for (const day of octoberWorkingDays) {
	const dateStr = `2025-10-${day.toString().padStart(2, '0')}`;
	const started = `${dateStr}T09:00:00.000-0300`;

	MockWorklogsSimple.push({
		self: `https://mock.atlassian.net/rest/api/2/issue/PROJ-100/worklog/${worklogId}`,
		id: worklogId.toString(),
		issueId: 'PROJ-100',
		issueKey: 'PROJ-100',
		author: adrianoUser,
		updateAuthor: adrianoUser,
		comment: 'Development work',
		created: started,
		updated: started,
		started: started,
		timeSpent: '8h',
		timeSpentSeconds: 28800, // 8 hours
	});

	worklogId++;
}

// Helder Marques - 20 working days + 2 retroactive from September = 22 days total
const helderUser = {
	self: 'https://mock.atlassian.net/rest/api/2/user?accountId=helder456',
	accountId: 'helder456',
	emailAddress: 'helder.marques@example.com',
	displayName: 'Helder Marques',
	active: true,
	timeZone: 'America/Sao_Paulo',
};

// October working days for Helder (20 days)
const helderOctoberDays = [
	1, 2, 3, 6, 7, 8, 9, 10, 13, 14, 15, 16, 17, 20, 21, 22, 23, 24, 27, 28,
]; // 20 days

for (const day of helderOctoberDays) {
	const dateStr = `2025-10-${day.toString().padStart(2, '0')}`;
	const started = `${dateStr}T09:00:00.000-0300`;

	MockWorklogsSimple.push({
		self: `https://mock.atlassian.net/rest/api/2/issue/PROJ-101/worklog/${worklogId}`,
		id: worklogId.toString(),
		issueId: 'PROJ-101',
		issueKey: 'PROJ-101',
		author: helderUser,
		updateAuthor: helderUser,
		comment: 'Development work',
		created: started,
		updated: started,
		started: started,
		timeSpent: '8h',
		timeSpentSeconds: 28800,
	});

	worklogId++;
}

// Helder - 2 retroactive worklogs logged in October but for September
const helderRetroactiveDays = [5, 10]; // Logged on Oct 5 and Oct 10

for (const loggedDay of helderRetroactiveDays) {
	const loggedDateStr = `2025-10-${loggedDay.toString().padStart(2, '0')}`;
	const loggedStarted = `${loggedDateStr}T14:00:00.000-0300`;

	// The retroactive date (from September)
	const retroDay = 25 + helderRetroactiveDays.indexOf(loggedDay);
	const retroDateStr = `2025-09-${retroDay.toString().padStart(2, '0')}`;

	MockWorklogsSimple.push({
		self: `https://mock.atlassian.net/rest/api/2/issue/PROJ-102/worklog/${worklogId}`,
		id: worklogId.toString(),
		issueId: 'PROJ-102',
		issueKey: 'PROJ-102',
		author: helderUser,
		updateAuthor: helderUser,
		comment: `Late entry. Original Worklog Date was: ${retroDateStr.replace(/-/g, '/')}`,
		created: loggedStarted,
		updated: loggedStarted,
		started: loggedStarted, // Actually logged in October
		timeSpent: '8h',
		timeSpentSeconds: 28800,
	});

	worklogId++;
}

// Igor Domingues - similar to Helder
const igorUser = {
	self: 'https://mock.atlassian.net/rest/api/2/user?accountId=igor789',
	accountId: 'igor789',
	emailAddress: 'igor.domingues@example.com',
	displayName: 'Igor Domingues',
	active: true,
	timeZone: 'America/Sao_Paulo',
};

// October working days for Igor (19 days)
const igorOctoberDays = [
	1, 2, 3, 6, 7, 8, 9, 10, 13, 14, 15, 16, 17, 20, 21, 22, 23, 27, 28,
]; // 19 days

for (const day of igorOctoberDays) {
	const dateStr = `2025-10-${day.toString().padStart(2, '0')}`;
	const started = `${dateStr}T09:00:00.000-0300`;

	MockWorklogsSimple.push({
		self: `https://mock.atlassian.net/rest/api/2/issue/PROJ-103/worklog/${worklogId}`,
		id: worklogId.toString(),
		issueId: 'PROJ-103',
		issueKey: 'PROJ-103',
		author: igorUser,
		updateAuthor: igorUser,
		comment: 'Development work',
		created: started,
		updated: started,
		started: started,
		timeSpent: '8h',
		timeSpentSeconds: 28800,
	});

	worklogId++;
}

// Igor - 3 retroactive worklogs from September
const igorRetroactiveDays = [6, 12, 18];

for (const loggedDay of igorRetroactiveDays) {
	const loggedDateStr = `2025-10-${loggedDay.toString().padStart(2, '0')}`;
	const loggedStarted = `${loggedDateStr}T15:00:00.000-0300`;

	const retroDay = 20 + igorRetroactiveDays.indexOf(loggedDay);
	const retroDateStr = `2025-09-${retroDay.toString().padStart(2, '0')}`;

	MockWorklogsSimple.push({
		self: `https://mock.atlassian.net/rest/api/2/issue/PROJ-104/worklog/${worklogId}`,
		id: worklogId.toString(),
		issueId: 'PROJ-104',
		issueKey: 'PROJ-104',
		author: igorUser,
		updateAuthor: igorUser,
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
	`  - Adriano: ${MockWorklogsSimple.filter((w) => w.author.displayName === 'Adriano Ferreira').length} worklogs (expected: 23 × 8h = 184h)`,
);
console.log(
	`  - Helder: ${MockWorklogsSimple.filter((w) => w.author.displayName === 'Helder Marques').length} worklogs (20 regular + 2 retroactive)`,
);
console.log(
	`  - Igor: ${MockWorklogsSimple.filter((w) => w.author.displayName === 'Igor Domingues').length} worklogs (19 regular + 3 retroactive)`,
);

export default MockWorklogsSimple;
