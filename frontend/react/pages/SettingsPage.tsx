import type React from 'react';
import { useState } from 'react';
import { useConfigStore } from '../../stores/useConfigStore';
import { useSettingsFormStore } from '../../stores/useSettingsFormStore';
import { buildSettingsSetupModel } from '../utils/settingsSetup';
import { toast } from '../components/ui/Toast';
import { DiagnosticsPanel } from '../components/settings/DiagnosticsPanel';
import { SettingsForm } from '../components/settings/SettingsForm';
import { SetupWizard } from '../components/settings/SetupWizard';
import * as styles from './SettingsPage.module.css';

export const SettingsPage: React.FC = () => {
	const formData = useSettingsFormStore((state) => state.formData);
	const integrationTests = useSettingsFormStore(
		(state) => state.integrationTests,
	);
	const testJira = useSettingsFormStore((state) => state.testJira);
	const testGitlab = useSettingsFormStore((state) => state.testGitlab);
	const testCalendar = useSettingsFormStore((state) => state.testCalendar);
	const testRescueTime = useSettingsFormStore((state) => state.testRescueTime);
	const savedConfig = useConfigStore((state) => state.config);
	const [checksRunning, setChecksRunning] = useState(false);

	const isDirty = JSON.stringify(formData) !== JSON.stringify(savedConfig);
	const canTestJira =
		!!formData.jiraHost.trim() &&
		!!formData.email.trim() &&
		!!formData.apiToken.trim();
	const canTestGitlab =
		!!formData.gitlabHost.trim() && !!formData.gitlabToken.trim();
	const canTestRescueTime = !!formData.rescueTimeApiKey.trim();
	const hasCalendarFeeds = (formData.calendarFeeds ?? []).some((feed) =>
		feed.url.trim(),
	);
	const canRunChecks =
		canTestJira || canTestGitlab || hasCalendarFeeds || canTestRescueTime;

	const model = buildSettingsSetupModel(formData, integrationTests, isDirty);

	const jumpToSection = (sectionId: string) => {
		document.getElementById(sectionId)?.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		});
	};

	const runAvailableChecks = async () => {
		if (!canRunChecks) {
			toast.error(
				'Add at least a Jira connection or one optional source first',
			);
			return;
		}

		setChecksRunning(true);
		try {
			if (canTestJira) {
				await testJira();
			}
			if (canTestGitlab) {
				await testGitlab();
			}
			if (hasCalendarFeeds) {
				await testCalendar();
			}
			if (canTestRescueTime) {
				await testRescueTime();
			}
			toast.success('Diagnostics refreshed');
		} finally {
			setChecksRunning(false);
		}
	};

	return (
		<div className={styles.container}>
			<section className={styles.hero}>
				<div className={styles.heroText}>
					<p className={styles.kicker}>Setup and trust</p>
					<h1>Make the app easy to trust before it becomes easy to forget</h1>
					<p className={styles.lead}>
						We are treating Settings as onboarding now, not just storage. The
						goal is simple: get someone from zero to a trustworthy Dashboard and
						Reports flow without guesswork.
					</p>
				</div>
				<div className={styles.heroChecklist}>
					<div>
						<strong>Core setup</strong>
						<span>Connect Jira, run the check, and save a clean baseline.</span>
					</div>
					<div>
						<strong>Optional signals</strong>
						<span>
							Add calendars, GitLab, or RescueTime when you want smarter
							suggestions.
						</span>
					</div>
					<div>
						<strong>Trust signal</strong>
						<span>
							Diagnostics below show whether Dashboard and Reports are actually
							ready to rely on.
						</span>
					</div>
				</div>
			</section>

			<div className={styles.overviewGrid}>
				<SetupWizard
					model={model}
					canRunChecks={canRunChecks}
					checksRunning={checksRunning}
					onJumpToSection={jumpToSection}
					onRunAvailableChecks={runAvailableChecks}
				/>
				<DiagnosticsPanel
					model={model}
					canRunChecks={canRunChecks}
					checksRunning={checksRunning}
					onJumpToSection={jumpToSection}
					onRunAvailableChecks={runAvailableChecks}
				/>
			</div>

			<section className={styles.formSection}>
				<div className={styles.formIntro}>
					<div>
						<h2>Configuration form</h2>
						<p>
							The wizard and diagnostics sit on top of the same saved
							configuration. Change the fields here, then save when the setup
							looks right.
						</p>
					</div>
				</div>
				<SettingsForm />
			</section>
		</div>
	);
};
