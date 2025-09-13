import type React from "react";
import type { JiraWorklog } from "../../../../types/JiraWorklog";
import { WorklogItem } from "./WorklogItem";

type Props = {
	worklogs: JiraWorklog[];
	jiraDomain: string;
	issueSummaries: Record<string, string>;
	currentYear: number;
	currentMonth: number;
};

export const WorklogList: React.FC<Props> = ({
	worklogs,
	jiraDomain,
	issueSummaries,
	currentYear,
	currentMonth,
}) => {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 4,
				fontSize: 12,
				lineHeight: 1.3,
			}}
		>
			{worklogs.map((wl) => (
				<WorklogItem
					key={wl.id}
					worklog={wl}
					jiraDomain={jiraDomain}
					issueSummaries={issueSummaries}
					currentYear={currentYear}
					currentMonth={currentMonth}
				/>
			))}
		</div>
	);
};
