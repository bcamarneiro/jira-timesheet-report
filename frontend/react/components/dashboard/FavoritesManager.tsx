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
import * as styles from './FavoritesManager.module.css';

type Props = {
	isOpen: boolean;
	onClose: () => void;
};

export const FavoritesManager: React.FC<Props> = ({ isOpen, onClose }) => {
	const favorites = useUserDataStore((s) => s.favorites);
	const addFavorite = useUserDataStore((s) => s.addFavorite);
	const removeFavorite = useUserDataStore((s) => s.removeFavorite);

	const [issueKey, setIssueKey] = useState('');
	const [summary, setSummary] = useState('');
	const [defaultTime, setDefaultTime] = useState('1h');
	const [error, setError] = useState<string | null>(null);
	const sortedFavorites = [...favorites].sort((a, b) =>
		a.issueKey.localeCompare(b.issueKey),
	);
	const canSubmit =
		!!issueKey.trim() &&
		!!defaultTime.trim() &&
		isValidTimeSpentFormat(defaultTime);

	useEffect(() => {
		if (!isOpen) {
			setIssueKey('');
			setSummary('');
			setDefaultTime('1h');
			setError(null);
		}
	}, [isOpen]);

	const handleIssueSelect = (issue: { key: string; summary: string }) => {
		setIssueKey(issue.key);
		setSummary(issue.summary);
	};

	const handleAdd = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const key = issueKey.trim().toUpperCase();
		if (!key) {
			setError('Issue key is required');
			return;
		}

		const time = defaultTime.trim();
		if (!isValidTimeSpentFormat(time)) {
			setError('Invalid time format. Use formats like: 1h, 30m, 1h 30m');
			return;
		}

		const seconds = parseTimeSpentToSeconds(time);
		if (seconds <= 0) {
			setError('Time must be greater than zero');
			return;
		}

		if (favorites.some((f) => f.issueKey === key)) {
			setError('This issue is already pinned');
			return;
		}

		addFavorite({
			issueKey: key,
			issueSummary: summary.trim() || undefined,
			defaultTimeSpent: time,
			defaultSeconds: seconds,
		});

		setIssueKey('');
		setSummary('');
		setDefaultTime('1h');
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Pinned Issues">
			<div className={styles.container}>
				<form onSubmit={handleAdd} className={styles.form}>
					<div className={styles.formRow}>
						<div className={styles.formGroup}>
							<label htmlFor="fav-issue-key">Issue Key</label>
							<IssueAutocomplete
								value={issueKey}
								onChange={setIssueKey}
								onSelect={handleIssueSelect}
								placeholder="e.g., PROJ-123 or search..."
								id="fav-issue-key"
							/>
						</div>
						<div className={styles.formGroup}>
							<label htmlFor="fav-time">Default Time</label>
							<input
								type="text"
								id="fav-time"
								value={defaultTime}
								onChange={(e) => setDefaultTime(e.target.value)}
								placeholder="e.g., 1h"
								className={styles.inputSmall}
							/>
						</div>
					</div>
					<div className={styles.formGroup}>
						<label htmlFor="fav-summary">
							Summary <span className={styles.optional}>optional</span>
						</label>
						<input
							type="text"
							id="fav-summary"
							value={summary}
							onChange={(e) => setSummary(e.target.value)}
							placeholder="Short description"
							className={styles.input}
						/>
					</div>
					{error && <div className={styles.error}>{error}</div>}
					<Button type="submit" disabled={!canSubmit}>
						Add Pinned Issue
					</Button>
				</form>

				{favorites.length > 0 && (
					<div className={styles.list}>
						<h4 className={styles.listTitle}>
							Current Pins{' '}
							<span className={styles.listCount}>{favorites.length}</span>
						</h4>
						{sortedFavorites.map((fav) => (
							<div key={fav.issueKey} className={styles.item}>
								<div className={styles.itemInfo}>
									<span className={styles.itemKey}>{fav.issueKey}</span>
									{fav.issueSummary && (
										<span className={styles.itemSummary}>
											{fav.issueSummary}
										</span>
									)}
									<span className={styles.itemTime}>
										{fav.defaultTimeSpent}
									</span>
								</div>
								<button
									type="button"
									className={styles.removeButton}
									onClick={() => removeFavorite(fav.issueKey)}
									aria-label={`Remove ${fav.issueKey}`}
								>
									Remove
								</button>
							</div>
						))}
					</div>
				)}
				{favorites.length === 0 && (
					<div className={styles.emptyState}>No pinned issues yet.</div>
				)}
			</div>
		</Modal>
	);
};
