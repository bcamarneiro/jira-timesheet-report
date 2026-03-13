import type React from 'react';
import { Button } from './Button';
import * as styles from './ConfirmDialog.module.css';
import { Modal } from './Modal';

type Props = {
	isOpen: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
};

export const ConfirmDialog: React.FC<Props> = ({
	isOpen,
	title,
	message,
	confirmLabel = 'Delete',
	onConfirm,
	onCancel,
}) => {
	return (
		<Modal isOpen={isOpen} onClose={onCancel} title={title}>
			<div className={styles.content}>
				<p className={styles.message}>{message}</p>
				<div className={styles.actions}>
					<Button variant="secondary" onClick={onCancel}>
						Cancel
					</Button>
					<Button variant="danger" onClick={onConfirm}>
						{confirmLabel}
					</Button>
				</div>
			</div>
		</Modal>
	);
};
