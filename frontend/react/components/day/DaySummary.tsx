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
	backdatedSeconds?: number;
};

export const DaySummary: React.FC<Props> = ({
	dayTotalSeconds,
	missingSeconds,
	isWeekend,
	isAbsent = false,
	absenceKind,
	backdatedSeconds = 0,
}) => {
	if (dayTotalSeconds === 0 && backdatedSeconds === 0 && isWeekend) return null;

	return (
		<div className={styles.container}>
			{dayTotalSeconds > 0 && (
				<div className={styles.total}>{formatHours(dayTotalSeconds)}</div>
			)}
			{isAbsent && (
				<span className={styles.absence}>
					{getAbsenceKindLabel(absenceKind)}
					{dayTotalSeconds > 0 && (
						<span
							className={styles.workedOnPto}
							title="You logged work on a day marked as time off — confirm whether this is intentional."
						>
							{' '}
							⚠ worked
						</span>
					)}
				</span>
			)}
			{backdatedSeconds > 0 && (
				<span
					className={styles.backdated}
					title="Backdated submissions — not counted toward this day's total"
				>
					+{formatHours(backdatedSeconds)} backdated
				</span>
			)}
			{missingSeconds > 0 && (
				<span className={styles.missing}>-{formatHours(missingSeconds)}</span>
			)}
		</div>
	);
};
