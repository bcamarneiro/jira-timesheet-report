export interface JiraIssue {
  expand: string;
  id: string;
  self: string;
  key: string;
  fields?: {
    summary?: string;
    [key: string]: unknown;
  };
}