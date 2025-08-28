import type { JiraIssue } from './JiraIssue';
import { JiraPaginatedResponse } from './JiraPaginatedResponse';

export interface JiraIssuePaginatedResponse
  extends JiraPaginatedResponse<JiraIssue> {
  issues: JiraIssue[];
}