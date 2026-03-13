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
		<select
			id={id}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className={styles.select}
			aria-label="Filter by user"
		>
			<option value="">All Users ({users.length})</option>
			{users.map((u) => (
				<option key={u} value={u}>
					{u}
				</option>
			))}
		</select>
	);
};
