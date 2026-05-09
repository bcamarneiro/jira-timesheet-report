import type React from 'react';
import { useEffect, useId, useMemo, useRef } from 'react';
import type { CalendarFeed } from '../../../stores/useConfigStore';
import { useConfigStore } from '../../../stores/useConfigStore';
import { useSettingsFormStore } from '../../../stores/useSettingsFormStore';
import { useUserDataStore } from '../../../stores/useUserDataStore';
import { SETTINGS_SECTION_IDS } from '../../constants/settingsSections';
import { downloadAsFile } from '../../utils/downloadFile';
import { splitCsvEmailList, uniqueEmailEntries } from '../../utils/emailList';
import {
	createSettingsBackup,
	createSettingsSharePack,
	parseSettingsBackup,
} from '../../utils/settingsBackup';
import { Button } from '../ui/Button';
import { AllowedUsersInput } from './AllowedUsersInput';
import { CalendarMappingsEditor } from './CalendarMappingsEditor';
import { TeamAbsenceAssignmentsEditor } from './TeamAbsenceAssignmentsEditor';
import { toast } from '../ui/Toast';
import * as styles from './SettingsForm.module.css';

type FeedEntry = {
	feed: CalendarFeed;
	index: number;
};

type ServiceStatus = {
	tone: 'ready' | 'warning' | 'pending';
	label: string;
};

function getServiceStatus(
	configured: boolean,
	loading: boolean,
	result: { success: boolean; message: string } | null,
): ServiceStatus {
	if (!configured) {
		return { tone: 'pending', label: 'Not configured' };
	}
	if (loading) {
		return { tone: 'warning', label: 'Testing' };
	}
	if (result?.success) {
		return { tone: 'ready', label: 'Ready' };
	}
	if (result?.success === false) {
		return { tone: 'warning', label: 'Needs review' };
	}
	return { tone: 'warning', label: 'Needs review' };
}

function buildFeedEntries(
	feeds: CalendarFeed[] | undefined,
	type: CalendarFeed['type'],
): FeedEntry[] {
	return (feeds ?? [])
		.map((feed, index) => ({ feed, index }))
		.filter((entry) => entry.feed.type === type);
}

function getGitlabTroubleshooting(message: string | null): string | null {
	if (!message) return null;
	const normalized = message.toLowerCase();
	if (
		normalized.includes('rejected the token') ||
		normalized.includes('invalid gitlab token')
	) {
		return 'This usually means the host was reached but the token was rejected. Check that the token belongs to this GitLab instance and still has read_user or api scope.';
	}
	if (normalized.includes('denied access')) {
		return 'GitLab understood the token but blocked the request. Confirm the account can access this instance and the PAT has enough scope.';
	}
	if (normalized.includes('api was not found')) {
		return 'The hostname looks reachable, but the standard GitLab API path was not found. Double-check the host or whether this self-hosted instance needs a custom base path.';
	}
	if (normalized.includes('could not reach')) {
		return 'This is usually a networking, certificate, VPN, or CORS-proxy issue rather than a bad token.';
	}
	return null;
}

export const SettingsForm: React.FC = () => {
	const formData = useSettingsFormStore((state) => state.formData);
	const integrationTests = useSettingsFormStore(
		(state) => state.integrationTests,
	);
	const savedConfig = useConfigStore((state) => state.config);
	const updateFormField = useSettingsFormStore(
		(state) => state.updateFormField,
	);
	const saveSettings = useSettingsFormStore((state) => state.saveSettings);
	const testJira = useSettingsFormStore((state) => state.testJira);
	const testGitlab = useSettingsFormStore((state) => state.testGitlab);
	const testCalendar = useSettingsFormStore((state) => state.testCalendar);
	const testRescueTime = useSettingsFormStore((state) => state.testRescueTime);
	const loadFromConfig = useSettingsFormStore((state) => state.loadFromConfig);
	const resetForm = useSettingsFormStore((state) => state.resetForm);
	const replaceFormData = useSettingsFormStore(
		(state) => state.replaceFormData,
	);

	const calendarMappings = useUserDataStore((s) => s.calendarMappings);
	const addCalendarMapping = useUserDataStore((s) => s.addCalendarMapping);
	const removeCalendarMapping = useUserDataStore(
		(s) => s.removeCalendarMapping,
	);
	const updateCalendarMapping = useUserDataStore(
		(s) => s.updateCalendarMapping,
	);
	const replaceCalendarMappings = useUserDataStore(
		(s) => s.replaceCalendarMappings,
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const jiraHostId = useId();
	const emailId = useId();
	const apiTokenId = useId();
	const corsProxyId = useId();
	const jqlFilterId = useId();
	const allowedUsersId = useId();
	const gitlabTokenId = useId();
	const gitlabHostId = useId();
	const rescueTimeKeyId = useId();
	const timeRoundingId = useId();
	const themeId = useId();
	const isDirty = JSON.stringify(formData) !== JSON.stringify(savedConfig);
	const canTestJira =
		!!formData.jiraHost.trim() &&
		!!formData.email.trim() &&
		!!formData.apiToken.trim();
	const canTestGitlab =
		!!formData.gitlabHost.trim() && !!formData.gitlabToken.trim();
	const canTestRescueTime = !!formData.rescueTimeApiKey.trim();
	const hasCalendarFeeds = (formData.calendarFeeds ?? []).some((f) =>
		f.url.trim(),
	);
	const suggestionFeedEntries = useMemo(
		() => buildFeedEntries(formData.calendarFeeds, 'suggestion'),
		[formData.calendarFeeds],
	);
	const absenceFeedEntries = useMemo(
		() => buildFeedEntries(formData.calendarFeeds, 'absence'),
		[formData.calendarFeeds],
	);
	const sharedAbsenceFeedEntries = useMemo(
		() =>
			absenceFeedEntries.filter(
				({ feed }) => (feed.absenceAttribution ?? 'self') === 'shared',
			),
		[absenceFeedEntries],
	);
	const gitlabStatus = getServiceStatus(
		!!formData.gitlabHost.trim() || !!formData.gitlabToken.trim(),
		integrationTests.gitlab.loading,
		integrationTests.gitlab.result,
	);
	const rescueTimeStatus = getServiceStatus(
		!!formData.rescueTimeApiKey.trim(),
		integrationTests.rescuetime.loading,
		integrationTests.rescuetime.result,
	);
	const calendarStatus = getServiceStatus(
		hasCalendarFeeds,
		integrationTests.calendar.loading,
		integrationTests.calendar.result,
	);
	const hasSharedAbsenceFeeds = sharedAbsenceFeedEntries.length > 0;
	const showAbsenceAssignments =
		hasSharedAbsenceFeeds || (formData.absenceAssignments ?? []).length > 0;
	const hasSharedAbsenceFeedsWithoutAssignments =
		hasSharedAbsenceFeeds && (formData.absenceAssignments ?? []).length === 0;
	const allowedUserSuggestions = useMemo(
		() =>
			uniqueEmailEntries([
				formData.email,
				savedConfig.email,
				...splitCsvEmailList(savedConfig.allowedUsers),
				...splitCsvEmailList(formData.allowedUsers),
			]),
		[
			formData.allowedUsers,
			formData.email,
			savedConfig.allowedUsers,
			savedConfig.email,
		],
	);
	const gitlabTroubleshooting = getGitlabTroubleshooting(
		integrationTests.gitlab.result?.success === false
			? integrationTests.gitlab.result.message
			: null,
	);

	const updateCalendarFeed = (index: number, patch: Partial<CalendarFeed>) => {
		const feeds = [...(formData.calendarFeeds ?? [])];
		feeds[index] = {
			...feeds[index],
			...patch,
		};
		updateFormField('calendarFeeds', feeds as never);
	};

	const removeCalendarFeed = (index: number) => {
		const feeds = (formData.calendarFeeds ?? []).filter((_, i) => i !== index);
		updateFormField('calendarFeeds', feeds as never);
	};

	const addCalendarFeed = (type: CalendarFeed['type']) => {
		const feeds: CalendarFeed[] = [
			...(formData.calendarFeeds ?? []),
			{ label: '', url: '', type },
		];
		updateFormField('calendarFeeds', feeds as never);
	};

	const addAbsenceAssignment = (assignment: {
		pattern: string;
		userEmail: string;
	}) => {
		updateFormField('absenceAssignments', [
			...(formData.absenceAssignments ?? []),
			assignment,
		] as never);
	};

	const updateAbsenceAssignment = (
		original: { pattern: string; userEmail: string },
		nextAssignment: { pattern: string; userEmail: string },
	) => {
		updateFormField(
			'absenceAssignments',
			(formData.absenceAssignments ?? []).map((assignment) =>
				assignment.pattern === original.pattern &&
				assignment.userEmail === original.userEmail
					? nextAssignment
					: assignment,
			) as never,
		);
	};

	const removeAbsenceAssignment = (target: {
		pattern: string;
		userEmail: string;
	}) => {
		updateFormField(
			'absenceAssignments',
			(formData.absenceAssignments ?? []).filter(
				(assignment) =>
					assignment.pattern !== target.pattern ||
					assignment.userEmail !== target.userEmail,
			) as never,
		);
	};

	useEffect(() => {
		loadFromConfig();
	}, [loadFromConfig]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		if (type === 'checkbox') {
			updateFormField(name as keyof typeof formData, checked as never);
		} else {
			updateFormField(name as keyof typeof formData, value as never);
		}
	};

	const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = e.target;
		updateFormField(name as keyof typeof formData, value as never);
	};

	const handleSave = () => {
		if (!isDirty) return;
		saveSettings();
		toast.success('Settings saved');
	};

	const handleExportSettings = () => {
		const userDataState = useUserDataStore.getState();
		const backup = createSettingsBackup(savedConfig, calendarMappings, {
			favorites: userDataState.favorites,
			templates: userDataState.templates,
			commentPresets: userDataState.commentPresets,
			dayNotes: userDataState.dayNotes,
			reportPresets: userDataState.reportPresets,
		});
		downloadAsFile(
			`${JSON.stringify(backup, null, 2)}\n`,
			'jira-timesheet-settings.json',
			'application/json;charset=utf-8',
		);
		toast.success('Settings exported');
	};

	const handleExportSharePack = () => {
		const sharePack = createSettingsSharePack(savedConfig, calendarMappings);
		downloadAsFile(
			`${JSON.stringify(sharePack, null, 2)}\n`,
			'jira-timesheet-share-pack.json',
			'application/json;charset=utf-8',
		);
		toast.success('Share pack exported without local secrets');
	};

	const handleImportClick = () => {
		fileInputRef.current?.click();
	};

	const handleImportSettings = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const content = await file.text();
			const imported = parseSettingsBackup(content, savedConfig);
			replaceFormData(imported.config);
			replaceCalendarMappings(imported.calendarMappings);
			if (imported.userData) {
				useUserDataStore.setState({
					favorites: imported.userData.favorites,
					templates: imported.userData.templates,
					commentPresets: imported.userData.commentPresets,
					dayNotes: imported.userData.dayNotes,
					reportPresets: imported.userData.reportPresets,
				});
			}
			toast.success(
				imported.kind === 'share-pack'
					? 'Share pack imported into the form'
					: 'Settings backup imported into the form',
			);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to import settings',
			);
		} finally {
			e.target.value = '';
		}
	};

	return (
		<div id={SETTINGS_SECTION_IDS.form} className={styles.form}>
			<input
				ref={fileInputRef}
				type="file"
				accept="application/json,.json"
				className={styles.hiddenInput}
				onChange={handleImportSettings}
			/>
			<div className={styles.formStatus} aria-live="polite">
				<div className={styles.formStatusText}>
					<strong>{isDirty ? 'Unsaved changes' : 'Settings up to date'}</strong>
					<span>
						{isDirty
							? 'Review and save when you are ready.'
							: 'The form matches your saved configuration.'}
					</span>
				</div>
				<div className={styles.buttonGroup}>
					<Button
						type="button"
						variant="secondary"
						onClick={handleExportSettings}
					>
						Backup
					</Button>
					<Button
						type="button"
						variant="secondary"
						onClick={handleExportSharePack}
					>
						Share Pack
					</Button>
					<Button type="button" variant="secondary" onClick={handleImportClick}>
						Import
					</Button>
					<Button
						type="button"
						variant="secondary"
						onClick={resetForm}
						disabled={!isDirty}
					>
						Discard
					</Button>
					<Button type="button" disabled={!isDirty} onClick={handleSave}>
						Save
					</Button>
				</div>
			</div>

			<fieldset id={SETTINGS_SECTION_IDS.connection} className={styles.section}>
				<legend className={styles.sectionTitle}>
					<div className={styles.sectionHeader}>
						<span>Connection</span>
						<button
							type="button"
							className={styles.testButton}
							onClick={testJira}
							disabled={integrationTests.jira.loading || !canTestJira}
						>
							{integrationTests.jira.loading ? 'Testing...' : 'Test'}
						</button>
					</div>
				</legend>
				{integrationTests.jira.result && (
					<p
						className={`${styles.testResult} ${integrationTests.jira.result.success ? styles.testSuccess : styles.testError}`}
					>
						{integrationTests.jira.result.message}
					</p>
				)}
				<div className={styles.formGroup}>
					<label htmlFor={jiraHostId}>Jira Host</label>
					<input
						type="text"
						id={jiraHostId}
						name="jiraHost"
						value={formData.jiraHost}
						onChange={handleChange}
						placeholder="your-company.atlassian.net"
						autoCapitalize="off"
						autoCorrect="off"
						spellCheck={false}
						required
					/>
					<small>
						Hostname only is ideal, but pasted <code>https://</code> URLs are
						normalized for you
					</small>
				</div>
				<div className={styles.formGroup}>
					<label htmlFor={emailId}>Email</label>
					<input
						type="email"
						id={emailId}
						name="email"
						value={formData.email}
						onChange={handleChange}
						placeholder="your-email@example.com"
						autoCapitalize="off"
						autoCorrect="off"
						spellCheck={false}
						required
					/>
				</div>
				<div className={styles.formGroup}>
					<label htmlFor={apiTokenId}>API Token</label>
					<input
						type="password"
						id={apiTokenId}
						name="apiToken"
						value={formData.apiToken}
						onChange={handleChange}
						required
					/>
				</div>
				<div className={styles.formGroup}>
					<label htmlFor={corsProxyId}>
						CORS Proxy <span className={styles.optional}>optional</span>
					</label>
					<input
						type="text"
						id={corsProxyId}
						name="corsProxy"
						value={formData.corsProxy}
						onChange={handleChange}
						placeholder="http://localhost:8081"
						autoCapitalize="off"
						autoCorrect="off"
						spellCheck={false}
					/>
					<small>
						Leave this blank on the first attempt. Only fill it in if the Jira
						check fails because your browser or network blocks direct access.
					</small>
					<small>
						Start with <code>npm run cors-proxy</code>. If your environment
						needs SOCKS5, run <code>npm run cors-proxy:socks</code> and keep the
						same local proxy URL here.
					</small>
					{formData.corsProxy.trim() ? (
						<small>
							Jira requests are currently going through{' '}
							<code>{formData.corsProxy.trim()}</code> instead of using direct
							browser access.
						</small>
					) : null}
				</div>
			</fieldset>

			<fieldset id={SETTINGS_SECTION_IDS.scope} className={styles.section}>
				<legend className={styles.sectionTitle}>Reports Scope</legend>
				<div className={styles.formGroup}>
					<label htmlFor={jqlFilterId}>
						JQL Filter <span className={styles.optional}>optional</span>
					</label>
					<input
						type="text"
						id={jqlFilterId}
						name="jqlFilter"
						value={formData.jqlFilter}
						onChange={handleChange}
						placeholder="project = MYPROJECT"
					/>
					<small>Applied to all timesheet queries</small>
				</div>
				<div className={styles.formGroup}>
					<label htmlFor={allowedUsersId}>
						Team Members <span className={styles.optional}>optional</span>
					</label>
					<AllowedUsersInput
						id={allowedUsersId}
						value={formData.allowedUsers}
						onChange={(nextValue) =>
							updateFormField('allowedUsers', nextValue as never)
						}
						suggestions={allowedUserSuggestions}
						placeholder="john@example.com, jane@example.com"
					/>
					<small>
						Add the teammates you want to keep in scope for Reports and for
						shared time-off assignments. Press <code>Enter</code>,{' '}
						<code>Tab</code>, or paste a list to create chips.
					</small>
				</div>
			</fieldset>

			<fieldset
				id={SETTINGS_SECTION_IDS.permissions}
				className={styles.section}
			>
				<legend className={styles.sectionTitle}>Worklog Permissions</legend>
				<small className={styles.permissionsHint}>
					Auto-detected when you test the connection. Override manually if
					needed.
				</small>
				<label className={styles.checkboxLabel}>
					<input
						type="checkbox"
						name="canAddWorklogs"
						checked={formData.canAddWorklogs}
						onChange={handleChange}
					/>
					Allow adding worklogs
				</label>
				<label className={styles.checkboxLabel}>
					<input
						type="checkbox"
						name="canEditWorklogs"
						checked={formData.canEditWorklogs}
						onChange={handleChange}
					/>
					Allow editing worklogs
				</label>
				<label className={styles.checkboxLabel}>
					<input
						type="checkbox"
						name="canDeleteWorklogs"
						checked={formData.canDeleteWorklogs}
						onChange={handleChange}
					/>
					Allow deleting worklogs
				</label>
				<label className={styles.checkboxLabel}>
					<input
						type="checkbox"
						name="complianceReminderEnabled"
						checked={formData.complianceReminderEnabled}
						onChange={handleChange}
					/>
					Enable timesheet reminders
				</label>
			</fieldset>

			<fieldset
				id={SETTINGS_SECTION_IDS.integrations}
				className={styles.section}
			>
				<legend className={styles.sectionTitle}>
					Services <span className={styles.optional}>optional</span>
				</legend>
				<p className={styles.servicesIntro}>
					Each service helps in a different way. Keep them separate so it is
					obvious what powers suggestions, what reduces target hours, and what
					still needs review.
				</p>
				<div className={styles.servicesGrid}>
					<section className={styles.serviceCard}>
						<div className={styles.serviceHeader}>
							<div className={styles.serviceHeading}>
								<p className={styles.serviceKicker}>GitLab</p>
								<h3>Recent GitLab activity</h3>
								<p>
									Use GitLab events to suggest time from pushes, merge request
									actions, and review activity that already references Jira
									keys.
								</p>
							</div>
							<span
								className={`${styles.serviceStatusBadge} ${gitlabStatus.tone === 'ready' ? styles.serviceStatusReady : gitlabStatus.tone === 'warning' ? styles.serviceStatusWarning : styles.serviceStatusPending}`}
							>
								{gitlabStatus.label}
							</span>
						</div>
						<div className={styles.formGroup}>
							<label htmlFor={gitlabHostId}>GitLab Host</label>
							<input
								type="text"
								id={gitlabHostId}
								name="gitlabHost"
								value={formData.gitlabHost}
								onChange={handleChange}
								placeholder="gitlab.com or vcs.company.net"
								autoCapitalize="off"
								autoCorrect="off"
								spellCheck={false}
							/>
							<small>
								Hostname only is ideal, but pasted <code>https://</code> URLs
								are normalized for you
							</small>
						</div>
						<div className={styles.formGroup}>
							<label htmlFor={gitlabTokenId}>GitLab Token</label>
							<input
								type="password"
								id={gitlabTokenId}
								name="gitlabToken"
								value={formData.gitlabToken}
								onChange={handleChange}
							/>
							<small>
								Personal access token with <code>read_user</code> or{' '}
								<code>api</code> scope
							</small>
						</div>
						<div className={styles.serviceActions}>
							<Button
								type="button"
								variant="secondary"
								onClick={testGitlab}
								disabled={integrationTests.gitlab.loading || !canTestGitlab}
							>
								{integrationTests.gitlab.loading ? 'Testing...' : 'Test GitLab'}
							</Button>
						</div>
						{integrationTests.gitlab.result ? (
							<div className={styles.serviceFeedback}>
								<p
									className={`${styles.testResult} ${integrationTests.gitlab.result.success ? styles.testSuccess : styles.testError}`}
								>
									{integrationTests.gitlab.result.message}
								</p>
								{gitlabTroubleshooting ? (
									<p className={styles.serviceHint}>{gitlabTroubleshooting}</p>
								) : null}
							</div>
						) : (
							<p className={styles.serviceHint}>
								Run the test once to confirm the host, token, and proxy path are
								all valid together.
							</p>
						)}
					</section>

					<section className={styles.serviceCard}>
						<div className={styles.serviceHeader}>
							<div className={styles.serviceHeading}>
								<p className={styles.serviceKicker}>RescueTime</p>
								<h3>Personal activity signal</h3>
								<p>
									Use RescueTime to add a productivity signal when Jira and
									calendar data alone are not enough to explain a day.
								</p>
							</div>
							<span
								className={`${styles.serviceStatusBadge} ${rescueTimeStatus.tone === 'ready' ? styles.serviceStatusReady : rescueTimeStatus.tone === 'warning' ? styles.serviceStatusWarning : styles.serviceStatusPending}`}
							>
								{rescueTimeStatus.label}
							</span>
						</div>
						<div className={styles.formGroup}>
							<label htmlFor={rescueTimeKeyId}>RescueTime API Key</label>
							<input
								type="password"
								id={rescueTimeKeyId}
								name="rescueTimeApiKey"
								value={formData.rescueTimeApiKey}
								onChange={handleChange}
							/>
							<small>Requires the CORS proxy to be running</small>
						</div>
						<div className={styles.serviceActions}>
							<Button
								type="button"
								variant="secondary"
								onClick={testRescueTime}
								disabled={
									integrationTests.rescuetime.loading || !canTestRescueTime
								}
							>
								{integrationTests.rescuetime.loading
									? 'Testing...'
									: 'Test RescueTime'}
							</Button>
						</div>
						{integrationTests.rescuetime.result ? (
							<p
								className={`${styles.testResult} ${integrationTests.rescuetime.result.success ? styles.testSuccess : styles.testError}`}
							>
								{integrationTests.rescuetime.result.message}
							</p>
						) : (
							<p className={styles.serviceHint}>
								Leave this blank if you only want Jira- and calendar-based
								suggestions.
							</p>
						)}
					</section>
				</div>

				<section className={`${styles.serviceCard} ${styles.serviceCardWide}`}>
					<div className={styles.serviceHeader}>
						<div className={styles.serviceHeading}>
							<p className={styles.serviceKicker}>Calendars</p>
							<h3>Suggestion feeds and time off calendars</h3>
							<p>
								Suggestion feeds turn meetings into worklog candidates. Time off
								calendars reduce target hours for the right person in Reports
								and for you in Dashboard.
							</p>
						</div>
						<span
							className={`${styles.serviceStatusBadge} ${calendarStatus.tone === 'ready' ? styles.serviceStatusReady : calendarStatus.tone === 'warning' ? styles.serviceStatusWarning : styles.serviceStatusPending}`}
						>
							{calendarStatus.label}
						</span>
					</div>

					<div className={styles.feedGroup}>
						<div className={styles.feedGroupHeader}>
							<div>
								<h4>Suggestion feeds</h4>
								<p>
									Best for calendars whose event titles already include Jira
									keys or can be mapped with the editor below.
								</p>
							</div>
							<Button
								type="button"
								variant="secondary"
								onClick={() => addCalendarFeed('suggestion')}
							>
								+ Suggestion feed
							</Button>
						</div>
						<div className={styles.feedList}>
							{suggestionFeedEntries.length > 0 ? (
								suggestionFeedEntries.map(({ feed, index }) => (
									<div
										key={`suggestion-${index.toString()}`}
										className={styles.calendarFeedCard}
									>
										<div className={styles.calendarCardHeader}>
											<div className={styles.calendarCardHeading}>
												<span className={styles.feedTypeBadge}>
													Suggestion feed
												</span>
												<strong>
													{feed.label.trim() || 'Untitled suggestion feed'}
												</strong>
											</div>
											<button
												type="button"
												className={styles.calendarRemove}
												onClick={() => removeCalendarFeed(index)}
												aria-label={`Remove ${feed.label || 'suggestion feed'}`}
											>
												&times;
											</button>
										</div>
										<div className={styles.feedFields}>
											<label className={styles.feedField}>
												<span className={styles.feedFieldLabel}>Label</span>
												<input
													type="text"
													value={feed.label}
													onChange={(e) =>
														updateCalendarFeed(index, { label: e.target.value })
													}
													placeholder="Team, Work, PrimeIT"
													className={styles.feedInput}
												/>
											</label>
											<label
												className={`${styles.feedField} ${styles.feedFieldWide}`}
											>
												<span className={styles.feedFieldLabel}>Feed URL</span>
												<input
													type="text"
													value={feed.url}
													onChange={(e) =>
														updateCalendarFeed(index, { url: e.target.value })
													}
													placeholder="https://calendar.google.com/...basic.ics"
													className={`${styles.feedInput} ${styles.feedUrlInput}`}
												/>
											</label>
										</div>
									</div>
								))
							) : (
								<p className={styles.feedHelper}>
									No suggestion feeds yet. Add one when you want meeting-based
									worklog suggestions.
								</p>
							)}
						</div>
					</div>

					<div className={styles.feedGroup}>
						<div className={styles.feedGroupHeader}>
							<div>
								<h4>Time off calendars</h4>
								<p>
									Each calendar can either count only for you or act as a shared
									team calendar that uses title-to-user assignments.
								</p>
							</div>
							<Button
								type="button"
								variant="secondary"
								onClick={() => addCalendarFeed('absence')}
							>
								+ Time off calendar
							</Button>
						</div>
						<div className={styles.feedList}>
							{absenceFeedEntries.length > 0 ? (
								absenceFeedEntries.map(({ feed, index }) => (
									<div
										key={`absence-${index.toString()}`}
										className={styles.calendarFeedCard}
									>
										<div className={styles.calendarCardHeader}>
											<div className={styles.calendarCardHeading}>
												<span className={styles.feedTypeBadge}>
													Time off calendar
												</span>
												<strong>
													{feed.label.trim() || 'Untitled time off calendar'}
												</strong>
											</div>
											<button
												type="button"
												className={styles.calendarRemove}
												onClick={() => removeCalendarFeed(index)}
												aria-label={`Remove ${feed.label || 'time off calendar'}`}
											>
												&times;
											</button>
										</div>
										<div className={styles.feedFields}>
											<label className={styles.feedField}>
												<span className={styles.feedFieldLabel}>Label</span>
												<input
													type="text"
													value={feed.label}
													onChange={(e) =>
														updateCalendarFeed(index, { label: e.target.value })
													}
													placeholder="Team vacations"
													className={styles.feedInput}
												/>
											</label>
											<label
												className={`${styles.feedField} ${styles.feedFieldWide}`}
											>
												<span className={styles.feedFieldLabel}>Feed URL</span>
												<input
													type="text"
													value={feed.url}
													onChange={(e) =>
														updateCalendarFeed(index, { url: e.target.value })
													}
													placeholder="https://outlook.office365.com/...ics"
													className={`${styles.feedInput} ${styles.feedUrlInput}`}
												/>
											</label>
											<label className={styles.feedField}>
												<span className={styles.feedFieldLabel}>
													Who should this affect?
												</span>
												<select
													value={feed.absenceAttribution ?? 'self'}
													onChange={(e) =>
														updateCalendarFeed(index, {
															absenceAttribution:
																e.target.value === 'shared' ? 'shared' : 'self',
														})
													}
													className={styles.feedSelect}
													aria-label={`Attribution mode for ${feed.label || 'time off calendar'}`}
												>
													<option value="self">Only me</option>
													<option value="shared">Shared team calendar</option>
												</select>
											</label>
											{(feed.absenceAttribution ?? 'self') === 'self' ? (
												<label className={styles.feedField}>
													<span className={styles.feedFieldLabel}>
														Optional title filter
													</span>
													<input
														type="text"
														value={feed.titleFilter ?? ''}
														onChange={(e) =>
															updateCalendarFeed(index, {
																titleFilter: e.target.value || undefined,
															})
														}
														placeholder="Only titles containing your name"
														className={styles.feedInput}
													/>
												</label>
											) : (
												<div
													className={`${styles.feedField} ${styles.feedFieldHint}`}
												>
													<span className={styles.feedFieldLabel}>
														Attribution rules
													</span>
													<p className={styles.calendarModeHint}>
														Shared calendars use the assignment rules below to
														match event titles to the right teammate.
													</p>
												</div>
											)}
										</div>
									</div>
								))
							) : (
								<p className={styles.feedHelper}>
									No time off calendars yet. Leave this empty if target hours
									should always assume a full work week.
								</p>
							)}
						</div>
						{hasSharedAbsenceFeedsWithoutAssignments ? (
							<p className={styles.serviceHint}>
								At least one shared time-off calendar still needs assignment
								rules below so shared events reduce the right person’s target
								hours.
							</p>
						) : null}
					</div>

					<div className={styles.serviceActions}>
						<Button
							type="button"
							variant="secondary"
							onClick={testCalendar}
							disabled={integrationTests.calendar.loading || !hasCalendarFeeds}
						>
							{integrationTests.calendar.loading
								? 'Testing...'
								: 'Test calendars'}
						</Button>
					</div>
					{integrationTests.calendar.result ? (
						<p
							className={`${styles.testResult} ${integrationTests.calendar.result.success ? styles.testSuccess : styles.testError}`}
						>
							{integrationTests.calendar.result.message}
						</p>
					) : (
						<p className={styles.serviceHint}>
							Calendar tests confirm the feed URLs are reachable and parse as
							ICS/iCal. They do not yet validate whether your title filters or
							shared-calendar assignment rules are too broad.
						</p>
					)}

					<div id={SETTINGS_SECTION_IDS.calendarMappings}>
						<CalendarMappingsEditor
							mappings={calendarMappings}
							onAdd={addCalendarMapping}
							onUpdate={updateCalendarMapping}
							onRemove={removeCalendarMapping}
						/>
					</div>

					{showAbsenceAssignments ? (
						<TeamAbsenceAssignmentsEditor
							assignments={formData.absenceAssignments ?? []}
							userSuggestions={allowedUserSuggestions}
							onAdd={addAbsenceAssignment}
							onUpdate={updateAbsenceAssignment}
							onRemove={removeAbsenceAssignment}
						/>
					) : null}
				</section>
			</fieldset>

			<fieldset
				id={SETTINGS_SECTION_IDS.preferences}
				className={styles.section}
			>
				<legend className={styles.sectionTitle}>Preferences</legend>
				<div className={styles.formGroup}>
					<label htmlFor={themeId}>Theme</label>
					<select
						id={themeId}
						name="theme"
						value={formData.theme}
						onChange={handleSelectChange}
					>
						<option value="system">System</option>
						<option value="light">Light</option>
						<option value="dark">Dark</option>
					</select>
					<small>Choose light, dark, or follow your system preference</small>
				</div>
				<div className={styles.formGroup}>
					<label htmlFor={timeRoundingId}>Time Rounding</label>
					<select
						id={timeRoundingId}
						name="timeRounding"
						value={formData.timeRounding}
						onChange={handleSelectChange}
					>
						<option value="off">Off</option>
						<option value="15m">15 minutes</option>
						<option value="30m">30 minutes</option>
					</select>
					<small>Round suggestion durations to the nearest interval</small>
				</div>
			</fieldset>
		</div>
	);
};
