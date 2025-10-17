import { Version3Client } from 'jira.js';
import { useConfigStore } from '../../stores/useConfigStore';

export const useJiraClient = () => {
	const { config } = useConfigStore();

	if (!config.jiraHost || !config.apiToken) {
		return null;
	}

	const host = config.corsProxy
		? `${config.corsProxy.replace(/\/$/, '')}/https://${config.jiraHost}`
		: `https://${config.jiraHost}`;

	return new Version3Client({
		host,
		authentication: {
			basic: {
				email: config.email,
				apiToken: config.apiToken,
			},
		},
	});
};
