const JIRA_DOMAIN = process.env.JIRA_DOMAIN;
const JIRA_PAT = process.env.JIRA_PAT;
const JIRA_COMPONENT = process.env.JIRA_COMPONENT || "";

if (!JIRA_DOMAIN || !JIRA_PAT) {
	throw new Error(
		"Missing required environment variables: JIRA_DOMAIN, JIRA_PAT",
	);
}

export { JIRA_DOMAIN, JIRA_PAT, JIRA_COMPONENT };

export function getMonthBounds(year: number, monthOneBased: number) {
	const startDate = new Date(Date.UTC(year, monthOneBased - 1, 1, 0, 0, 0));
	const endDate = new Date(Date.UTC(year, monthOneBased, 0, 0, 0, 0));
	return {
		startMillis: startDate.getTime(),
		endMillis: endDate.getTime(),
		jqlStartDate: startDate.toISOString().substring(0, 10),
		jqlEndDate: endDate.toISOString().substring(0, 10),
	};
}
