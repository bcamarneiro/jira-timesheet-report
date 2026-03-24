import { parseIsoDateLocal } from '../../utils/date';
import type React from 'react';
import * as styles from './WeekNavigator.module.css';

type Props = {
	weekStart: string;
	weekEnd: string;
	onPrev: () => void;
	onNext: () => void;
	onToday: () => void;
};

function formatWeekLabel(start: string, end: string): string {
	const s = parseIsoDateLocal(start);
	const e = parseIsoDateLocal(end);
	const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
	const startStr = s.toLocaleDateString('en-US', opts);
	const endStr = e.toLocaleDateString('en-US', {
		...opts,
		year: 'numeric',
	});
	return `${startStr} - ${endStr}`;
}

export const WeekNavigator: React.FC<Props> = ({
	weekStart,
	weekEnd,
	onPrev,
	onNext,
	onToday,
}) => {
	return (
		<div className={styles.container}>
			<button
				type="button"
				className={styles.navButton}
				onClick={onPrev}
				title="Previous week"
				aria-label="Previous week"
			>
				&#8249;
			</button>
			<span className={styles.label}>
				{formatWeekLabel(weekStart, weekEnd)}
			</span>
			<button
				type="button"
				className={styles.navButton}
				onClick={onNext}
				title="Next week"
				aria-label="Next week"
			>
				&#8250;
			</button>
			<button type="button" className={styles.todayButton} onClick={onToday}>
				Today
			</button>
		</div>
	);
};
