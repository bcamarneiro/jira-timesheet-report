import type React from 'react';
import { useState } from 'react';
import type { EnrichedJiraWorklog } from '../../../stores/useTimesheetStore';
import { Button } from '../ui/Button';
import * as styles from './WorklogForm.module.css';

type Props = {
	initialData?: {
		issueKey: string;
		timeSpent: string;
		comment: string;
		started: string;
	};
	onSubmit: (data: {
		issueKey: string;
		timeSpent: string;
		comment: string;
		started: string;
	}) => Promise<void>;
	onCancel: () => void;
	isEdit?: boolean;
	isLoading?: boolean;
};

export const WorklogForm: React.FC<Props> = ({
	initialData,
	onSubmit,
	onCancel,
	isEdit = false,
	isLoading = false,
}) => {
	const [issueKey, setIssueKey] = useState(initialData?.issueKey || '');
	const [timeSpent, setTimeSpent] = useState(initialData?.timeSpent || '');
	const [comment, setComment] = useState(initialData?.comment || '');
	const [started, setStarted] = useState(
		initialData?.started || new Date().toISOString().slice(0, 16),
	);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Validation
		if (!issueKey.trim()) {
			setError('Issue key is required');
			return;
		}

		if (!timeSpent.trim()) {
			setError('Time spent is required');
			return;
		}

		// Validate time format (e.g., 1h, 30m, 1h 30m, 2d)
		const timePattern = /^(\d+[wdhm]\s*)+$/i;
		if (!timePattern.test(timeSpent.trim())) {
			setError(
				'Invalid time format. Use formats like: 1h, 30m, 1h 30m, 2d, etc.',
			);
			return;
		}

		try {
			await onSubmit({
				issueKey: issueKey.trim().toUpperCase(),
				timeSpent: timeSpent.trim(),
				comment: comment.trim(),
				started,
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save worklog');
		}
	};

	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			<div className={styles.formGroup}>
				<label htmlFor="issueKey">
					Issue Key <span className={styles.required}>*</span>
				</label>
				<input
					type="text"
					id="issueKey"
					value={issueKey}
					onChange={(e) => setIssueKey(e.target.value)}
					placeholder="e.g., PROJ-123"
					disabled={isEdit || isLoading}
					className={styles.input}
					required
				/>
				<small className={styles.hint}>
					The Jira issue key (e.g., PROJ-123)
				</small>
			</div>

			<div className={styles.formGroup}>
				<label htmlFor="timeSpent">
					Time Spent <span className={styles.required}>*</span>
				</label>
				<input
					type="text"
					id="timeSpent"
					value={timeSpent}
					onChange={(e) => setTimeSpent(e.target.value)}
					placeholder="e.g., 1h 30m"
					disabled={isLoading}
					className={styles.input}
					required
				/>
				<small className={styles.hint}>Format: 1h, 30m, 1h 30m, 2d, etc.</small>
			</div>

			<div className={styles.formGroup}>
				<label htmlFor="started">Started</label>
				<input
					type="datetime-local"
					id="started"
					value={started}
					onChange={(e) => setStarted(e.target.value)}
					disabled={isLoading}
					className={styles.input}
				/>
			</div>

			<div className={styles.formGroup}>
				<label htmlFor="comment">Description (Optional)</label>
				<textarea
					id="comment"
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					placeholder="Add a description of the work done..."
					rows={4}
					disabled={isLoading}
					className={styles.textarea}
				/>
			</div>

			{error && <div className={styles.error}>{error}</div>}

			<div className={styles.actions}>
				<Button
					type="button"
					onClick={onCancel}
					variant="secondary"
					disabled={isLoading}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isLoading}>
					{isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'} Worklog
				</Button>
			</div>
		</form>
	);
};
