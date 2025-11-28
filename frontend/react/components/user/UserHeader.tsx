import type React from 'react';
import { Button } from '../ui/Button';
import * as styles from './UserHeader.module.css';

type Props = {
	user: string;
	totalSeconds: number;
	onDownloadUser: (user: string) => void;
};

export const UserHeader: React.FC<Props> = ({
	user,
	totalSeconds,
	onDownloadUser,
}) => {
	return (
		<div className={styles.container}>
			<h2 className={styles.userTitle}>{user}</h2>
			{totalSeconds > 0 && (
				<div className={styles.actions}>
					<Button onClick={() => onDownloadUser(user)}>Download CSV</Button>
				</div>
			)}
		</div>
	);
};
