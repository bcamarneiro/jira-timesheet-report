import { HttpResponse, http } from "msw";
import type { JiraIssue } from "../../types/JiraIssue";
import MockIssueSummaries from "./MockIssueSummaries";
import MockWorklogs from "./MockWorklogs";

const mockIssues: JiraIssue[] = Object.entries(MockIssueSummaries).map(
  ([id, summary]) => ({
    id,
    key: `JRA-${id}`,
    expand: "",
    self: "",
    fields: {
      summary,
    },
  })
);

export const handlers = [
  // Mock for searching issues
  http.post("https://*.atlassian.net/rest/api/3/search", () => {
    return HttpResponse.json({
      issues: mockIssues,
      total: mockIssues.length,
    });
  }),

  // Mock for getting worklogs for an issue
  http.get(
    "https://*.atlassian.net/rest/api/3/issue/:issueId/worklog",
    ({ params }) => {
      const { issueId } = params;
      const worklogs = MockWorklogs.filter((wl) => wl.issueId === issueId);
      return HttpResponse.json({
        worklogs,
      });
    }
  ),
];
