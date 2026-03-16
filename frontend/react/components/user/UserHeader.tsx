import type React from 'react';
import { getInitials } from '../../utils/text';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import * as styles from './UserHeader.module.css';

type Props = {
	user: string;
	totalSeconds: number;
	targetSeconds?: number;
	onDownloadUser: (user: string) => void;
};

export const UserHeader: React.FC<Props> = ({
	user,
	totalSeconds,
	targetSeconds,
	onDownloadUser,
}) => {
	const totalHours = totalSeconds / 3600;
	const targetHours = targetSeconds ? targetSeconds / 3600 : undefined;
	const pct = targetSeconds ? (totalSeconds / targetSeconds) * 100 : undefined;

	return (
		<div className={styles.container}>
			<div className={styles.left}>
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
			</div>
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
