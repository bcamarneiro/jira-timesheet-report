import type React from 'react';
import { Link } from 'react-router-dom';
import { useConfigStore } from '../../stores/useConfigStore';
import { PWAInstallCard } from '../components/home/PWAInstallCard';
import * as styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
	const jiraHost = useConfigStore((state) => state.config.jiraHost);
	const isConfigured = !!jiraHost;
	const primaryAction = isConfigured
		? { to: '/dashboard', label: 'Open Dashboard' }
		: { to: '/settings', label: 'Start Setup' };

	return (
		<div className={styles.container}>
			<section className={styles.hero}>
				<div className={styles.heroContent}>
					<div className={styles.eyebrow}>Zero-backend Jira worklog companion</div>
					<h1 className={styles.title}>
						Close the week faster. Keep reports trustworthy.
					</h1>
					<p className={styles.description}>
						Jira Timesheet Report gives people a weekly dashboard for gap
						triage and a reports area for monthly and team-wide visibility,
						without introducing a backend or moving credentials off-device.
					</p>
					<div className={styles.badgeRow}>
						<span className={styles.badge}>Dashboard-first workflow</span>
						<span className={styles.badge}>Reports and exports</span>
						<span className={styles.badge}>Local-only credentials</span>
					</div>
					<div className={styles.buttonContainer}>
						<Link to={primaryAction.to} className={styles.primaryButton}>
							{primaryAction.label}
						</Link>
						<Link to="/reports" className={styles.secondaryButton}>
							Explore Reports
						</Link>
						<Link to="/settings" className={styles.secondaryButton}>
							Open Settings
						</Link>
					</div>
				</div>

				<aside className={styles.heroPanel}>
					<div className={styles.panelLabel}>
						{isConfigured ? 'Currently configured' : 'First run'}
					</div>
					<h2 className={styles.panelTitle}>
						{isConfigured
							? 'You are ready to use the app'
							: 'Setup should feel lightweight'}
					</h2>
					<p className={styles.panelDescription}>
						{isConfigured
							? `Your workspace is configured for ${jiraHost}. Dashboard is the best place to close the week; Reports is for compliance and monthly visibility.`
							: 'Start in Settings, test the Jira connection, and then move straight into Dashboard for personal weekly triage or Reports for team/month views.'}
					</p>
					<ul className={styles.panelList}>
						<li>Import an exported JSON backup if you already have one</li>
						<li>Keep credentials local to the browser with no backend required</li>
						<li>Use the same data model across Dashboard and Reports</li>
					</ul>
				</aside>
			</section>

			<section className={styles.section}>
				<div className={styles.sectionHeading}>
					<h2 className={styles.sectionTitle}>Two clear surfaces</h2>
					<p className={styles.sectionDescription}>
						The product works best when Dashboard is the personal home base and
						Reports is the shared reporting surface.
					</p>
				</div>
				<div className={styles.featureGrid}>
					<div className={styles.featureItem}>
						<div className={styles.featureTitle}>Dashboard</div>
						<div className={styles.featureDescription}>
							Weekly gap triage, copy-previous-week flows, suggestions,
							templates, pins, notes, and quick exports.
						</div>
					</div>
					<div className={styles.featureItem}>
						<div className={styles.featureTitle}>Reports</div>
						<div className={styles.featureDescription}>
							Weekly team compliance plus monthly calendar reporting with
							per-user drill-down and CSV output.
						</div>
					</div>
					<div className={styles.featureItem}>
						<div className={styles.featureTitle}>Settings</div>
						<div className={styles.featureDescription}>
							Connection details, JQL, permissions, calendar feeds, theme,
							rounding, and import/export of local config.
						</div>
					</div>
				</div>
			</section>

			<section className={styles.section}>
				<div className={styles.sectionHeading}>
					<h2 className={styles.sectionTitle}>Why this is easier to adopt</h2>
					<p className={styles.sectionDescription}>
						The next step for the app is less about adding screens and more
						about reducing friction for first-time use.
					</p>
				</div>
				<div className={styles.adoptionGrid}>
					<div className={styles.adoptionCard}>
						<div className={styles.adoptionTitle}>No backend to maintain</div>
						<div className={styles.adoptionDescription}>
							The app stays static-host friendly, which makes GitHub Pages a
							realistic distribution path.
						</div>
					</div>
					<div className={styles.adoptionCard}>
						<div className={styles.adoptionTitle}>
							Import/export already exists
						</div>
						<div className={styles.adoptionDescription}>
							Teams can pass around safe setup packs and restore local backups
							without retyping every field.
						</div>
					</div>
					<div className={styles.adoptionCard}>
						<div className={styles.adoptionTitle}>
							Trust comes from consistency
						</div>
						<div className={styles.adoptionDescription}>
							Dashboard and Reports should keep matching on real data, not just
							look polished in isolation.
						</div>
					</div>
				</div>
			</section>

			<section className={styles.section}>
				<div className={styles.sectionHeading}>
					<h2 className={styles.sectionTitle}>Install it like a lightweight app</h2>
					<p className={styles.sectionDescription}>
						GitHub Pages gets much more usable when the workspace can live in a
						dock, launcher, or home screen instead of a random tab.
					</p>
				</div>
				<PWAInstallCard />
			</section>

			{!isConfigured && (
				<section className={styles.quickStart}>
					<h2 className={styles.quickStartTitle}>Quick Start</h2>
					<ol className={styles.steps}>
						<li className={styles.step}>
							<span className={styles.stepNumber}>1</span>
							<span className={styles.stepText}>
								Go to <Link to="/settings">Settings</Link> and enter your Jira
								host, email, and API token or import a backup JSON
							</span>
						</li>
						<li className={styles.step}>
							<span className={styles.stepNumber}>2</span>
							<span className={styles.stepText}>
								Test the connection so you know whether auth, permissions, and
								CORS are all in a good state
							</span>
						</li>
						<li className={styles.step}>
							<span className={styles.stepNumber}>3</span>
							<span className={styles.stepText}>
								Use Dashboard for the weekly close workflow and Reports for
								team/month visibility
							</span>
						</li>
					</ol>
				</section>
			)}

			{isConfigured && (
				<section className={styles.quickStart}>
					<h2 className={styles.quickStartTitle}>Suggested next moves</h2>
					<ol className={styles.steps}>
						<li className={styles.step}>
							<span className={styles.stepNumber}>1</span>
							<span className={styles.stepText}>
								Open <Link to="/dashboard">Dashboard</Link> to close the week,
								fill gaps, and reuse prior work
							</span>
						</li>
						<li className={styles.step}>
							<span className={styles.stepNumber}>2</span>
							<span className={styles.stepText}>
								Use <Link to="/reports">Reports</Link> when you need a team
								compliance or monthly view
							</span>
						</li>
						<li className={styles.step}>
							<span className={styles.stepNumber}>3</span>
							<span className={styles.stepText}>
								Export or back up your local setup from{' '}
								<Link to="/settings">Settings</Link> before sharing the app with
								teammates
							</span>
						</li>
					</ol>
				</section>
			)}
		</div>
	);
};
