import type React from 'react';
import type { EnrichedJiraWorklog } from '../../../stores/useTimesheetStore';
import { useConfigStore } from '../../../stores/useConfigStore';
import { useTimesheetStore } from '../../../stores/useTimesheetStore';
import { isRetroactiveWorklog } from '../../utils/csv';
import { formatHours } from '../../utils/format';
import { truncate } from '../../utils/text';
import * as styles from './WorklogItem.module.css';

type Props = {
	worklog: EnrichedJiraWorklog;
	onEdit?: (worklog: EnrichedJiraWorklog) => void;
	onDelete?: (worklog: EnrichedJiraWorklog) => void;
};

export const WorklogItem: React.FC<Props> = ({ worklog, onEdit, onDelete }) => {
	// Access stores directly - no prop drilling!
	const jiraDomain = useConfigStore((state) => state.config.jiraHost);
	const issueSummaries = useTimesheetStore((state) => state.issueSummaries);
	const currentYear = useTimesheetStore((state) => state.currentYear);
	const currentMonth = useTimesheetStore((state) => state.currentMonth);
	const keyOrId = worklog.issue?.key ?? worklog.issueId;
	const issueTitle =
		worklog.issue?.key && issueSummaries[worklog.issue.key]
			? issueSummaries[worklog.issue.key]
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
			<div className={styles.info}>
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
			{(onEdit || onDelete) && (
				<div className={styles.actions}>
					{onEdit && (
						<button
							type="button"
							onClick={() => onEdit(worklog)}
							className={styles.actionButton}
							title="Edit worklog"
						>
							✏️
						</button>
					)}
					{onDelete && (
						<button
							type="button"
							onClick={() => onDelete(worklog)}
							className={styles.actionButton}
							title="Delete worklog"
						>
							🗑️
						</button>
					)}
				</div>
			)}
		</div>
	);
};
