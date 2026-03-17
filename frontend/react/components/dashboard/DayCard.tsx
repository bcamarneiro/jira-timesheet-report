import { memo, useState } from 'react';
import type { DaySummary } from '../../../../types/Suggestion';
import { useDashboardStore } from '../../../stores/useDashboardStore';
import { useWorklogOperations } from '../../hooks/useWorklogOperations';
import { formatHours } from '../../utils/format';
import { toast } from '../ui/Toast';
import * as styles from './DayCard.module.css';
import { DayNote } from './DayNote';
import { SuggestionCard } from './SuggestionCard';

type Props = {
	day: DaySummary;
	isFocused?: boolean;
	focusedSuggestionIndex?: number;
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

function formatActivityTime(seconds: number): string {
	const h = seconds / 3600;
	if (h >= 1) return `${h.toFixed(1)}h`;
	return `${Math.round(seconds / 60)}m`;
}

export const DayCard = memo<Props>(function DayCard({
	day,
	isFocused,
	focusedSuggestionIndex,
}) {
	const fillDayGap = useDashboardStore((s) => s.fillDayGap);
	const markMultipleSuggestionsLogged = useDashboardStore(
		(s) => s.markMultipleSuggestionsLogged,
	);
	const unmarkMultipleSuggestionsLogged = useDashboardStore(
		(s) => s.unmarkMultipleSuggestionsLogged,
	);
	const { createMultipleWorklogs, deleteWorklog } = useWorklogOperations();
	const [isBatchLogging, setIsBatchLogging] = useState(false);
	const activeSuggestions = day.suggestions.filter((s) => !s.logged);
	const loggedSuggestions = day.suggestions.filter((s) => s.logged);
	const isToday = day.date === new Date().toISOString().slice(0, 10);
	const rt = day.rescueTime;
	const showFillButton = day.gapSeconds > 0 && activeSuggestions.length > 0;

	const handleLogAll = async () => {
		setIsBatchLogging(true);
		try {
			const params = activeSuggestions.map((s) => ({
				issueKey: s.issueKey,
				timeSpent: s.suggestedTimeSpent,
				comment: '',
				started: `${s.date}T09:00`,
			}));

			const result = await createMultipleWorklogs(params);

			// Mark successful suggestions as logged
			const failedKeys = new Set(result.failed);
			const successIds = activeSuggestions
				.filter((s) => !failedKeys.has(s.issueKey))
				.map((s) => s.id);

			if (successIds.length > 0) {
				markMultipleSuggestionsLogged(successIds);
			}

			if (result.failed.length === 0) {
				toast.success(
					`Logged all ${result.success} worklogs for ${DAY_NAMES[day.dayOfWeek]}`,
					{
						action: {
							label: 'Undo',
							onClick: () => {
								Promise.all(
									result.created.map((w) =>
										deleteWorklog(w.issueKey, w.worklogId),
									),
								).then(() => {
									unmarkMultipleSuggestionsLogged(successIds);
								});
							},
						},
					},
				);
			} else {
				toast.error(
					`Logged ${result.success} of ${params.length}: failed ${result.failed.join(', ')}`,
				);
			}
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Batch log failed');
		} finally {
			setIsBatchLogging(false);
		}
	};

	return (
		<div
			className={`${styles.card} ${isToday ? styles.today : ''} ${day.isWeekend ? styles.weekend : ''} ${isFocused ? styles.focused : ''}`}
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
					{rt && (
						<span
							className={styles.rescueTime}
							title="RescueTime productive hours"
						>
							RT: {(rt.productiveSeconds / 3600).toFixed(1)}h
						</span>
					)}
					{showFillButton && (
						<button
							type="button"
							className={styles.fillButton}
							onClick={() => fillDayGap(day.date)}
						>
							Fill day
						</button>
					)}
					{activeSuggestions.length > 0 && (
						<button
							type="button"
							className={styles.logAllButton}
							onClick={handleLogAll}
							disabled={isBatchLogging}
						>
							{isBatchLogging ? 'Logging...' : 'Log All'}
						</button>
					)}
				</div>
			</div>

			<DayNote date={day.date} />

			{rt && rt.topActivities.length > 0 && (
				<div className={styles.activities}>
					{rt.topActivities.map((a, i) => (
						<span
							key={`${a.name}-${i}`}
							className={styles.activityPill}
							title={`${a.category} — ${formatActivityTime(a.seconds)}`}
						>
							{a.name}{' '}
							<span className={styles.activityTime}>
								{formatActivityTime(a.seconds)}
							</span>
						</span>
					))}
				</div>
			)}

			{activeSuggestions.length > 0 && (
				<div className={styles.suggestions}>
					{activeSuggestions.map((s, i) => (
						<SuggestionCard
							key={s.id}
							suggestion={s}
							isFocused={isFocused && focusedSuggestionIndex === i}
						/>
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
});
