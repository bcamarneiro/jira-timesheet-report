export interface WorklogSuggestion {
	id: string;
	source: 'jira-activity' | 'gitlab' | 'rescuetime';
	issueKey: string;
	issueSummary?: string;
	date: string;
	suggestedTimeSpent: string;
	suggestedSeconds: number;
	confidence: 'high' | 'medium' | 'low';
	reason: string;
	logged: boolean;
}

export interface DaySummary {
	date: string;
	dayOfWeek: number;
	isWeekend: boolean;
	loggedSeconds: number;
	targetSeconds: number;
	gapSeconds: number;
	suggestions: WorklogSuggestion[];
	rescueTimeProductiveHours?: number;
}

export interface WeekRange {
	start: string;
	end: string;
}
