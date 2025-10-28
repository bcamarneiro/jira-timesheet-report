import type React from 'react';
import { useId } from 'react';
import * as styles from './UserSelector.module.css';

type Props = {
	users: string[];
	value: string;
	onChange: (value: string) => void;
};

export const UserSelector: React.FC<Props> = ({ users, value, onChange }) => {
	const id = useId();

	return (
		<div className={styles.container}>
			<label htmlFor={id}>Filter by User:</label>
			<select
				id={id}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={styles.select}
			>
				<option value="">All Users ({users.length})</option>
				{users.map((u) => (
					<option key={u} value={u}>
						{u}
					</option>
				))}
			</select>
		</div>
	);
};
