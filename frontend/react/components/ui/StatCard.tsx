import type React from 'react';
import * as styles from './StatCard.module.css';

type Props = {
	label: string;
	value: string | number;
	valueColor?: string;
};

export const StatCard: React.FC<Props> = ({ label, value, valueColor }) => {
	return (
		<div className={styles.card}>
			<div className={styles.label}>{label}</div>
			<div className={styles.value} style={valueColor ? { color: valueColor } : undefined}>
				{value}
			</div>
		</div>
	);
};
