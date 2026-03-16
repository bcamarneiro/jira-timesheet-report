export interface WorklogSuggestion {
	id: string;
	source:
		| 'jira-activity'
		| 'gitlab'
		| 'calendar'
		| 'rescuetime'
		| 'favorite'
		| 'template'
		| 'previous-week';
	issueKey: string;
	issueSummary?: string;
	date: string;
	suggestedTimeSpent: string;
	suggestedSeconds: number;
	confidence: 'high' | 'medium' | 'low';
	reason: string;
	logged: boolean;
	/** Calendar event title — present on unmapped calendar suggestions */
	calendarEventTitle?: string;
}

export interface RescueTimeActivity {
	name: string;
	category: string;
	seconds: number;
	productivity: number;
}

export interface RescueTimeDaySummary {
	productiveSeconds: number;
	topActivities: RescueTimeActivity[];
}

export interface DaySummary {
	date: string;
	dayOfWeek: number;
	isWeekend: boolean;
	loggedSeconds: number;
	targetSeconds: number;
	gapSeconds: number;
	suggestions: WorklogSuggestion[];
	rescueTime?: RescueTimeDaySummary;
}

export interface WeekRange {
	start: string;
	end: string;
}
