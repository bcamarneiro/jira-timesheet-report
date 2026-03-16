import type React from 'react';
import * as styles from './ProgressBar.module.css';

type Props = {
	value: number;
	height?: number;
};

const fillStyleMap = {
	green: styles.fillGreen,
	yellow: styles.fillYellow,
	red: styles.fillRed,
} as const;

function getFillClass(value: number): string {
	if (value >= 75) return fillStyleMap.green;
	if (value >= 40) return fillStyleMap.yellow;
	return fillStyleMap.red;
}

export const ProgressBar: React.FC<Props> = ({ value, height = 6 }) => {
	const clamped = Math.min(100, Math.max(0, value));

	return (
		<div className={styles.track} style={{ height }}>
			<div
				className={`${styles.fill} ${getFillClass(clamped)}`}
				style={{ width: `${clamped}%`, height }}
			/>
		</div>
	);
};
