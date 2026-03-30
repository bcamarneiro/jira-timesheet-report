import type React from 'react';
import { Suspense, lazy } from 'react';
import {
	BrowserRouter,
	HashRouter,
	Navigate,
	Route,
	Routes,
} from 'react-router-dom';
import * as styles from './App.module.css';

import { Navigation } from './components/Navigation';
import { Spinner } from './components/ui/Spinner';
import { ToastContainer } from './components/ui/Toast';
import { useTheme } from './hooks/useTheme';
import { appBasePath, isHashRouterMode } from './utils/runtimeConfig';

const HomePage = lazy(() =>
	import('./pages/HomePage').then((module) => ({
		default: module.HomePage,
	})),
);
const DashboardPage = lazy(() =>
	import('./pages/DashboardPage').then((module) => ({
		default: module.DashboardPage,
	})),
);
const TimesheetPage = lazy(() =>
	import('./pages/TimesheetPage').then((module) => ({
		default: module.TimesheetPage,
	})),
);
const SettingsPage = lazy(() =>
	import('./pages/SettingsPage').then((module) => ({
		default: module.SettingsPage,
	})),
);

export const App: React.FC = () => {
	useTheme();

	const appShell = (
		<div className={styles.appContainer}>
			<Navigation />
			<Suspense
				fallback={
					<div className={styles.routeLoader}>
						<Spinner size="lg" />
						<span>Loading workspace...</span>
					</div>
				}
			>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/dashboard" element={<DashboardPage />} />
					<Route path="/reports" element={<TimesheetPage />} />
					<Route path="/team" element={<Navigate to="/reports" replace />} />
					<Route
						path="/timesheet"
						element={<Navigate to="/reports" replace />}
					/>
					<Route path="/settings" element={<SettingsPage />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Suspense>
			<ToastContainer />
		</div>
	);

	return isHashRouterMode ? (
		<HashRouter>{appShell}</HashRouter>
	) : (
		<BrowserRouter basename={appBasePath}>{appShell}</BrowserRouter>
	);
};
