import type React from 'react';
import { SettingsForm } from '../components/settings/SettingsForm';
import * as styles from './SettingsPage.module.css';

export const SettingsPage: React.FC = () => {
	return (
		<div className={styles.container}>
			<h1>Settings</h1>
			<p>Configure your Jira connection details.</p>
			<SettingsForm />
		</div>
	);
};
