import type React from 'react';
import { useEffect, useId, useState } from 'react';
import type { CalendarFeed } from '../../../stores/useConfigStore';
import { useSettingsFormStore } from '../../../stores/useSettingsFormStore';
import { useUserDataStore } from '../../../stores/useUserDataStore';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';
import * as styles from './SettingsForm.module.css';

export const SettingsForm: React.FC = () => {
	const formData = useSettingsFormStore((state) => state.formData);
	const isTesting = useSettingsFormStore((state) => state.isTesting);
	const testResult = useSettingsFormStore((state) => state.testResult);
	const updateFormField = useSettingsFormStore(
		(state) => state.updateFormField,
	);
	const saveSettings = useSettingsFormStore((state) => state.saveSettings);
	const testConnection = useSettingsFormStore((state) => state.testConnection);
	const loadFromConfig = useSettingsFormStore((state) => state.loadFromConfig);

	const calendarMappings = useUserDataStore((s) => s.calendarMappings);
	const addCalendarMapping = useUserDataStore((s) => s.addCalendarMapping);
	const removeCalendarMapping = useUserDataStore(
		(s) => s.removeCalendarMapping,
	);
	const [newMappingPattern, setNewMappingPattern] = useState('');
	const [newMappingIssueKey, setNewMappingIssueKey] = useState('');

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
		saveSettings();
		toast.success('Settings saved');
	};

	const handleTestConnection = async () => {
		await testConnection();
	};

	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			<fieldset className={styles.section}>
				<legend className={styles.sectionTitle}>Connection</legend>
				<div className={styles.formGroup}>
					<label htmlFor={jiraHostId}>Jira Host</label>
					<input
						type="text"
						id={jiraHostId}
						name="jiraHost"
						value={formData.jiraHost}
						onChange={handleChange}
						placeholder="your-company.atlassian.net"
						required
					/>
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
					/>
					<small>
						Needed if your browser blocks direct Jira requests. Start with{' '}
						<code>npm run cors-proxy</code>
					</small>
				</div>
			</fieldset>

			<fieldset className={styles.section}>
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

			<fieldset className={styles.section}>
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

			<fieldset className={styles.section}>
				<legend className={styles.sectionTitle}>
					Integrations <span className={styles.optional}>optional</span>
				</legend>
				<small className={styles.permissionsHint}>
					Power the Dashboard suggestions. Leave blank to disable.
				</small>
				<div className={styles.formGroup}>
					<label htmlFor={gitlabHostId}>GitLab Host</label>
					<input
						type="text"
						id={gitlabHostId}
						name="gitlabHost"
						value={formData.gitlabHost}
						onChange={handleChange}
						placeholder="gitlab.com or vcs.company.net"
					/>
					<small>Hostname only, without https://</small>
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
					<small>Requires CORS proxy to be running</small>
				</div>

				<div className={styles.formGroup}>
					<span className={styles.calendarHeading}>
						Calendar Feeds (ICS/iCal)
					</span>
					<small>
						Add calendar feed URLs to suggest worklogs from meetings. Works with
						Google Calendar, Outlook, and Teams. Events with Jira issue keys in
						their title or description will generate suggestions.
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
								{ label: '', url: '' },
							];
							updateFormField('calendarFeeds', feeds as never);
						}}
					>
						+ Add calendar
					</button>
				</div>
			</fieldset>

			{calendarMappings.length > 0 ||
			(formData.calendarFeeds ?? []).length > 0 ? (
				<fieldset className={styles.section}>
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

			<fieldset className={styles.section}>
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

			<div className={styles.buttonGroup}>
				<Button type="submit">Save</Button>
				<Button
					type="button"
					onClick={handleTestConnection}
					disabled={isTesting}
					variant="secondary"
				>
					{isTesting ? 'Testing...' : 'Test Connection'}
				</Button>
			</div>
			{testResult && (
				<p
					className={testResult.success ? styles.successText : styles.errorText}
				>
					{testResult.message}
				</p>
			)}
		</form>
	);
};
