import type React from 'react';
import { Link } from 'react-router-dom';
import { useConfigStore } from '../../stores/useConfigStore';
import * as styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
	const jiraHost = useConfigStore((state) => state.config.jiraHost);
	const isConfigured = !!jiraHost;

	return (
		<div className={styles.container}>
			<div className={styles.hero}>
				<h1 className={styles.title}>Jira Timesheet Report</h1>
				<p className={styles.description}>
					Track and manage your team's time tracking data from Jira. View
					timesheets in a calendar view and export CSV reports.
				</p>
				<div className={styles.buttonContainer}>
					<Link
						to={isConfigured ? '/dashboard' : '/settings'}
						className={styles.primaryButton}
					>
						{isConfigured ? 'My Dashboard' : 'Get Started'}
					</Link>
					{isConfigured && (
						<>
							<Link to="/timesheet" className={styles.secondaryButton}>
								Team Timesheet
							</Link>
							<Link to="/settings" className={styles.secondaryButton}>
								Settings
							</Link>
						</>
					)}
				</div>
			</div>

			<div className={styles.features}>
				<div className={styles.featureItem}>
					<div className={styles.featureIcon}>&#128197;</div>
					<div className={styles.featureTitle}>Calendar View</div>
					<div className={styles.featureDescription}>
						Visual calendar interface with color-coded day status for tracking
						work hours
					</div>
				</div>
				<div className={styles.featureItem}>
					<div className={styles.featureIcon}>&#128101;</div>
					<div className={styles.featureTitle}>Team Overview</div>
					<div className={styles.featureDescription}>
						Aggregated table showing days worked, entries, and total hours per
						team member
					</div>
				</div>
				<div className={styles.featureItem}>
					<div className={styles.featureIcon}>&#128202;</div>
					<div className={styles.featureTitle}>CSV Export</div>
					<div className={styles.featureDescription}>
						Download individual or summary reports with retroactive worklog
						detection
					</div>
				</div>
				<div className={styles.featureItem}>
					<div className={styles.featureIcon}>&#128274;</div>
					<div className={styles.featureTitle}>Privacy First</div>
					<div className={styles.featureDescription}>
						Zero backend. Credentials stay in your browser's localStorage and
						never leave your device
					</div>
				</div>
			</div>

			{!isConfigured && (
				<div className={styles.quickStart}>
					<h2 className={styles.quickStartTitle}>Quick Start</h2>
					<ol className={styles.steps}>
						<li className={styles.step}>
							<span className={styles.stepNumber}>1</span>
							<span className={styles.stepText}>
								Go to <Link to="/settings">Settings</Link> and enter your Jira
								host, email, and API token
							</span>
						</li>
						<li className={styles.step}>
							<span className={styles.stepNumber}>2</span>
							<span className={styles.stepText}>
								Test your connection to make sure credentials work
							</span>
						</li>
						<li className={styles.step}>
							<span className={styles.stepNumber}>3</span>
							<span className={styles.stepText}>
								Navigate to the Timesheet page to view your team's worklogs
							</span>
						</li>
					</ol>
				</div>
			)}
		</div>
	);
};
