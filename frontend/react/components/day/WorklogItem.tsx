import type React from "react";
import type { JiraWorklog } from "../../../../types/JiraWorklog";
import { isRetroactiveWorklog } from "../../utils/csv";
import { formatHours } from "../../utils/format";
import { truncate } from "../../utils/text";

type Props = {
	worklog: JiraWorklog;
	jiraDomain: string;
	issueSummaries: Record<string, string>;
	currentYear: number;
	currentMonth: number;
};

export const WorklogItem: React.FC<Props> = ({
	worklog,
	jiraDomain,
	issueSummaries,
	currentYear,
	currentMonth,
}) => {
	const keyOrId = worklog.issueKey ?? worklog.issueId;
	const issueTitle =
		worklog.issueKey && issueSummaries[worklog.issueKey]
			? issueSummaries[worklog.issueKey]
			: "";
	const comment = worklog.comment || "";
	const isRetroactive = isRetroactiveWorklog(
		worklog,
		currentYear,
		currentMonth,
	);
	const tooltip = [
		issueTitle ? `Issue: ${issueTitle}` : "",
		comment ? `Comment: ${truncate(comment)}` : "",
		isRetroactive
			? "⚠️ Logged in current month but belongs to previous month"
			: "",
	]
		.filter(Boolean)
		.join("\n");

	return (
		<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
			<span style={{ color: "#444", whiteSpace: "nowrap" }}>
				{formatHours(worklog.timeSpentSeconds)} -{" "}
			</span>
			<a
				href={`https://${jiraDomain}/browse/${keyOrId}?focusedId=${worklog.id}&page=com.atlassian.jira.plugin.system.issuetabpanels%3Aworklog-tabpanel#worklog-${worklog.id}`}
				target="_blank"
				rel="noreferrer"
				style={{ color: "#0b5cff", textDecoration: "none" }}
			>
				{keyOrId}
			</a>
			{isRetroactive && (
				<span
					title="Logged in current month but belongs to previous month"
					style={{ color: "#ff6b35", fontSize: "14px", marginLeft: 2 }}
				>
					⚠️
				</span>
			)}
			{(issueTitle || comment) && (
				<span title={tooltip} style={{ cursor: "help", marginLeft: 4 }}>
					🛈
				</span>
			)}
		</div>
	);
};
