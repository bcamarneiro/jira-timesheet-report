import type React from 'react';
import { formatHours } from '../../utils/format';
import * as styles from './DaySummary.module.css';

type Props = {
	dayTotalSeconds: number;
	missingSeconds: number;
	isWeekend: boolean;
};

export const DaySummary: React.FC<Props> = ({
	dayTotalSeconds,
	missingSeconds,
	isWeekend,
}) => {
	// Don't render anything on days with no activity
	if (dayTotalSeconds === 0 && isWeekend) return null;

	return (
		<div className={styles.container}>
			{dayTotalSeconds > 0 && (
				<div className={styles.total}>{formatHours(dayTotalSeconds)}</div>
			)}
			{missingSeconds > 0 && (
				<span className={styles.missing}>-{formatHours(missingSeconds)}</span>
			)}
		</div>
	);
};
