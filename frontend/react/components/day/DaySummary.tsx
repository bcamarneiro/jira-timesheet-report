import type React from 'react';
import { formatHours } from '../../utils/format';
import * as styles from './DaySummary.module.css';

type Props = {
	dayTotalSeconds: number;
	timeOffHours: number;
	missingSeconds: number;
	isWeekend: boolean;
};

export const DaySummary: React.FC<Props> = ({
	dayTotalSeconds,
	timeOffHours,
	missingSeconds,
	isWeekend,
}) => {
	return (
		<div className={styles.container}>
			<div className={styles.total}>Total: {formatHours(dayTotalSeconds)}</div>
			<div className={styles.timeOffContainer}>
				{!isWeekend && timeOffHours > 0 && (
					<span title="Time off hours">TO: {timeOffHours}h</span>
				)}
				{missingSeconds > 0 && (
					<div className={styles.missing}>
						{formatHours(missingSeconds)} missing
					</div>
				)}
			</div>
		</div>
	);
};
