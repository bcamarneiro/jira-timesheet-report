import type { JiraIssue } from './JiraIssue';
import type { JiraPaginatedResponse } from './JiraPaginatedResponse';

export interface JiraIssuePaginatedResponse
	extends JiraPaginatedResponse<JiraIssue> {
	issues: JiraIssue[];
}
