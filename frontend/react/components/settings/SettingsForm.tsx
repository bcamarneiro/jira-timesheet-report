import type React from 'react';
import { useEffect, useId } from 'react';
import { useSettingsFormStore } from '../../../stores/useSettingsFormStore';
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

	const jiraHostId = useId();
	const emailId = useId();
	const apiTokenId = useId();
	const corsProxyId = useId();
	const jqlFilterId = useId();
	const allowedUsersId = useId();

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
