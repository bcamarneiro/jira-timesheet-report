import { createRoot } from 'react-dom/client';
import { App } from './react/App';
import { useConfigStore } from './stores/useConfigStore';

// Start MSW only in offline mode
async function startApp() {
	if (process.env.OFFLINE_MODE === 'true') {
		try {
			const { worker } = await import('./mocks/browser');
			await worker.start({
				onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
				serviceWorker: {
					url: '/mockServiceWorker.js',
				},
			});
			console.log('[OFFLINE MODE] MSW started successfully');

			// Set up default configuration for offline mode
			const { setConfig } = useConfigStore.getState();
			setConfig({
				jiraHost: 'mock.atlassian.net',
				email: 'dev@example.com',
				apiToken: 'mock-token',
				corsProxy: '',
				allowedUsers: '', // No filtering in offline mode
				jqlFilter: '',
			});
			console.log('[OFFLINE MODE] Default configuration set');

			// Set the current month to October 2025 for testing
			const { useTimesheetStore } = await import('./stores/useTimesheetStore');
			useTimesheetStore.getState().setCurrentMonth(2025, 9); // October (0-indexed)
			console.log('[OFFLINE MODE] Set to October 2025 for testing');
		} catch (error) {
			console.error('[OFFLINE MODE] Failed to start MSW:', error);
		}
	}

	const container = document.getElementById('root');
	if (container) {
		const root = createRoot(container);
		root.render(<App />);
	}
}

startApp();
