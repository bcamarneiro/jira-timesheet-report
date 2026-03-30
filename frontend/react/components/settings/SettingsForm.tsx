import type React from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import type { CalendarFeed } from '../../../stores/useConfigStore';
import { useConfigStore } from '../../../stores/useConfigStore';
import { useSettingsFormStore } from '../../../stores/useSettingsFormStore';
import { useUserDataStore } from '../../../stores/useUserDataStore';
import {
	createSettingsBackup,
	createSettingsSharePack,
	parseSettingsBackup,
} from '../../utils/settingsBackup';
import { SETTINGS_SECTION_IDS } from '../../constants/settingsSections';
import { downloadAsFile } from '../../utils/downloadFile';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';
import * as styles from './SettingsForm.module.css';

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
	const replaceCalendarMappings = useUserDataStore(
		(s) => s.replaceCalendarMappings,
	);
	const [newMappingPattern, setNewMappingPattern] = useState('');
	const [newMappingIssueKey, setNewMappingIssueKey] = useState('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleAddMapping = () => {
		const pattern = newMappingPattern.trim();
		const issueKey = newMappingIssueKey.trim().toUpperCase();
		if (!pattern || !issueKey) return;
		addCalendarMapping({ pattern, issueKey });
		setNewMappingPattern('');
		setNewMappingIssueKey('');
	};

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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isDirty) return;
		saveSettings();
		toast.success('Settings saved');
	};

	const handleExportSettings = () => {
		const backup = createSettingsBackup(savedConfig, calendarMappings);
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
		<form
			id={SETTINGS_SECTION_IDS.form}
			onSubmit={handleSubmit}
			className={styles.form}
		>
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
					<Button type="submit" disabled={!isDirty}>
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
						Needed if your browser blocks direct Jira requests. Start with{' '}
						<code>npm run cors-proxy</code>
					</small>
				</div>
			</fieldset>

			<fieldset id={SETTINGS_SECTION_IDS.scope} className={styles.section}>
				<legend className={styles.sectionTitle}>Filters</legend>
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
						Allowed Users <span className={styles.optional}>optional</span>
					</label>
					<input
						type="text"
						id={allowedUsersId}
						name="allowedUsers"
						value={formData.allowedUsers}
						onChange={handleChange}
						placeholder="john@example.com, jane@example.com"
					/>
					<small>Comma-separated emails. Empty shows all users.</small>
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
					<div className={styles.sectionHeader}>
						<span>
							Integrations <span className={styles.optional}>optional</span>
						</span>
					</div>
				</legend>
				<small className={styles.permissionsHint}>
					Power the Dashboard suggestions. Leave blank to disable.
				</small>
				<div className={styles.formGroup}>
					<label htmlFor={gitlabHostId}>
						GitLab Host
						{(formData.gitlabHost || formData.gitlabToken) && (
							<button
								type="button"
								className={styles.testButton}
								onClick={testGitlab}
								disabled={integrationTests.gitlab.loading || !canTestGitlab}
							>
								{integrationTests.gitlab.loading ? 'Testing...' : 'Test'}
							</button>
						)}
					</label>
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
						Hostname only is ideal, but pasted <code>https://</code> URLs are
						normalized for you
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
						Personal access token with <code>read_user</code> scope
					</small>
					{integrationTests.gitlab.result && (
						<p
							className={`${styles.testResult} ${integrationTests.gitlab.result.success ? styles.testSuccess : styles.testError}`}
						>
							{integrationTests.gitlab.result.message}
						</p>
					)}
				</div>
				<div className={styles.formGroup}>
					<label htmlFor={rescueTimeKeyId}>
						RescueTime API Key
						{formData.rescueTimeApiKey && (
							<button
								type="button"
								className={styles.testButton}
								onClick={testRescueTime}
								disabled={
									integrationTests.rescuetime.loading || !canTestRescueTime
								}
							>
								{integrationTests.rescuetime.loading ? 'Testing...' : 'Test'}
							</button>
						)}
					</label>
					<input
						type="password"
						id={rescueTimeKeyId}
						name="rescueTimeApiKey"
						value={formData.rescueTimeApiKey}
						onChange={handleChange}
					/>
					<small>Requires CORS proxy to be running</small>
					{integrationTests.rescuetime.result && (
						<p
							className={`${styles.testResult} ${integrationTests.rescuetime.result.success ? styles.testSuccess : styles.testError}`}
						>
							{integrationTests.rescuetime.result.message}
						</p>
					)}
				</div>

				<div className={styles.formGroup}>
					<span className={styles.calendarHeading}>
						Calendar Feeds (ICS/iCal)
						{hasCalendarFeeds && (
							<button
								type="button"
								className={styles.testButton}
								onClick={testCalendar}
								disabled={integrationTests.calendar.loading}
							>
								{integrationTests.calendar.loading ? 'Testing...' : 'Test'}
							</button>
						)}
					</span>
					<small>
						Add calendar feed URLs. <strong>Suggestions</strong>: generate
						worklog suggestions from meetings (events with Jira keys).{' '}
						<strong>Absence/Vacation</strong>: detect all-day events as vacation
						days to reduce target hours. Works with Google Calendar, Outlook,
						and Teams.
					</small>
					{(formData.calendarFeeds ?? []).map((feed, idx) => (
						<div
							key={`cal-${idx.toString()}`}
							className={styles.calendarFeedRow}
						>
							<input
								type="text"
								value={feed.label}
								onChange={(e) => {
									const feeds = [...(formData.calendarFeeds ?? [])];
									feeds[idx] = { ...feeds[idx], label: e.target.value };
									updateFormField('calendarFeeds', feeds as never);
								}}
								placeholder="Label (e.g. Work, Personal)"
								className={styles.calendarLabel}
							/>
							<select
								value={feed.type || 'suggestion'}
								onChange={(e) => {
									const feeds = [...(formData.calendarFeeds ?? [])];
									feeds[idx] = {
										...feeds[idx],
										type: e.target.value as 'suggestion' | 'absence',
									};
									updateFormField('calendarFeeds', feeds as never);
								}}
								className={styles.calendarType}
							>
								<option value="suggestion">Suggestions</option>
								<option value="absence">Absence/Vacation</option>
							</select>
							<input
								type="text"
								value={feed.url}
								onChange={(e) => {
									const feeds = [...(formData.calendarFeeds ?? [])];
									feeds[idx] = { ...feeds[idx], url: e.target.value };
									updateFormField('calendarFeeds', feeds as never);
								}}
								placeholder="https://calendar.google.com/...basic.ics"
								className={styles.calendarUrl}
							/>
							<button
								type="button"
								className={styles.calendarRemove}
								onClick={() => {
									const feeds = (formData.calendarFeeds ?? []).filter(
										(_, i) => i !== idx,
									);
									updateFormField('calendarFeeds', feeds as never);
								}}
								aria-label={`Remove ${feed.label || 'calendar feed'}`}
							>
								&times;
							</button>
						</div>
					))}
					<button
						type="button"
						className={styles.calendarAdd}
						onClick={() => {
							const feeds: CalendarFeed[] = [
								...(formData.calendarFeeds ?? []),
								{ label: '', url: '', type: 'suggestion' },
							];
							updateFormField('calendarFeeds', feeds as never);
						}}
					>
						+ Add calendar
					</button>
					{integrationTests.calendar.result && (
						<p
							className={`${styles.testResult} ${integrationTests.calendar.result.success ? styles.testSuccess : styles.testError}`}
						>
							{integrationTests.calendar.result.message}
						</p>
					)}
				</div>
			</fieldset>

			{calendarMappings.length > 0 ||
			(formData.calendarFeeds ?? []).length > 0 ? (
				<fieldset
					id={SETTINGS_SECTION_IDS.calendarMappings}
					className={styles.section}
				>
					<legend className={styles.sectionTitle}>Calendar Mappings</legend>
					<small className={styles.permissionsHint}>
						Map calendar event titles to Jira issues. Events matching these
						patterns will automatically generate worklog suggestions.
					</small>
					{calendarMappings.map((mapping) => (
						<div key={mapping.pattern} className={styles.calendarFeedRow}>
							<input
								type="text"
								value={mapping.pattern}
								readOnly
								className={styles.calendarLabel}
								title="Event pattern"
							/>
							<input
								type="text"
								value={mapping.issueKey}
								readOnly
								className={styles.calendarUrl}
								title="Jira issue key"
							/>
							<button
								type="button"
								className={styles.calendarRemove}
								onClick={() => removeCalendarMapping(mapping.pattern)}
								aria-label={`Remove mapping for ${mapping.pattern}`}
							>
								&times;
							</button>
						</div>
					))}
					<div className={styles.calendarFeedRow}>
						<input
							type="text"
							value={newMappingPattern}
							onChange={(e) => setNewMappingPattern(e.target.value)}
							placeholder="Event title pattern"
							className={styles.calendarLabel}
						/>
						<input
							type="text"
							value={newMappingIssueKey}
							onChange={(e) => setNewMappingIssueKey(e.target.value)}
							placeholder="PROJ-123"
							className={styles.calendarUrl}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									handleAddMapping();
								}
							}}
						/>
						<button
							type="button"
							className={styles.calendarAdd}
							onClick={handleAddMapping}
							disabled={!newMappingPattern.trim() || !newMappingIssueKey.trim()}
							style={{ flex: '0 0 auto', borderStyle: 'solid' }}
						>
							+ Add
						</button>
					</div>
				</fieldset>
			) : null}

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
		</form>
	);
};
