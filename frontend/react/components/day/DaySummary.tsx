import type React from 'react';
import type { AbsenceKind } from '../../../../types/absence';
import { getAbsenceKindLabel } from '../../utils/absence';
import { formatHours } from '../../utils/format';
import * as styles from './DaySummary.module.css';

type Props = {
	dayTotalSeconds: number;
	missingSeconds: number;
	isWeekend: boolean;
	isAbsent?: boolean;
	absenceKind?: AbsenceKind;
};

export const DaySummary: React.FC<Props> = ({
	dayTotalSeconds,
	missingSeconds,
	isWeekend,
	isAbsent = false,
	absenceKind,
}) => {
	// Don't render anything on days with no activity
	if (dayTotalSeconds === 0 && isWeekend) return null;

	return (
		<div className={styles.container}>
			{dayTotalSeconds > 0 && (
				<div className={styles.total}>{formatHours(dayTotalSeconds)}</div>
			)}
			{isAbsent && (
				<span className={styles.absence}>
					{getAbsenceKindLabel(absenceKind)}
				</span>
			)}
			{missingSeconds > 0 && (
				<span className={styles.missing}>-{formatHours(missingSeconds)}</span>
			)}
		</div>
	);
};
