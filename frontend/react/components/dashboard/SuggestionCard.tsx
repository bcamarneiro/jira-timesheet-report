import type React from 'react';
import { useState } from 'react';
import type { WorklogSuggestion } from '../../../../types/Suggestion';
import { useConfigStore } from '../../../stores/useConfigStore';
import { useDashboardStore } from '../../../stores/useDashboardStore';
import { useWorklogOperations } from '../../hooks/useWorklogOperations';
import { Modal } from '../ui/Modal';
import { toast } from '../ui/Toast';
import { WorklogForm } from '../worklog/WorklogForm';
import * as styles from './SuggestionCard.module.css';

type Props = {
	suggestion: WorklogSuggestion;
};

const SOURCE_LABELS: Record<string, string> = {
	'jira-activity': 'Jira',
	gitlab: 'GitLab',
	rescuetime: 'RescueTime',
};

const SOURCE_STYLES: Record<string, string> = {
	'jira-activity': styles.jiraActivity,
	gitlab: styles.gitlab,
	rescuetime: styles.rescuetime,
};

const CONFIDENCE_STYLES: Record<string, string> = {
	high: styles.high,
	medium: styles.medium,
	low: styles.low,
};

export const SuggestionCard: React.FC<Props> = ({ suggestion }) => {
	const jiraDomain = useConfigStore((s) => s.config.jiraHost);
	const markLogged = useDashboardStore((s) => s.markSuggestionLogged);
	const dismiss = useDashboardStore((s) => s.dismissSuggestion);
	const { createWorklog, isLoading } = useWorklogOperations();
	const [isEditOpen, setIsEditOpen] = useState(false);

	const handleLogIt = async () => {
		try {
			await createWorklog({
				issueKey: suggestion.issueKey,
				timeSpent: suggestion.suggestedTimeSpent,
				comment: '',
				started: `${suggestion.date}T09:00`,
			});
			markLogged(suggestion.id);
			toast.success(
				`Logged ${suggestion.suggestedTimeSpent} to ${suggestion.issueKey}`,
			);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Failed to log');
		}
	};

	const handleEditSubmit = async (data: {
		issueKey: string;
		timeSpent: string;
		comment: string;
		started: string;
	}) => {
		await createWorklog(data);
		markLogged(suggestion.id);
		setIsEditOpen(false);
		toast.success(`Logged to ${data.issueKey}`);
	};

	if (suggestion.logged) {
		return (
			<div className={`${styles.card} ${styles.logged}`}>
				<span className={styles.checkmark}>&#10003;</span>
				<span className={styles.loggedText}>
					{suggestion.suggestedTimeSpent} logged to {suggestion.issueKey}
				</span>
			</div>
		);
	}

	return (
		<>
			<div className={styles.card}>
				<div className={styles.header}>
					<div className={styles.issueInfo}>
						<a
							href={`https://${jiraDomain}/browse/${suggestion.issueKey}`}
							target="_blank"
							rel="noreferrer"
							className={styles.issueKey}
						>
							{suggestion.issueKey}
						</a>
						{suggestion.issueSummary && (
							<span className={styles.issueSummary}>
								{suggestion.issueSummary}
							</span>
						)}
					</div>
					<div className={styles.meta}>
						<span
							className={`${styles.badge} ${SOURCE_STYLES[suggestion.source] ?? ''}`}
						>
							{SOURCE_LABELS[suggestion.source]}
						</span>
						<span
							className={`${styles.confidence} ${CONFIDENCE_STYLES[suggestion.confidence] ?? ''}`}
						>
							{suggestion.confidence}
						</span>
					</div>
				</div>
				<div className={styles.reason}>{suggestion.reason}</div>
				<div className={styles.actions}>
					<span className={styles.time}>{suggestion.suggestedTimeSpent}</span>
					<button
						type="button"
						className={styles.logButton}
						onClick={handleLogIt}
						disabled={isLoading}
					>
						Log it
					</button>
					<button
						type="button"
						className={styles.editButton}
						onClick={() => setIsEditOpen(true)}
					>
						Edit & Log
					</button>
					<button
						type="button"
						className={styles.dismissButton}
						onClick={() => dismiss(suggestion.id)}
					>
						Dismiss
					</button>
				</div>
			</div>

			<Modal
				isOpen={isEditOpen}
				onClose={() => setIsEditOpen(false)}
				title="Log Worklog"
			>
				<WorklogForm
					initialData={{
						issueKey: suggestion.issueKey,
						timeSpent: suggestion.suggestedTimeSpent,
						comment: '',
						started: `${suggestion.date}T09:00`,
					}}
					onSubmit={handleEditSubmit}
					onCancel={() => setIsEditOpen(false)}
					isLoading={isLoading}
				/>
			</Modal>
		</>
	);
};
