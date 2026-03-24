import type React from 'react';
import { useEffect, useState } from 'react';
import { useUserDataStore } from '../../../stores/useUserDataStore';
import {
	isValidTimeSpentFormat,
	parseTimeSpentToSeconds,
} from '../../utils/timeSpent';
import { Button } from '../ui/Button';
import { IssueAutocomplete } from '../ui/IssueAutocomplete';
import { Modal } from '../ui/Modal';
import * as styles from './TemplatesManager.module.css';

type Props = {
	isOpen: boolean;
	onClose: () => void;
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_WEEKDAYS = [1, 2, 3, 4, 5]; // Mon-Fri

export const TemplatesManager: React.FC<Props> = ({ isOpen, onClose }) => {
	const templates = useUserDataStore((s) => s.templates);
	const addTemplate = useUserDataStore((s) => s.addTemplate);
	const removeTemplate = useUserDataStore((s) => s.removeTemplate);
	const toggleTemplate = useUserDataStore((s) => s.toggleTemplate);

	const [issueKey, setIssueKey] = useState('');
	const [summary, setSummary] = useState('');
	const [timeSpent, setTimeSpent] = useState('1h');
	const [comment, setComment] = useState('');
	const [daysOfWeek, setDaysOfWeek] = useState<number[]>(DEFAULT_WEEKDAYS);
	const [error, setError] = useState<string | null>(null);
	const sortedTemplates = [...templates].sort((a, b) => {
		if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
		return a.issueKey.localeCompare(b.issueKey);
	});
	const canSubmit =
		!!issueKey.trim() &&
		!!timeSpent.trim() &&
		isValidTimeSpentFormat(timeSpent) &&
		daysOfWeek.length > 0;

	useEffect(() => {
		if (!isOpen) {
			setIssueKey('');
			setSummary('');
			setTimeSpent('1h');
			setComment('');
			setDaysOfWeek(DEFAULT_WEEKDAYS);
			setError(null);
		}
	}, [isOpen]);

	const handleIssueSelect = (issue: { key: string; summary: string }) => {
		setIssueKey(issue.key);
		setSummary(issue.summary);
	};

	const handleDayToggle = (day: number) => {
		setDaysOfWeek((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
		);
	};

	const handleAdd = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const key = issueKey.trim().toUpperCase();
		if (!key) {
			setError('Issue key is required');
			return;
		}

		const time = timeSpent.trim();
		if (!isValidTimeSpentFormat(time)) {
			setError('Invalid time format. Use formats like: 1h, 30m, 1h 30m');
			return;
		}

		const seconds = parseTimeSpentToSeconds(time);
		if (seconds <= 0) {
			setError('Time must be greater than zero');
			return;
		}

		if (daysOfWeek.length === 0) {
			setError('Select at least one day');
			return;
		}

		if (
			templates.some(
				(t) =>
					t.issueKey === key &&
					t.timeSpent === time &&
					t.comment === comment.trim() &&
					t.daysOfWeek.join(',') === [...daysOfWeek].sort().join(','),
			)
		) {
			setError('An identical template already exists');
			return;
		}

		addTemplate({
			id: `${key}-${[...daysOfWeek].sort().join('-')}-${time}-${comment.trim() || 'no-comment'}`,
			issueKey: key,
			issueSummary: summary.trim() || undefined,
			timeSpent: time,
			seconds,
			comment: comment.trim(),
			daysOfWeek: [...daysOfWeek].sort(),
			enabled: true,
		});

		setIssueKey('');
		setSummary('');
		setTimeSpent('1h');
		setComment('');
		setDaysOfWeek(DEFAULT_WEEKDAYS);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Recurring Templates">
			<div className={styles.container}>
				<form onSubmit={handleAdd} className={styles.form}>
					<div className={styles.formRow}>
						<div className={styles.formGroup}>
							<label htmlFor="tmpl-issue-key">Issue Key</label>
							<IssueAutocomplete
								value={issueKey}
								onChange={setIssueKey}
								onSelect={handleIssueSelect}
								placeholder="e.g., PROJ-123 or search..."
								id="tmpl-issue-key"
							/>
						</div>
						<div className={styles.formGroup}>
							<label htmlFor="tmpl-time">Time Spent</label>
							<input
								type="text"
								id="tmpl-time"
								value={timeSpent}
								onChange={(e) => setTimeSpent(e.target.value)}
								placeholder="e.g., 1h"
								className={styles.inputSmall}
							/>
						</div>
					</div>
					<div className={styles.formGroup}>
						<label htmlFor="tmpl-summary">
							Summary <span className={styles.optional}>optional</span>
						</label>
						<input
							type="text"
							id="tmpl-summary"
							value={summary}
							onChange={(e) => setSummary(e.target.value)}
							placeholder="Short description"
							className={styles.input}
						/>
					</div>
					<div className={styles.formGroup}>
						<label htmlFor="tmpl-comment">
							Comment <span className={styles.optional}>optional</span>
						</label>
						<input
							type="text"
							id="tmpl-comment"
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							placeholder="Work description for the log"
							className={styles.input}
						/>
					</div>
					<fieldset className={styles.dayFieldset}>
						<legend className={styles.dayLegend}>Days of Week</legend>
						<div className={styles.dayShortcuts}>
							<button
								type="button"
								className={styles.shortcutButton}
								onClick={() => setDaysOfWeek(DEFAULT_WEEKDAYS)}
							>
								Weekdays
							</button>
							<button
								type="button"
								className={styles.shortcutButton}
								onClick={() => setDaysOfWeek([1, 3, 5])}
							>
								Mon/Wed/Fri
							</button>
							<button
								type="button"
								className={styles.shortcutButton}
								onClick={() => setDaysOfWeek([])}
							>
								Clear
							</button>
						</div>
						<div className={styles.dayPicker}>
							{DAY_LABELS.map((label, index) => (
								<label
									key={label}
									className={`${styles.dayCheckbox} ${daysOfWeek.includes(index) ? styles.dayChecked : ''}`}
								>
									<input
										type="checkbox"
										checked={daysOfWeek.includes(index)}
										onChange={() => handleDayToggle(index)}
										className={styles.hiddenCheckbox}
									/>
									{label}
								</label>
							))}
						</div>
					</fieldset>
					{error && <div className={styles.error}>{error}</div>}
					<Button type="submit" disabled={!canSubmit}>
						Add Template
					</Button>
				</form>

				{templates.length > 0 && (
					<div className={styles.list}>
						<h4 className={styles.listTitle}>
							Current Templates{' '}
							<span className={styles.listCount}>{templates.length}</span>
						</h4>
						{sortedTemplates.map((tmpl) => (
							<div
								key={tmpl.id}
								className={`${styles.item} ${!tmpl.enabled ? styles.itemDisabled : ''}`}
							>
								<div className={styles.itemContent}>
									<div className={styles.itemHeader}>
										<span className={styles.itemKey}>{tmpl.issueKey}</span>
										{tmpl.issueSummary && (
											<span className={styles.itemSummary}>
												{tmpl.issueSummary}
											</span>
										)}
										<span className={styles.itemTime}>{tmpl.timeSpent}</span>
									</div>
									<div className={styles.itemMeta}>
										<span className={styles.itemDays}>
											{tmpl.daysOfWeek
												.sort((a, b) => a - b)
												.map((d) => DAY_LABELS[d])
												.join(', ')}
										</span>
										{tmpl.comment && (
											<span className={styles.itemComment}>{tmpl.comment}</span>
										)}
									</div>
								</div>
								<div className={styles.itemActions}>
									<button
										type="button"
										className={styles.toggleButton}
										onClick={() => toggleTemplate(tmpl.id)}
										aria-label={`${tmpl.enabled ? 'Disable' : 'Enable'} template ${tmpl.issueKey}`}
									>
										{tmpl.enabled ? 'Disable' : 'Enable'}
									</button>
									<button
										type="button"
										className={styles.removeButton}
										onClick={() => removeTemplate(tmpl.id)}
										aria-label={`Remove template ${tmpl.issueKey}`}
									>
										Remove
									</button>
								</div>
							</div>
						))}
					</div>
				)}
				{templates.length === 0 && (
					<div className={styles.emptyState}>No recurring templates yet.</div>
				)}
			</div>
		</Modal>
	);
};
