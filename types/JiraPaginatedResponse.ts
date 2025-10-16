export interface JiraPaginatedResponse<_T> {
	startAt: number;
	maxResults: number;
	total: number;
	// The Jira API uses different property names for arrays in different endpoints
	// We'll allow both "values" (common in Agile API) and custom keys via index signature
	[key: string]: unknown;
}
