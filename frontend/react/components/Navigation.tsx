import type React from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as styles from './Navigation.module.css';

export const Navigation: React.FC = () => {
	const location = useLocation();

	const getLinkStyle = (path: string) => {
		return location.pathname === path ? styles.navLinkActive : styles.navLink;
	};

	return (
		<nav className={styles.nav}>
			<div className={styles.navContent}>
				<Link to="/" className={styles.navLink}>
					<h2 className={styles.brand}>Jira Timesheet</h2>
				</Link>
				<div className={styles.navLinks}>
					<Link to="/" className={getLinkStyle('/')}>
						Home
					</Link>
					<Link to="/timesheet" className={getLinkStyle('/timesheet')}>
						Timesheet
					</Link>
				</div>
			</div>
		</nav>
	);
};
