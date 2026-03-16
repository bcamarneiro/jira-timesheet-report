import type React from 'react';
import { useState } from 'react';
import { useUserDataStore } from '../../../stores/useUserDataStore';
import * as styles from './CommentPresets.module.css';

type Props = {
	onSelect: (text: string) => void;
};

export const CommentPresets: React.FC<Props> = ({ onSelect }) => {
	const presets = useUserDataStore((s) => s.commentPresets);
	const addPreset = useUserDataStore((s) => s.addCommentPreset);
	const removePreset = useUserDataStore((s) => s.removeCommentPreset);
	const [newPreset, setNewPreset] = useState('');

	const handleAdd = () => {
		const trimmed = newPreset.trim();
		if (trimmed) {
			addPreset(trimmed);
			setNewPreset('');
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleAdd();
		}
	};

	const handleRemove = (e: React.MouseEvent, preset: string) => {
		e.stopPropagation();
		removePreset(preset);
	};

	return (
		<div className={styles.container}>
			<span className={styles.label}>Comment presets</span>
			{presets.length > 0 && (
				<div className={styles.presets}>
					{presets.map((preset) => (
						<button
							key={preset}
							type="button"
							className={styles.presetButton}
							onClick={() => onSelect(preset)}
						>
							{preset}
							<button
								type="button"
								className={styles.removeButton}
								onClick={(e) => handleRemove(e, preset)}
								aria-label={`Remove preset: ${preset}`}
							>
								&times;
							</button>
						</button>
					))}
				</div>
			)}
			<div className={styles.addForm}>
				<input
					type="text"
					className={styles.addInput}
					value={newPreset}
					onChange={(e) => setNewPreset(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Add a comment preset..."
				/>
				<button
					type="button"
					className={styles.addButton}
					onClick={handleAdd}
					disabled={!newPreset.trim()}
				>
					Add
				</button>
			</div>
		</div>
	);
};
