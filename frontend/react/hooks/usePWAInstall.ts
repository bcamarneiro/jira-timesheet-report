import { useEffect, useState } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { isInstalledAsApp } from '../utils/pwa';

export function usePWAInstall() {
	const installPromptDismissed = useUIStore(
		(state) => state.installPromptDismissed,
	);
	const dismissInstallPrompt = useUIStore(
		(state) => state.dismissInstallPrompt,
	);
	const resetInstallPrompt = useUIStore((state) => state.resetInstallPrompt);

	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [isInstalled, setIsInstalled] = useState(() => isInstalledAsApp());

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
			event.preventDefault();
			setDeferredPrompt(event);
		};

		const handleInstalled = () => {
			setDeferredPrompt(null);
			setIsInstalled(true);
			resetInstallPrompt();
		};

		const mediaQuery = window.matchMedia?.('(display-mode: standalone)');
		const handleDisplayModeChange = (event: MediaQueryListEvent) => {
			setIsInstalled(event.matches || window.navigator.standalone === true);
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		window.addEventListener('appinstalled', handleInstalled);
		mediaQuery?.addEventListener?.('change', handleDisplayModeChange);

		return () => {
			window.removeEventListener(
				'beforeinstallprompt',
				handleBeforeInstallPrompt,
			);
			window.removeEventListener('appinstalled', handleInstalled);
			mediaQuery?.removeEventListener?.('change', handleDisplayModeChange);
		};
	}, [resetInstallPrompt]);

	const install = async () => {
		if (!deferredPrompt) return false;

		await deferredPrompt.prompt();
		const choice = await deferredPrompt.userChoice;
		setDeferredPrompt(null);

		if (choice.outcome === 'accepted') {
			resetInstallPrompt();
			return true;
		}

		dismissInstallPrompt();
		return false;
	};

	return {
		isInstalled,
		canInstall: !isInstalled && !installPromptDismissed && !!deferredPrompt,
		shouldShowInstallCard: !isInstalled && !installPromptDismissed,
		hasDeferredPrompt: !!deferredPrompt,
		installPromptDismissed,
		install,
		dismissInstallPrompt,
		resetInstallPrompt,
	};
}
