import type React from 'react';
import { useId, useState } from 'react';
import type { Config } from '../../../stores/useConfigStore';
import { useConfigStore } from '../../../stores/useConfigStore';
import { Button } from '../ui/Button';
import styles from './SettingsForm.module.css';

export const SettingsForm: React.FC = () => {
	const { config, setConfig } = useConfigStore();
	const [formData, setFormData] = useState(config);

	const jiraHostId = useId();
	const emailId = useId();
	const apiTokenId = useId();
	const corsProxyId = useId();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev: Config) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setConfig(formData);
		alert('Settings saved!');
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
					placeholder="e.g., https://cors-anywhere.herokuapp.com/"
				/>
			</div>
			<Button type="submit">Save Settings</Button>
		</form>
	);
};
