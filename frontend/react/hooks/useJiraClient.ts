import { JiraClient } from '@narthia/jira-client';
import { useConfigStore } from '../../stores/useConfigStore';

export const useJiraClient = () => {
	const { config } = useConfigStore();

	if (!config.jiraHost || !config.apiToken) {
		return null;
	}

	return new JiraClient({
		host: config.jiraHost,
		authentication: {
			personalAccessToken: config.apiToken,
		},
		newErrorHandling: true,
		...(config.corsProxy && { proxy: config.corsProxy }),
	});
};
