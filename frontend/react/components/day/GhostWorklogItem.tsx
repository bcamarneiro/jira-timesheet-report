import type React from 'react';
import { useConfigStore } from '../../../stores/useConfigStore';
import { formatHours } from '../../utils/format';
import type { GhostEntry } from '../../utils/projectDays';
import * as styles from './GhostWorklogItem.module.css';

type Props = {
	ghost: GhostEntry;
};

export const GhostWorklogItem: React.FC<Props> = ({ ghost }) => {
	const jiraDomain = useConfigStore((state) => state.config.jiraHost);
	const { worklog, classified } = ghost;
	const keyOrId = worklog.issue?.key ?? worklog.issueId ?? '';
	const tooltip = `Submitted on ${classified.loggedOn} (${classified.daysLate}d after this date). Counts toward ${classified.loggedOn}, not this day.`;

	return (
		<div
			className={styles.container}
			role="note"
			aria-label={`Backdated worklog: ${formatHours(worklog.timeSpentSeconds ?? 0)}, does not count toward this day, submitted on ${classified.loggedOn}`}
			title={tooltip}
		>
			<span className={styles.hours}>
				{formatHours(worklog.timeSpentSeconds ?? 0)}
			</span>
			<a
				href={`https://${jiraDomain}/browse/${keyOrId}?focusedId=${worklog.id}&page=com.atlassian.jira.plugin.system.issuetabpanels%3Aworklog-tabpanel#worklog-${worklog.id}`}
				target="_blank"
				rel="noreferrer"
				className={styles.issueLink}
			>
				{keyOrId}
			</a>
			<span className={styles.arrow} aria-hidden="true">
				→
			</span>
			<span className={styles.loggedOn}>logged {classified.loggedOn}</span>
		</div>
	);
};
