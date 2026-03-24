import type React from 'react';
import { useRef, useState } from 'react';
import { useUserDataStore } from '../../../stores/useUserDataStore';
import * as styles from './DayNote.module.css';

type Props = {
	date: string;
};

export const DayNote: React.FC<Props> = ({ date }) => {
	const note = useUserDataStore((s) => s.dayNotes[date] ?? '');
	const setDayNote = useUserDataStore((s) => s.setDayNote);
	const [isEditing, setIsEditing] = useState(false);
	const [draft, setDraft] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	const startEditing = () => {
		setDraft(note);
		setIsEditing(true);
		// Focus after render
		setTimeout(() => inputRef.current?.focus(), 0);
	};

	const save = () => {
		setDayNote(date, draft);
		setIsEditing(false);
	};

	const cancel = () => {
		setDraft(note);
		setIsEditing(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			save();
		} else if (e.key === 'Escape') {
			cancel();
		}
	};

	if (isEditing) {
		return (
			<div className={styles.wrapper}>
				<input
					ref={inputRef}
					type="text"
					className={styles.input}
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onBlur={save}
					onKeyDown={handleKeyDown}
					placeholder="Add a note..."
					maxLength={100}
				/>
				<span className={styles.counter}>{draft.trim().length}/100</span>
				<button type="button" className={styles.action} onMouseDown={cancel}>
					Cancel
				</button>
				{note && (
					<button
						type="button"
						className={styles.action}
						onMouseDown={() => {
							setDraft('');
							setDayNote(date, '');
							setIsEditing(false);
						}}
					>
						Clear
					</button>
				)}
			</div>
		);
	}

	if (note) {
		return (
			<div className={styles.wrapper}>
				<button
					type="button"
					className={styles.noteText}
					onClick={startEditing}
					title="Edit note"
				>
					{note}
				</button>
			</div>
		);
	}

	return (
		<div className={styles.wrapper}>
			<button type="button" className={styles.addLink} onClick={startEditing}>
				+ Add note
			</button>
		</div>
	);
};
