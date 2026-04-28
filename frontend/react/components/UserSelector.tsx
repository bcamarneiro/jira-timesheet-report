import type React from 'react';
import { useId } from 'react';
import * as styles from './UserSelector.module.css';

type Props = {
	users: string[];
	value: string;
	onChange: (value: string) => void;
	label?: string;
};

export const UserSelector: React.FC<Props> = ({
	users,
	value,
	onChange,
	label,
}) => {
	const id = useId();

	return (
		<label className={styles.wrapper} htmlFor={id}>
			{label ? <span className={styles.label}>{label}</span> : null}
			<select
				id={id}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={styles.select}
				aria-label={label || 'Filter by user'}
			>
				<option value="">All users ({users.length})</option>
				{users.map((u) => (
					<option key={u} value={u}>
						{u}
					</option>
				))}
			</select>
		</label>
	);
};
