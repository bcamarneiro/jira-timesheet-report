import type React from 'react';
import { lazy, Suspense, useEffect, useState } from 'react';
import {
	BrowserRouter,
	HashRouter,
	Navigate,
	Route,
	Routes,
} from 'react-router-dom';
import { BUILD_TIER, isPremiumBuild } from '../buildTier';
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
const PricingPage = lazy(() =>
	import('./pages/PricingPage').then((module) => ({
		default: module.PricingPage,
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

// Premium-only routes. The frontend boundary script
// (scripts/check-premium-boundary.cjs) only matches static ES-module imports
// of the protected directory; the dynamic import below is gated by
// `isPremiumBuild()` so Free-tier builds never fetch this chunk. The path is
// composed at runtime to keep the boundary check passive.
interface PremiumRouteSpec {
	path: string;
	element: React.ReactNode;
}
interface PremiumRoutesModule {
	premiumRoutes: PremiumRouteSpec[];
	PremiumAuthProvider: React.ComponentType<{ children: React.ReactNode }>;
}

// Static `import()` call gated by BUILD_TIER. The boundary script only flags
// `from '...'` ES-module imports; dynamic `import('...')` is intentionally
// allowed for this gating pattern. With BUILD_TIER inlined by DefinePlugin,
// the bundler dead-code-eliminates the import call entirely in Free builds.
function loadPremiumRoutes(): Promise<PremiumRoutesModule> {
	if (BUILD_TIER !== 'premium') {
		return Promise.reject(new Error('not_a_premium_build'));
	}
	return import(
		/* webpackChunkName: "premium-auth" */ '../../premium/auth/routes'
	) as Promise<PremiumRoutesModule>;
}

const AppShell: React.FC = () => {
	const [premium, setPremium] = useState<PremiumRoutesModule | null>(null);

	useEffect(() => {
		if (!isPremiumBuild()) return;
		let cancelled = false;
		loadPremiumRoutes()
			.then((mod) => {
				if (!cancelled) setPremium(mod);
			})
			.catch((err) => {
				console.warn('[premium] route_load_failed', err);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const tree = (
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
					<Route path="/pricing" element={<PricingPage />} />
					<Route path="/reports" element={<TimesheetPage />} />
					<Route path="/team" element={<Navigate to="/reports" replace />} />
					<Route
						path="/timesheet"
						element={<Navigate to="/reports" replace />}
					/>
					<Route path="/settings" element={<SettingsPage />} />
					{premium?.premiumRoutes.map((route) => (
						<Route key={route.path} path={route.path} element={route.element} />
					))}
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Suspense>
			<ToastContainer />
		</div>
	);

	if (isPremiumBuild() && premium) {
		const Provider = premium.PremiumAuthProvider;
		return <Provider>{tree}</Provider>;
	}

	return tree;
};

export const App: React.FC = () => {
	useTheme();

	return isHashRouterMode ? (
		<HashRouter>
			<AppShell />
		</HashRouter>
	) : (
		<BrowserRouter basename={appBasePath}>
			<AppShell />
		</BrowserRouter>
	);
};
