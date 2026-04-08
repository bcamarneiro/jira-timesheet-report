import type React from 'react';
import type { WorklogFetchProgress } from '../../../../types/worklogLoading';
import * as styles from './WorklogLoadingStatus.module.css';

type Props = {
	title: string;
	progress: WorklogFetchProgress | null;
	compact?: boolean;
};

export const WorklogLoadingStatus: React.FC<Props> = ({
	title,
	progress,
	compact = false,
}) => {
	const percent = progress?.percent ?? 8;
	const message = progress?.message ?? 'Preparing worklog fetch…';

	return (
		<div className={compact ? styles.compact : styles.card} aria-live="polite">
			<div className={styles.header}>
				<strong>{title}</strong>
				<span>{Math.round(percent)}%</span>
			</div>
			<p className={styles.message}>{message}</p>
			{progress?.detail ? (
				<p className={styles.detail}>{progress.detail}</p>
			) : null}
			<div
				className={styles.track}
				style={{ height: compact ? 6 : 8 }}
				aria-hidden="true"
			>
				<div
					className={styles.fill}
					style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
				/>
			</div>
		</div>
	);
};
