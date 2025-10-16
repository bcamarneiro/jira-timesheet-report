import type React from 'react';
import type { JiraWorklog } from '../../../../types/JiraWorklog';
import { isRetroactiveWorklog } from '../../utils/csv';
import { formatHours } from '../../utils/format';
import { truncate } from '../../utils/text';
import * as styles from './WorklogItem.module.css';

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
			: '';
	const comment = worklog.comment || '';
	const isRetroactive = isRetroactiveWorklog(
		worklog,
		currentYear,
		currentMonth,
	);
	const tooltip = [
		issueTitle ? `Issue: ${issueTitle}` : '',
		comment ? `Comment: ${truncate(comment)}` : '',
		isRetroactive
			? '⚠️ Logged in current month but belongs to previous month'
			: '',
	]
		.filter(Boolean)
		.join('\n');

	return (
		<div className={styles.container}>
			<span className={styles.hours}>
				{formatHours(worklog.timeSpentSeconds)} -{}
			</span>
			<a
				href={`https://${jiraDomain}/browse/${keyOrId}?focusedId=${worklog.id}&page=com.atlassian.jira.plugin.system.issuetabpanels%3Aworklog-tabpanel#worklog-${worklog.id}`}
				target="_blank"
				rel="noreferrer"
				className={styles.issueLink}
			>
				{keyOrId}
			</a>
			{isRetroactive && (
				<span
					title="Logged in current month but belongs to previous month"
					className={styles.retroactiveIcon}
				>
					⚠️
				</span>
			)}
			{(issueTitle || comment) && (
				<span title={tooltip} className={styles.tooltipIcon}>
					🛈
				</span>
			)}
		</div>
	);
};
