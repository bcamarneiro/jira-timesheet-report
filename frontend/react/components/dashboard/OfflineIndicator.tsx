import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import * as styles from './OfflineIndicator.module.css';

export const OfflineIndicator: React.FC = () => {
	const { isOnline, lastFetchedAt } = useConnectionStatus();
	const [dismissed, setDismissed] = useState(false);
	const [showBackOnline, setShowBackOnline] = useState(false);
	const wasOffline = useRef(false);

	// Track when we come back online after being offline
	useEffect(() => {
		if (!isOnline) {
			wasOffline.current = true;
			setDismissed(false);
			setShowBackOnline(false);
		} else if (wasOffline.current) {
			wasOffline.current = false;
			setShowBackOnline(true);
			const timer = setTimeout(() => {
				setShowBackOnline(false);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [isOnline]);

	if (showBackOnline) {
		return (
			<div
				className={`${styles.banner} ${styles.backOnline}`}
				aria-live="polite"
			>
				<span className={styles.message}>Back online!</span>
			</div>
		);
	}

	if (isOnline || dismissed) {
		return null;
	}

	const formattedTime = lastFetchedAt
		? lastFetchedAt.toLocaleTimeString(undefined, {
				hour: '2-digit',
				minute: '2-digit',
			})
		: null;

	return (
		<div className={`${styles.banner} ${styles.offline}`} aria-live="polite">
			<span className={styles.message}>
				You're offline.
				{formattedTime && (
					<>
						{' '}
						Last updated:{' '}
						<span className={styles.timestamp}>{formattedTime}</span>
					</>
				)}
			</span>
			<button
				type="button"
				className={styles.dismissButton}
				onClick={() => setDismissed(true)}
				aria-label="Dismiss offline indicator"
			>
				&times;
			</button>
		</div>
	);
};
