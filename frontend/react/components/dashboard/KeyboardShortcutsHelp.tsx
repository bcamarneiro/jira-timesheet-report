import type React from 'react';
import { Modal } from '../ui/Modal';
import * as styles from './KeyboardShortcutsHelp.module.css';

type Props = {
	isOpen: boolean;
	onClose: () => void;
};

const SHORTCUTS = [
	{ keys: ['\u2190', '\u2192'], description: 'Navigate between days' },
	{ keys: ['\u2191', '\u2193'], description: 'Navigate between suggestions' },
	{ keys: ['Enter'], description: 'Log the focused suggestion' },
	{ keys: ['Esc'], description: 'Dismiss the focused suggestion' },
	{ keys: ['a'], description: 'Log all suggestions for focused day' },
	{ keys: ['f'], description: 'Fill day (auto-distribute) for focused day' },
	{ keys: ['?'], description: 'Toggle this help' },
];

export const KeyboardShortcutsHelp: React.FC<Props> = ({ isOpen, onClose }) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
			<table className={styles.table}>
				<thead>
					<tr>
						<th>Shortcut</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{SHORTCUTS.map((shortcut) => (
						<tr key={shortcut.description}>
							<td>
								{shortcut.keys.map((key, i) => (
									<span key={key}>
										{i > 0 && ' / '}
										<kbd className={styles.kbd}>{key}</kbd>
									</span>
								))}
							</td>
							<td>{shortcut.description}</td>
						</tr>
					))}
				</tbody>
			</table>
			<p className={styles.hint}>
				Shortcuts are disabled when typing in form fields.
			</p>
		</Modal>
	);
};
