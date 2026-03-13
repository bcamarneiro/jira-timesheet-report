import type React from 'react';
import type { DaySummary } from '../../../../types/Suggestion';
import { formatHours } from '../../utils/format';
import * as styles from './DayCard.module.css';
import { SuggestionCard } from './SuggestionCard';

type Props = {
	day: DaySummary;
};

const DAY_NAMES = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
];

function formatDate(dateStr: string): string {
	const d = new Date(dateStr);
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const DayCard: React.FC<Props> = ({ day }) => {
	const activeSuggestions = day.suggestions.filter((s) => !s.logged);
	const loggedSuggestions = day.suggestions.filter((s) => s.logged);
	const isToday = day.date === new Date().toISOString().slice(0, 10);

	return (
		<div
			className={`${styles.card} ${isToday ? styles.today : ''} ${day.isWeekend ? styles.weekend : ''}`}
		>
			<div className={styles.header}>
				<div className={styles.dayInfo}>
					<span className={styles.dayName}>{DAY_NAMES[day.dayOfWeek]}</span>
					<span className={styles.dayDate}>{formatDate(day.date)}</span>
					{isToday && <span className={styles.todayBadge}>Today</span>}
				</div>
				<div className={styles.stats}>
					<span className={styles.logged}>
						{formatHours(day.loggedSeconds)}
					</span>
					{day.gapSeconds > 0 && (
						<span className={styles.gap}>-{formatHours(day.gapSeconds)}</span>
					)}
					{day.rescueTimeProductiveHours != null && (
						<span
							className={styles.rescueTime}
							title="RescueTime productive hours"
						>
							RT: {day.rescueTimeProductiveHours.toFixed(1)}h
						</span>
					)}
				</div>
			</div>

			{activeSuggestions.length > 0 && (
				<div className={styles.suggestions}>
					{activeSuggestions.map((s) => (
						<SuggestionCard key={s.id} suggestion={s} />
					))}
				</div>
			)}

			{loggedSuggestions.length > 0 && (
				<div className={styles.suggestions}>
					{loggedSuggestions.map((s) => (
						<SuggestionCard key={s.id} suggestion={s} />
					))}
				</div>
			)}

			{!day.isWeekend &&
				day.gapSeconds > 0 &&
				activeSuggestions.length === 0 && (
					<div className={styles.noSuggestions}>
						No suggestions available for this day
					</div>
				)}
		</div>
	);
};
