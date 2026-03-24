import type React from 'react';
import { getInitials } from '../../utils/text';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import * as styles from './UserHeader.module.css';

type Props = {
	user: string;
	totalSeconds: number;
	targetSeconds?: number;
	onDownloadUser: (user: string) => void;
	collapsed?: boolean;
	onToggleCollapse?: () => void;
};

export const UserHeader: React.FC<Props> = ({
	user,
	totalSeconds,
	targetSeconds,
	onDownloadUser,
	collapsed,
	onToggleCollapse,
}) => {
	const totalHours = totalSeconds / 3600;
	const targetHours = targetSeconds ? targetSeconds / 3600 : undefined;
	const pct = targetSeconds ? (totalSeconds / targetSeconds) * 100 : undefined;

	const leftContent = (
		<>
			{onToggleCollapse && (
				<span className={styles.chevron}>
					{collapsed ? '\u25B6' : '\u25BC'}
				</span>
			)}
			<h2 className={styles.userTitle}>
				<span className={styles.avatar}>{getInitials(user)}</span>
				{user}
			</h2>
			{targetHours !== undefined && pct !== undefined && (
				<div className={styles.progress}>
					<span className={styles.progressLabel}>
						{totalHours.toFixed(1)}h / {targetHours}h ({Math.round(pct)}%)
					</span>
					<div className={styles.progressBar}>
						<ProgressBar value={pct} height={4} />
					</div>
				</div>
			)}
		</>
	);

	return (
		<div className={styles.container}>
			{onToggleCollapse ? (
				<button
					type="button"
					className={styles.leftClickable}
					onClick={onToggleCollapse}
					aria-expanded={!collapsed}
					aria-label={`${collapsed ? 'Expand' : 'Collapse'} report for ${user}`}
				>
					{leftContent}
				</button>
			) : (
				<div className={styles.left}>{leftContent}</div>
			)}
			{totalSeconds > 0 && (
				<div className={styles.actions}>
					<Button variant="secondary" onClick={() => onDownloadUser(user)}>
						Download CSV
					</Button>
				</div>
			)}
		</div>
	);
};
