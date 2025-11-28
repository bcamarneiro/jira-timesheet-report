import type React from 'react';
import * as styles from './Button.module.css';

type Props = {
	children: React.ReactNode;
	onClick?: () => void;
	type?: 'button' | 'submit' | 'reset';
	variant?: 'primary' | 'secondary';
	style?: React.CSSProperties;
	className?: string;
	disabled?: boolean;
};

export const Button: React.FC<Props> = ({
	children,
	onClick,
	type = 'button',
	variant = 'primary',
	style = {},
	className = '',
	disabled = false,
}) => {
	const baseStyle: React.CSSProperties = {
		padding: '0.5em 1em',
		border: '1px solid #ccc',
		borderRadius: '4px',
		cursor: 'pointer',
		fontSize: '14px',
		fontWeight: '500',
		...style,
	};

	return (
		<button
			type={type}
			onClick={onClick}
			className={`${styles.button} ${variant === 'primary' ? styles.primary : styles.secondary} ${className}`}
			style={baseStyle}
			disabled={disabled}
		>
			{children}
		</button>
	);
};
