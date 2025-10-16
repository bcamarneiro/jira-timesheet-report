import type React from 'react';
import * as styles from './MonthNavigator.module.css';
import { Button } from './ui/Button';

type Props = {
	label: string;
	onPrev: () => void;
	onNext: () => void;
};

export const MonthNavigator: React.FC<Props> = ({ label, onPrev, onNext }) => {
	return (
		<div className={styles.container}>
			<Button onClick={onPrev} variant="secondary">
				{'←'}
			</Button>
			<div className={styles.label}>{label}</div>
			<Button onClick={onNext} variant="secondary">
				{'→'}
			</Button>
		</div>
	);
};
