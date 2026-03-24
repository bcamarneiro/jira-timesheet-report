import { memo } from 'react';
import type { DaySummary } from '../../../../types/Suggestion';
import { parseIsoDateLocal, toLocalDateString } from '../../utils/date';
import { formatHours } from '../../utils/format';
import * as styles from './WeekOverview.module.css';

type Props = {
	days: DaySummary[];
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDayStatus(day: DaySummary): string {
	if (day.isWeekend) return styles.weekend;
	if (day.loggedSeconds >= day.targetSeconds) return styles.complete;
	if (day.loggedSeconds > 0) return styles.partial;
	return styles.empty;
}

export const WeekOverview = memo<Props>(function WeekOverview({ days }) {
	const totalLogged = days.reduce((sum, d) => sum + d.loggedSeconds, 0);
	const totalTarget = days.reduce((sum, d) => sum + d.targetSeconds, 0);
	const todayStr = toLocalDateString(new Date());
	const totalPct =
		totalTarget > 0 ? Math.round((totalLogged / totalTarget) * 100) : 0;

	return (
		<div className={styles.container}>
			<div className={styles.summary}>
				<strong>Week progress</strong>
				<span>
					{formatHours(totalLogged)} logged against {formatHours(totalTarget)}{' '}
					target
				</span>
			</div>
			<ul className={styles.grid} aria-label="Weekly worklog overview">
				{days.map((day) => {
					const pct =
						day.targetSeconds > 0
							? Math.min(100, (day.loggedSeconds / day.targetSeconds) * 100)
							: 0;
					const isToday = day.date === todayStr;
					const status = day.isWeekend
						? 'weekend'
						: day.loggedSeconds >= day.targetSeconds
							? 'complete'
							: day.loggedSeconds > 0
								? 'partially logged'
								: 'empty';
					return (
						<li
							key={day.date}
							className={`${styles.day} ${getDayStatus(day)} ${isToday ? styles.today : ''}`}
							title={`${DAY_NAMES[day.dayOfWeek]} ${day.date}: ${day.loggedSeconds > 0 ? formatHours(day.loggedSeconds) : day.isWeekend ? 'weekend' : '0h logged'}`}
							aria-label={`${DAY_NAMES[day.dayOfWeek]} ${day.date}, ${status}, ${day.loggedSeconds > 0 ? formatHours(day.loggedSeconds) : day.isWeekend ? 'weekend' : '0 hours logged'}`}
						>
							<div className={styles.dayName}>{DAY_NAMES[day.dayOfWeek]}</div>
							<div className={styles.dayDate}>
								{parseIsoDateLocal(day.date).getDate()}
							</div>
							<div className={styles.barTrack}>
								<div className={styles.barFill} style={{ height: `${pct}%` }} />
							</div>
							<div className={styles.dayHours}>
								{day.loggedSeconds > 0
									? formatHours(day.loggedSeconds)
									: day.isWeekend
										? ''
										: '0h'}
							</div>
						</li>
					);
				})}
			</ul>
			<div className={styles.totals}>
				<span>
					{formatHours(totalLogged)} / {formatHours(totalTarget)}
				</span>
				{totalTarget > 0 && <span className={styles.pct}>{totalPct}%</span>}
			</div>
		</div>
	);
});
