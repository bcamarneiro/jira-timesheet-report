import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './react/App';

// Start MSW in development mode for offline development
async function startApp() {
  if (process.env.NODE_ENV === 'development') {
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


