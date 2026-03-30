import { logger } from './logger';
import { withBasePath } from './runtimeConfig';

declare global {
	interface BeforeInstallPromptEvent extends Event {
		prompt: () => Promise<void>;
		userChoice: Promise<{
			outcome: 'accepted' | 'dismissed';
			platform: string;
		}>;
	}

	interface WindowEventMap {
		beforeinstallprompt: BeforeInstallPromptEvent;
	}

	interface Navigator {
		standalone?: boolean;
	}
}

const DISPLAY_MODE_QUERY = '(display-mode: standalone)';

export function isInstalledAsApp(): boolean {
	if (typeof window === 'undefined') return false;
	return (
		window.matchMedia?.(DISPLAY_MODE_QUERY).matches === true ||
		window.navigator.standalone === true
	);
}

export async function registerAppServiceWorker(): Promise<void> {
	if (
		typeof window === 'undefined' ||
		!('serviceWorker' in navigator) ||
		process.env.OFFLINE_MODE === 'true'
	) {
		return;
	}

	const register = () => {
		void navigator.serviceWorker
			.register(withBasePath('/service-worker.js'))
			.then((registration) => {
				logger.debug('[PWA] Service worker registered:', registration.scope);
			})
			.catch((error) => {
				logger.error('[PWA] Service worker registration failed:', error);
			});
	};

	if (document.readyState === 'complete') {
		register();
		return;
	}

	window.addEventListener('load', register, { once: true });
}
