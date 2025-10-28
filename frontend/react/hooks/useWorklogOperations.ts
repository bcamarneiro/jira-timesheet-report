import { useState } from 'react';
import { useJiraClient } from './useJiraClient';
import { useConfigStore } from '../../stores/useConfigStore';
import type { EnrichedJiraWorklog } from '../../stores/useTimesheetStore';
import { useTimesheetStore } from '../../stores/useTimesheetStore';

export function useWorklogOperations() {
	const jiraClient = useJiraClient();
	const config = useConfigStore((state) => state.config);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const recomputeDerived = useTimesheetStore((state) => state.recomputeDerived);
	const data = useTimesheetStore((state) => state.data);
	const setData = useTimesheetStore((state) => state.setData);

	// Helper to build the full URL
	const buildUrl = (path: string): string => {
		const baseUrl = config.corsProxy
			? `${config.corsProxy.replace(/\/$/, '')}/https://${config.jiraHost}`
			: `https://${config.jiraHost}`;
		return `${baseUrl}${path}`;
	};

	// Helper to make authenticated requests
	const makeRequest = async (url: string, options: RequestInit = {}) => {
		const headers: HeadersInit = {
			'Authorization': `Bearer ${config.apiToken}`,
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-Atlassian-Token': 'no-check',
			...options.headers,
		};

		const response = await fetch(url, {
			...options,
			headers,
		});

		if (!response.ok) {
			const text = await response.text();
			throw new Error(`Jira API error: ${response.status} - ${text}`);
		}

		return response.json();
	};

	const createWorklog = async (params: {
		issueKey: string;
		timeSpent: string;
		comment: string;
		started: string;
	}) => {
		if (!config.jiraHost || !config.apiToken) {
			throw new Error('Jira client not configured');
		}

		setIsLoading(true);
		setError(null);

		try {
			// First, validate that the issue exists
			const issueUrl = buildUrl(`/rest/api/2/issue/${params.issueKey}?fields=summary,issuetype,parent,project,status`);
			const issue = await makeRequest(issueUrl);

			if (!issue) {
				throw new Error(`Issue ${params.issueKey} not found`);
			}

			// Create the worklog
			const worklogUrl = buildUrl(`/rest/api/2/issue/${params.issueKey}/worklog`);
			const newWorklog = await makeRequest(worklogUrl, {
				method: 'POST',
				body: JSON.stringify({
					timeSpent: params.timeSpent,
					comment: params.comment,
					started: new Date(params.started).toISOString(),
				}),
			});

			// Add the new worklog to the store with issue info
			const enrichedWorklog: EnrichedJiraWorklog = {
				...newWorklog,
				issue: issue,
			};

			const updatedData = [...(data || []), enrichedWorklog];
			setData(updatedData);

			return enrichedWorklog;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to create worklog';
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const updateWorklog = async (
		issueKey: string,
		worklogId: string,
		params: {
			timeSpent: string;
			comment: string;
			started: string;
		},
	) => {
		if (!config.jiraHost || !config.apiToken) {
			throw new Error('Jira client not configured');
		}

		setIsLoading(true);
		setError(null);

		try {
			const worklogUrl = buildUrl(`/rest/api/2/issue/${issueKey}/worklog/${worklogId}`);
			const updatedWorklog = await makeRequest(worklogUrl, {
				method: 'PUT',
				body: JSON.stringify({
					timeSpent: params.timeSpent,
					comment: params.comment,
					started: new Date(params.started).toISOString(),
				}),
			});

			// Update in the store
			const updatedData = data?.map((wl) => {
				if (wl.id === worklogId) {
					return {
						...updatedWorklog,
						issue: wl.issue,
					};
				}
				return wl;
			});

			setData(updatedData || null);

			return updatedWorklog;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to update worklog';
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const deleteWorklog = async (issueKey: string, worklogId: string) => {
		if (!config.jiraHost || !config.apiToken) {
			throw new Error('Jira client not configured');
		}

		setIsLoading(true);
		setError(null);

		try {
			const worklogUrl = buildUrl(`/rest/api/2/issue/${issueKey}/worklog/${worklogId}`);
			await makeRequest(worklogUrl, {
				method: 'DELETE',
			});

			// Remove from the store
			const updatedData = data?.filter((wl) => wl.id !== worklogId);
			setData(updatedData || null);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to delete worklog';
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		createWorklog,
		updateWorklog,
		deleteWorklog,
		isLoading,
		error,
	};
}
