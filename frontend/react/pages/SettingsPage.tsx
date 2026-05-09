import type React from 'react';
import { useState } from 'react';
import { useConfigStore } from '../../stores/useConfigStore';
import {
	type SettingsIntegrationTests,
	useSettingsFormStore,
} from '../../stores/useSettingsFormStore';
import {
	buildJiraConnectionFingerprint,
	useUIStore,
} from '../../stores/useUIStore';
import { DiagnosticsPanel } from '../components/settings/DiagnosticsPanel';
import { SettingsForm } from '../components/settings/SettingsForm';
import { SetupWizard } from '../components/settings/SetupWizard';
import { toast } from '../components/ui/Toast';
import { buildSettingsSetupModel } from '../utils/settingsSetup';
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
	const jiraConnectionEvidenceAt = useUIStore(
		(state) => state.jiraConnectionEvidenceAt,
	);
	const jiraConnectionEvidenceFingerprint = useUIStore(
		(state) => state.jiraConnectionEvidenceFingerprint,
	);
	const [checksRunning, setChecksRunning] = useState(false);
	const [lastDiagnosticsRunAt, setLastDiagnosticsRunAt] = useState<
		string | null
	>(null);
	const [lastDiagnosticsSummary, setLastDiagnosticsSummary] = useState<
		string | null
	>(null);

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
	const savedConnectionEvidenceAt =
		jiraConnectionEvidenceFingerprint ===
		buildJiraConnectionFingerprint(savedConfig)
			? jiraConnectionEvidenceAt
			: null;

	const model = buildSettingsSetupModel(
		formData,
		integrationTests,
		isDirty,
		savedConnectionEvidenceAt,
	);

	const jumpToSection = (sectionId: string) => {
		document.getElementById(sectionId)?.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		});
	};

	const summarizeDiagnostics = (tests: SettingsIntegrationTests) => {
		const results = [
			canTestJira ? tests.jira.result : null,
			canTestGitlab ? tests.gitlab.result : null,
			hasCalendarFeeds ? tests.calendar.result : null,
			canTestRescueTime ? tests.rescuetime.result : null,
		].filter((result): result is NonNullable<typeof result> => result !== null);

		if (results.length === 0) return null;
		const successCount = results.filter((result) => result.success).length;
		return `${successCount}/${results.length} checks passed`;
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
			const completedTests = useSettingsFormStore.getState().integrationTests;
			setLastDiagnosticsRunAt(new Date().toLocaleString());
			setLastDiagnosticsSummary(summarizeDiagnostics(completedTests));
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
					<h1>Connect Jira once. Keep the workspace trustworthy.</h1>
					<p className={styles.lead}>
						Use this page to connect Jira, run diagnostics, and save a setup
						that makes Dashboard and Reports reliable for day-to-day use.
					</p>
					<p className={styles.helper}>
						Start with Jira first and leave the proxy field blank on the first
						attempt. Add a local proxy only if direct browser access is blocked.
						Calendars, GitLab, and RescueTime can come later.
					</p>
				</div>
				<div className={styles.heroChecklist}>
					<div>
						<strong>Core setup</strong>
						<span>Connect Jira, run the check, and save a clean baseline.</span>
					</div>
					<div>
						<strong>Access path</strong>
						<span>
							Try direct browser access first. Only add the local proxy if the
							checks show your environment blocks Jira requests.
						</span>
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
					lastRunAt={lastDiagnosticsRunAt}
					lastRunSummary={lastDiagnosticsSummary}
					onJumpToSection={jumpToSection}
					onRunAvailableChecks={runAvailableChecks}
				/>
			</div>

			<section className={styles.formSection}>
				<div className={styles.formIntro}>
					<div>
						<h2>Configuration form</h2>
						<p>
							The wizard and diagnostics read from the same configuration below.
							Update the fields here, then save once the setup looks right.
						</p>
					</div>
				</div>
				<SettingsForm />
			</section>
		</div>
	);
};
