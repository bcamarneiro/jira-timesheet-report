import type React from 'react';
import * as styles from './Button.module.css';

type Props = {
	children: React.ReactNode;
	onClick?: () => void;
	type?: 'button' | 'submit' | 'reset';
	variant?: 'primary' | 'secondary' | 'danger';
	className?: string;
	disabled?: boolean;
};

export const Button: React.FC<Props> = ({
	children,
	onClick,
	type = 'button',
	variant = 'primary',
	className = '',
	disabled = false,
}) => {
	const variantClass =
		variant === 'secondary'
			? styles.secondary
			: variant === 'danger'
				? styles.danger
				: styles.primary;

	return (
		<button
			type={type}
			onClick={onClick}
			className={`${styles.button} ${variantClass} ${className}`}
			disabled={disabled}
		>
			{children}
		</button>
	);
};
