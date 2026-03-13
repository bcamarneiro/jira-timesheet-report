import type React from 'react';
import { Button } from '../ui/Button';
import * as styles from './UserHeader.module.css';

type Props = {
	user: string;
	totalSeconds: number;
	onDownloadUser: (user: string) => void;
};

function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}
	return name.slice(0, 2).toUpperCase();
}

export const UserHeader: React.FC<Props> = ({
	user,
	totalSeconds,
	onDownloadUser,
}) => {
	return (
		<div className={styles.container}>
			<h2 className={styles.userTitle}>
				<span className={styles.avatar}>{getInitials(user)}</span>
				{user}
			</h2>
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
