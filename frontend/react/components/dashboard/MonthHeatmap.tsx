import type React from 'react';
import { monthLabel } from '../../utils/date';
import { formatHours } from '../../utils/format';
import * as styles from './MonthHeatmap.module.css';

type Props = {
	monthData: Map<string, number>;
	month: number;
	year: number;
	vacationDates?: Set<string>;
};

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const cellLevelMap: Record<string, string> = {
	placeholder: styles.cellPlaceholder,
	empty: styles.cellEmpty,
	level1: styles.cellLevel1,
	level2: styles.cellLevel2,
	level3: styles.cellLevel3,
	level4: styles.cellLevel4,
	vacation: styles.cellVacation,
};

const legendLevelMap: Record<string, string> = {
	empty: styles.legendCellEmpty,
	level1: styles.legendCellLevel1,
	level2: styles.legendCellLevel2,
	level3: styles.legendCellLevel3,
	level4: styles.legendCellLevel4,
};

function getLevel(seconds: number): string {
	const hours = seconds / 3600;
	if (hours <= 0) return 'empty';
	if (hours < 4) return 'level1';
	if (hours < 7) return 'level2';
	if (hours <= 8) return 'level3';
	return 'level4';
}

function isWeekend(dayOfWeek: number): boolean {
	// dayOfWeek: 0 = Sunday, 6 = Saturday
	return dayOfWeek === 0 || dayOfWeek === 6;
}

export const MonthHeatmap: React.FC<Props> = ({
	monthData,
	month,
	year,
	vacationDates,
}) => {
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	// Build cells with leading placeholders for alignment
	// We want Monday-first grid, so compute offset
	const firstDay = new Date(year, month, 1).getDay();
	// Convert Sunday=0 to Monday-first: Mon=0, Tue=1, ..., Sun=6
	const offset = firstDay === 0 ? 6 : firstDay - 1;

	const cells: Array<{
		day: number;
		dateStr: string;
		seconds: number;
		isPlaceholder: boolean;
		isWeekend: boolean;
	}> = [];

	// Add placeholder cells for days before the 1st
	// Use negative day numbers to ensure unique keys
	for (let i = 0; i < offset; i++) {
		cells.push({
			day: -(i + 1),
			dateStr: `placeholder-${i}`,
			seconds: 0,
			isPlaceholder: true,
			isWeekend: false,
		});
	}

	// Add actual day cells
	for (let d = 1; d <= daysInMonth; d++) {
		const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
		const dateObj = new Date(year, month, d);
		const dayOfWeek = dateObj.getDay();
		const seconds = monthData.get(dateStr) ?? 0;

		cells.push({
			day: d,
			dateStr,
			seconds,
			isPlaceholder: false,
			isWeekend: isWeekend(dayOfWeek),
		});
	}

	const legendLevels = ['empty', 'level1', 'level2', 'level3', 'level4'];
	const showVacationLegend = vacationDates && vacationDates.size > 0;
	const totalLoggedSeconds = [...monthData.values()].reduce(
		(sum, seconds) => sum + seconds,
		0,
	);
	const loggedDaysCount = [...monthData.values()].filter(
		(seconds) => seconds > 0,
	).length;

	return (
		<div className={styles.container}>
			<div className={styles.header}>{monthLabel(year, month)}</div>
			<div className={styles.summary}>
				<span>{formatHours(totalLoggedSeconds)} logged</span>
				<span>{loggedDaysCount} active days</span>
			</div>

			<div className={styles.dayLabels}>
				{DAY_HEADERS.map((label) => (
					<div key={label} className={styles.dayLabel}>
						{label}
					</div>
				))}
			</div>

			<ul
				className={styles.grid}
				aria-label={`Month heatmap for ${monthLabel(year, month)}`}
			>
				{cells.map((cell) => {
					if (cell.isPlaceholder) {
						const placeholderClass = cellLevelMap.placeholder;
						return (
							<li
								key={cell.dateStr}
								className={`${styles.cell} ${placeholderClass}`}
								aria-hidden="true"
							/>
						);
					}

					const isVacation = vacationDates?.has(cell.dateStr);
					const level = isVacation ? 'vacation' : getLevel(cell.seconds);
					const levelClass = cellLevelMap[level] ?? cellLevelMap.empty;
					const weekendClass = cell.isWeekend ? styles.cellWeekend : '';
					const hours = cell.seconds / 3600;
					const title = isVacation
						? `${cell.dateStr}: vacation/absence`
						: hours > 0
							? `${cell.dateStr}: ${formatHours(cell.seconds)}`
							: `${cell.dateStr}: no time logged`;

					return (
						<li
							key={cell.dateStr}
							className={`${styles.cell} ${levelClass} ${weekendClass}`}
							title={title}
							aria-label={title}
						>
							{cell.day}
						</li>
					);
				})}
			</ul>

			<div className={styles.footer}>
				{showVacationLegend && (
					<>
						<div
							className={`${styles.legendCell} ${styles.legendCellVacation}`}
						/>
						<span className={styles.legendLabel}>Vacation</span>
					</>
				)}
				<span className={styles.legendLabel}>Less</span>
				<div className={styles.legendCells}>
					{legendLevels.map((level) => {
						const cls = legendLevelMap[level] ?? legendLevelMap.empty;
						return (
							<div key={level} className={`${styles.legendCell} ${cls}`} />
						);
					})}
				</div>
				<span className={styles.legendLabel}>More</span>
			</div>
		</div>
	);
};
