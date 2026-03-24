import type React from 'react';
import type { EnrichedJiraWorklog } from '../../../../types/jira';
import { useConfigStore } from '../../../stores/useConfigStore';
import { useTimesheetStore } from '../../../stores/useTimesheetStore';
import { isRetroactiveWorklog } from '../../utils/csv';
import { formatHours } from '../../utils/format';
import {
	getRetroactiveDays,
	isRetroactivelyLogged,
} from '../../utils/retroactive';
import { truncate } from '../../utils/text';
import * as styles from './WorklogItem.module.css';

type Props = {
	worklog: EnrichedJiraWorklog;
	issueSummaries: Record<string, string>;
	onEdit?: (worklog: EnrichedJiraWorklog) => void;
	onDelete?: (worklog: EnrichedJiraWorklog) => void;
};

export const WorklogItem: React.FC<Props> = ({
	worklog,
	issueSummaries,
	onEdit,
	onDelete,
}) => {
	// Access stores directly - no prop drilling!
	const jiraDomain = useConfigStore((state) => state.config.jiraHost);
	const currentYear = useTimesheetStore((state) => state.currentYear);
	const currentMonth = useTimesheetStore((state) => state.currentMonth);
	const keyOrId = worklog.issue?.key ?? worklog.issueId;
	const issueTitle =
		issueSummaries[worklog.issue?.key ?? ''] ||
		issueSummaries[worklog.issue?.id ?? ''] ||
		worklog.issue?.fields.summary ||
		'';
	const comment = worklog.comment || '';
	const created = worklog.created as string | undefined;
	const started = worklog.started as string | undefined;
	const isRetroactive =
		isRetroactiveWorklog(worklog, currentYear, currentMonth) ||
		isRetroactivelyLogged(created, started);
	const retroactiveDays = getRetroactiveDays(created, started);
	const retroactiveLabel =
		retroactiveDays > 0
			? `Logged ${retroactiveDays}d after the work date`
			: 'Logged in current month but belongs to previous month';
	const tooltip = [
		issueTitle ? `Issue: ${issueTitle}` : '',
		comment ? `Comment: ${truncate(comment)}` : '',
		isRetroactive ? `⚠️ ${retroactiveLabel}` : '',
	]
		.filter(Boolean)
		.join('\n');

	return (
		<div className={styles.container}>
			<div className={styles.info}>
				<span className={styles.hours}>
					{formatHours(worklog.timeSpentSeconds)}
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
					<span title={retroactiveLabel} className={styles.retroactiveIcon}>
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
							aria-label={`Edit worklog for ${keyOrId}`}
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
							aria-label={`Delete worklog for ${keyOrId}`}
						>
							🗑️
						</button>
					)}
				</div>
			)}
		</div>
	);
};
