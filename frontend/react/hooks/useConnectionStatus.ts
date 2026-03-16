import { useEffect, useState } from 'react';
import { useDashboardStore } from '../../stores/useDashboardStore';

interface ConnectionStatus {
	isOnline: boolean;
	lastFetchedAt: Date | null;
}

export function useConnectionStatus(): ConnectionStatus {
	const [isOnline, setIsOnline] = useState(navigator.onLine);
	const lastFetchedAtStr = useDashboardStore((s) => s.lastFetchedAt);

	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	const lastFetchedAt = lastFetchedAtStr ? new Date(lastFetchedAtStr) : null;

	return { isOnline, lastFetchedAt };
}
