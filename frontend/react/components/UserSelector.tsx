import type React from "react";
import { useId } from "react";
import styles from "./UserSelector.module.css";

type Props = {
	users: string[];
	value: string;
	onChange: (value: string) => void;
};

export const UserSelector: React.FC<Props> = ({ users, value, onChange }) => {
	const id = useId();

	return (
		<div className={styles.container}>
			<label htmlFor={id}>Select User:</label>
			<input
				id={id}
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Enter user name"
				list={id}
			/>
			<datalist id={id}>
				{users.map((u) => (
					<option key={u} value={u} />
				))}
			</datalist>
		</div>
	);
};
