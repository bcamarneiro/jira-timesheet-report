import { createRoot } from 'react-dom/client';
import { App } from './react/App';

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
			console.log('MSW started successfully');
		} catch (error) {
			console.error('Failed to start MSW:', error);
		}
	}

	const container = document.getElementById('root');
	if (container) {
		const root = createRoot(container);
		root.render(<App />);
	}
}

startApp();
