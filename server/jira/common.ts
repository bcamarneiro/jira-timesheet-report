export interface JiraConfig {
  domain: string;
  pat: string;
  components: string[];
  teamDevelopers: string[];
}

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


