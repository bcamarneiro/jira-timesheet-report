import React from 'react';
import * as styles from './CalendarGrid.module.css';

type Props = {
	firstWeekday: number;
	weekdayLabels: string[];
	children: React.ReactNode;
};

export const CalendarGrid: React.FC<Props> = ({
	firstWeekday,
	weekdayLabels,
	children,
}) => {
	const cells: React.ReactNode[] = [];

	// Add empty cells for days before the first day of the month
	for (let i = 0; i < firstWeekday; i++) {
		cells.push(<div key={`empty-${i}`} className={styles.emptyCell} />);
	}

	// Add the actual day cells (children)
	cells.push(...React.Children.toArray(children));

	return (
		<div className={styles.container}>
			<div className={styles.weekdayHeader}>
				{weekdayLabels.map((w) => (
					<div key={w} className={styles.weekdayLabel}>
						{w}
					</div>
				))}
			</div>
			<div className={styles.grid}>{cells}</div>
		</div>
	);
};
