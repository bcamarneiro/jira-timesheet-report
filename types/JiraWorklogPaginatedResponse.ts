import { JiraPaginatedResponse } from './JiraPaginatedResponse';
import type { JiraWorklog } from './JiraWorklog';

export interface JiraWorklogPaginatedResponse
  extends JiraPaginatedResponse<JiraWorklog> {
  worklogs: JiraWorklog[];
}