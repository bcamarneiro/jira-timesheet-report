import React from 'react';

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
		cells.push(
			<div
				key={`empty-${i}`}
				style={{
					border: '1px solid #eee',
					minHeight: 100,
					padding: '0.5em',
					background: '#fafafa',
				}}
			/>,
		);
	}

	// Add the actual day cells (children)
	cells.push(...React.Children.toArray(children));

	return (
		<div style={{ position: 'relative' }}>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(7, 1fr)',
					gap: 6,
					marginBottom: '0.5em',
				}}
			>
				{weekdayLabels.map((w) => (
					<div key={w} style={{ textAlign: 'center', fontWeight: 'bold' }}>
						{w}
					</div>
				))}
			</div>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(7, 1fr)',
					gap: 6,
				}}
			>
				{cells}
			</div>
		</div>
	);
};
