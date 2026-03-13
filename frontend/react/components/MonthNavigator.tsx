import type React from 'react';
import * as styles from './MonthNavigator.module.css';

type Props = {
	label: string;
	onPrev: () => void;
	onNext: () => void;
};

export const MonthNavigator: React.FC<Props> = ({ label, onPrev, onNext }) => {
	return (
		<div className={styles.container}>
			<button
				type="button"
				onClick={onPrev}
				className={styles.navButton}
				aria-label="Previous month"
			>
				&#8249;
			</button>
			<div className={styles.label}>{label}</div>
			<button
				type="button"
				onClick={onNext}
				className={styles.navButton}
				aria-label="Next month"
			>
				&#8250;
			</button>
		</div>
	);
};
