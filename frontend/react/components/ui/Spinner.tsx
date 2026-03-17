import type React from 'react';
import * as styles from './Spinner.module.css';

const sizeMap = {
	sm: styles.sm,
	md: styles.md,
	lg: styles.lg,
} as const;

type Props = {
	size?: 'sm' | 'md' | 'lg';
	className?: string;
};

export const Spinner: React.FC<Props> = ({ size = 'md', className }) => {
	const sizeClass = sizeMap[size];
	return (
		<div
			className={`${styles.spinner} ${sizeClass}${className ? ` ${className}` : ''}`}
		/>
	);
};
