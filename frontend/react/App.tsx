import type React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import * as styles from './App.module.css';

import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { TimesheetPage } from './pages/TimesheetPage';

export const App: React.FC = () => {
	return (
		<Router>
			<div className={styles.appContainer}>
				<Navigation />
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/timesheet" element={<TimesheetPage />} />
				</Routes>
			</div>
		</Router>
	);
};
