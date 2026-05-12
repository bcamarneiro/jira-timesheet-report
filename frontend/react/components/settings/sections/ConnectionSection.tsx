import type React from 'react';
import { SETTINGS_SECTION_IDS } from '../../../constants/settingsSections';
import * as styles from '../SettingsForm.module.css';

interface IntegrationTestResult {
	loading: boolean;
	result: { success: boolean; message: string } | null;
}

type Props = {
	formData: {
		jiraHost: string;
		email: string;
		apiToken: string;
		corsProxy: string;
	};
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	testJira: () => void;
	canTestJira: boolean;
	integrationTest: IntegrationTestResult;
	jiraHostId: string;
	emailId: string;
	apiTokenId: string;
	corsProxyId: string;
};

/**
 * Connection section: Jira host, email, API token, optional CORS proxy.
 * Owns its own "Test connection" button and the integration test result
 * banner. State and update callbacks come from the parent SettingsForm
 * so this component stays a pure renderer.
 */
export const ConnectionSection: React.FC<Props> = ({
	formData,
	handleChange,
	testJira,
	canTestJira,
	integrationTest,
	jiraHostId,
	emailId,
	apiTokenId,
	corsProxyId,
}) => {
	return (
		<fieldset id={SETTINGS_SECTION_IDS.connection} className={styles.section}>
			<legend className={styles.sectionTitle}>
				<div className={styles.sectionHeader}>
					<span>Connection</span>
					<button
						type="button"
						className={styles.testButton}
						onClick={testJira}
						disabled={integrationTest.loading || !canTestJira}
					>
						{integrationTest.loading ? 'Testing...' : 'Test'}
					</button>
				</div>
			</legend>
			{integrationTest.result && (
				<p
					className={`${styles.testResult} ${integrationTest.result.success ? styles.testSuccess : styles.testError}`}
				>
					{integrationTest.result.message}
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
					Start with <code>npm run cors-proxy</code>. If your environment needs
					SOCKS5, run <code>npm run cors-proxy:socks</code> and keep the same
					local proxy URL here.
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
	);
};
