import type React from 'react';
import { useState } from 'react';
import type { WorklogSuggestion } from '../../../../types/Suggestion';
import { useConfigStore } from '../../../stores/useConfigStore';
import { useDashboardStore } from '../../../stores/useDashboardStore';
import { useUserDataStore } from '../../../stores/useUserDataStore';
import { useWorklogOperations } from '../../hooks/useWorklogOperations';
import { Modal } from '../ui/Modal';
import { toast } from '../ui/Toast';
import { WorklogForm } from '../worklog/WorklogForm';
import * as styles from './SuggestionCard.module.css';

type Props = {
	suggestion: WorklogSuggestion;
	isFocused?: boolean;
};

const SOURCE_LABELS: Record<string, string> = {
	'jira-activity': 'Jira',
	gitlab: 'GitLab',
	calendar: 'Calendar',
	rescuetime: 'RescueTime',
	favorite: 'Pinned',
	template: 'Template',
	'previous-week': 'Prev Week',
};

const SOURCE_STYLES: Record<string, string> = {
	'jira-activity': styles.jiraActivity,
	gitlab: styles.gitlab,
	calendar: styles.calendar,
	rescuetime: styles.rescuetime,
	favorite: styles.favorite,
	template: styles.template,
	'previous-week': styles.previousWeek,
};

const CONFIDENCE_STYLES: Record<string, string> = {
	high: styles.high,
	medium: styles.medium,
	low: styles.low,
};

export const SuggestionCard: React.FC<Props> = ({ suggestion, isFocused }) => {
	const jiraDomain = useConfigStore((s) => s.config.jiraHost);
	const markLogged = useDashboardStore((s) => s.markSuggestionLogged);
	const unmarkLogged = useDashboardStore((s) => s.unmarkSuggestionLogged);
	const dismiss = useDashboardStore((s) => s.dismissSuggestion);
	const adjustTime = useDashboardStore((s) => s.adjustSuggestionTime);
	const addCalendarMapping = useUserDataStore((s) => s.addCalendarMapping);
	const { createWorklog, deleteWorklog, isLoading } = useWorklogOperations();
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isMappingOpen, setIsMappingOpen] = useState(false);
	const [mappingIssueKey, setMappingIssueKey] = useState('');
	const [isReasonExpanded, setIsReasonExpanded] = useState(false);
	const isLongReason = suggestion.reason.length > 80;

	const isUnmapped =
		suggestion.source === 'calendar' &&
		!suggestion.issueKey &&
		!!suggestion.calendarEventTitle;

	const handleMapToIssue = () => {
		const key = mappingIssueKey.trim().toUpperCase();
		if (!key) return;

		addCalendarMapping({
			pattern: suggestion.calendarEventTitle || '',
			issueKey: key,
		});
		setIsMappingOpen(false);
		setMappingIssueKey('');
		toast.success(`Mapped "${suggestion.calendarEventTitle}" to ${key}`);
	};

	const handleLogIt = async () => {
		try {
			const worklog = await createWorklog({
				issueKey: suggestion.issueKey,
				timeSpent: suggestion.suggestedTimeSpent,
				comment: '',
				started: `${suggestion.date}T09:00`,
			});
			markLogged(suggestion.id);
			const worklogId = worklog.id;
			const undoAction = worklogId
				? {
						action: {
							label: 'Undo',
							onClick: () => {
								deleteWorklog(suggestion.issueKey, worklogId).then(() => {
									unmarkLogged(suggestion.id);
								});
							},
						},
					}
				: undefined;
			toast.success(
				`Logged ${suggestion.suggestedTimeSpent} to ${suggestion.issueKey}`,
				undoAction,
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

	// Unmapped calendar event card
	if (isUnmapped) {
		return (
			<div
				className={`${styles.card} ${styles.unmapped} ${isFocused ? styles.focused : ''}`}
			>
				<div className={styles.header}>
					<div className={styles.issueInfo}>
						<span className={styles.unmappedTitle}>
							{suggestion.calendarEventTitle}
						</span>
					</div>
					<div className={styles.meta}>
						<span className={`${styles.badge} ${styles.calendar}`}>
							Calendar
						</span>
						<span className={styles.unmappedLabel}>Unmapped</span>
					</div>
				</div>
								<div
					className={`${styles.reason} ${isLongReason && !isReasonExpanded ? styles.reasonTruncated : ''}`}
					onClick={isLongReason ? () => setIsReasonExpanded(!isReasonExpanded) : undefined}
					role={isLongReason ? 'button' : undefined}
					tabIndex={isLongReason ? 0 : undefined}
					onKeyDown={isLongReason ? (e) => { if (e.key === 'Enter' || e.key === ' ') setIsReasonExpanded(!isReasonExpanded); } : undefined}
				>
					{suggestion.reason}
				</div>
				{isMappingOpen ? (
					<div className={styles.mappingRow}>
						<input
							type="text"
							className={styles.mappingInput}
							value={mappingIssueKey}
							onChange={(e) => setMappingIssueKey(e.target.value)}
							placeholder="PROJ-123"
							onKeyDown={(e) => {
								if (e.key === 'Enter') handleMapToIssue();
								if (e.key === 'Escape') setIsMappingOpen(false);
							}}
						/>
						<button
							type="button"
							className={styles.logButton}
							onClick={handleMapToIssue}
							disabled={!mappingIssueKey.trim()}
						>
							Save
						</button>
						<button
							type="button"
							className={styles.dismissButton}
							onClick={() => setIsMappingOpen(false)}
						>
							Cancel
						</button>
					</div>
				) : (
					<div className={styles.actions}>
						<span className={styles.time}>{suggestion.suggestedTimeSpent}</span>
						<button
							type="button"
							className={styles.mapButton}
							onClick={() => setIsMappingOpen(true)}
						>
							Map to Issue
						</button>
						<button
							type="button"
							className={styles.dismissButton}
							onClick={() => dismiss(suggestion.id)}
						>
							Dismiss
						</button>
					</div>
				)}
			</div>
		);
	}

	return (
		<>
			<div className={`${styles.card} ${isFocused ? styles.focused : ''}`}>
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
								<div
					className={`${styles.reason} ${isLongReason && !isReasonExpanded ? styles.reasonTruncated : ''}`}
					onClick={isLongReason ? () => setIsReasonExpanded(!isReasonExpanded) : undefined}
					role={isLongReason ? 'button' : undefined}
					tabIndex={isLongReason ? 0 : undefined}
					onKeyDown={isLongReason ? (e) => { if (e.key === 'Enter' || e.key === ' ') setIsReasonExpanded(!isReasonExpanded); } : undefined}
				>
					{suggestion.reason}
				</div>
				<div className={styles.actions}>
					<div className={styles.timeAdjust}>
						<button
							type="button"
							className={styles.adjustButton}
							onClick={() => adjustTime(suggestion.id, -900)}
							disabled={suggestion.suggestedSeconds <= 900}
							aria-label="Decrease time by 15 minutes"
						>
							&minus;
						</button>
						<span className={styles.time}>{suggestion.suggestedTimeSpent}</span>
						<button
							type="button"
							className={styles.adjustButton}
							onClick={() => adjustTime(suggestion.id, 900)}
							aria-label="Increase time by 15 minutes"
						>
							+
						</button>
					</div>
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
