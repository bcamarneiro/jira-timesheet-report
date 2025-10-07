import type React from "react";
import { Link } from "react-router-dom";
import * as styles from "./HomePage.module.css";

export const HomePage: React.FC = () => {
	return (
		<div className={styles.container}>
			<h1 className={styles.title}>
				Jira Timesheet Report
			</h1>

			<p className={styles.description}>
				Track and manage your team's time tracking data from Jira with ease.
				View timesheets, export reports, and analyze work patterns.
			</p>

			<div className={styles.buttonContainer}>
				<Link
					to="/timesheet"
					className={styles.button}
				>
					View Timesheet
				</Link>
			</div>

			<div className={styles.features}>
				<h2 className={styles.featuresTitle}>Features</h2>
				<ul className={styles.featureList}>
					<li className={styles.featureItem}>
						<strong>📊 Timesheet View</strong>
						<br />
						Visual calendar interface for tracking work logs
					</li>
					<li className={styles.featureItem}>
						<strong>👥 Team Management</strong>
						<br />
						Select and view different team members
					</li>
					<li className={styles.featureItem}>
						<strong>📈 Export Reports</strong>
						<br />
						Download CSV reports for analysis
					</li>
					<li className={styles.featureItem}>
						<strong>🔗 Jira Integration</strong>
						<br />
						Direct links to Jira issues and work logs
					</li>
				</ul>
			</div>
		</div>
	);
};
