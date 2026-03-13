import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import * as styles from './Toast.module.css';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
	id: number;
	message: string;
	type: ToastType;
}

let toastId = 0;
let addToastFn: ((message: string, type: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = 'info') {
	addToastFn?.(message, type);
}

toast.success = (message: string) => toast(message, 'success');
toast.error = (message: string) => toast(message, 'error');
toast.info = (message: string) => toast(message, 'info');

export const ToastContainer: React.FC = () => {
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	useEffect(() => {
		addToastFn = (message: string, type: ToastType) => {
			const id = ++toastId;
			setToasts((prev) => [...prev, { id, message, type }]);
			setTimeout(() => {
				setToasts((prev) => prev.filter((t) => t.id !== id));
			}, 3500);
		};
		return () => {
			addToastFn = null;
		};
	}, []);

	if (toasts.length === 0) return null;

	return createPortal(
		<div className={styles.container}>
			{toasts.map((t) => (
				<div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
					<span className={styles.icon}>
						{t.type === 'success' && '\u2713'}
						{t.type === 'error' && '\u2717'}
						{t.type === 'info' && '\u2139'}
					</span>
					<span className={styles.message}>{t.message}</span>
					<button
						type="button"
						className={styles.dismiss}
						onClick={() =>
							setToasts((prev) => prev.filter((x) => x.id !== t.id))
						}
					>
						\u00d7
					</button>
				</div>
			))}
		</div>,
		document.body,
	);
};
