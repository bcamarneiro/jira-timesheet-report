import type React from 'react';
import { useEffect, useId } from 'react';
import { useSettingsFormStore } from '../../../stores/useSettingsFormStore';
import { Button } from '../ui/Button';
import * as styles from './SettingsForm.module.css';

export const SettingsForm: React.FC = () => {
	// Access the settings form store
	const formData = useSettingsFormStore((state) => state.formData);
	const isTesting = useSettingsFormStore((state) => state.isTesting);
	const testResult = useSettingsFormStore((state) => state.testResult);
	const updateFormField = useSettingsFormStore((state) => state.updateFormField);
	const saveSettings = useSettingsFormStore((state) => state.saveSettings);
	const testConnection = useSettingsFormStore((state) => state.testConnection);
	const loadFromConfig = useSettingsFormStore((state) => state.loadFromConfig);

	const jiraHostId = useId();
	const emailId = useId();
	const apiTokenId = useId();
	const corsProxyId = useId();
	const jqlFilterId = useId();

	// Load form data from config on mount
	useEffect(() => {
		loadFromConfig();
	}, [loadFromConfig]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		updateFormField(name as keyof typeof formData, value);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		saveSettings();
		alert('Settings saved!');
	};

	const handleTestConnection = async () => {
		await testConnection();
	};

	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			<div className={styles.formGroup}>
				<label htmlFor={jiraHostId}>Jira Host</label>
				<input
					type="text"
					id={jiraHostId}
					name="jiraHost"
					value={formData.jiraHost}
					onChange={handleChange}
					placeholder="e.g., your-company.atlassian.net"
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
					placeholder="e.g., your-email@example.com"
					required
				/>
			</div>
			<div className={styles.formGroup}>
				<label htmlFor={apiTokenId}>Personal Access Token</label>
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
				<label htmlFor={corsProxyId}>CORS Proxy (Optional)</label>
				<input
					type="text"
					id={corsProxyId}
					name="corsProxy"
					value={formData.corsProxy}
					onChange={handleChange}
					placeholder="e.g., http://localhost:8081"
				/>
			</div>
			<div className={styles.formGroup}>
				<label htmlFor={jqlFilterId}>Additional JQL Filter (Optional)</label>
				<input
					type="text"
					id={jqlFilterId}
					name="jqlFilter"
					value={formData.jqlFilter}
					onChange={handleChange}
					placeholder="e.g., component = INV_III"
				/>
				<small>This filter will be applied to all timesheet queries</small>
			</div>
			<div className={styles.buttonGroup}>
				<Button type="submit">Save Settings</Button>
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
