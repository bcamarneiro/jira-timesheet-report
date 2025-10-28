import { useState } from 'react';
import { useJiraClient } from './useJiraClient';
import type { EnrichedJiraWorklog } from '../../stores/useTimesheetStore';
import { useTimesheetStore } from '../../stores/useTimesheetStore';

export function useWorklogOperations() {
	const jiraClient = useJiraClient();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const recomputeDerived = useTimesheetStore((state) => state.recomputeDerived);
	const data = useTimesheetStore((state) => state.data);
	const setData = useTimesheetStore((state) => state.setData);

	const createWorklog = async (params: {
		issueKey: string;
		timeSpent: string;
		comment: string;
		started: string;
	}) => {
		if (!jiraClient) {
			throw new Error('Jira client not configured');
		}

		setIsLoading(true);
		setError(null);

		try {
			// First, validate that the issue exists
			const issue = await jiraClient.issues.getIssue({
				issueIdOrKey: params.issueKey,
				fields: ['summary', 'issuetype', 'parent', 'project', 'status'],
			});

			if (!issue) {
				throw new Error(`Issue ${params.issueKey} not found`);
			}

			// Create the worklog
			const newWorklog = await jiraClient.issueWorklogs.addWorklog({
				issueIdOrKey: params.issueKey,
				timeSpent: params.timeSpent,
				comment: params.comment,
				started: new Date(params.started).toISOString(),
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
		if (!jiraClient) {
			throw new Error('Jira client not configured');
		}

		setIsLoading(true);
		setError(null);

		try {
			const updatedWorklog = await jiraClient.issueWorklogs.updateWorklog({
				issueIdOrKey: issueKey,
				id: worklogId,
				timeSpent: params.timeSpent,
				comment: params.comment,
				started: new Date(params.started).toISOString(),
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
		if (!jiraClient) {
			throw new Error('Jira client not configured');
		}

		setIsLoading(true);
		setError(null);

		try {
			await jiraClient.issueWorklogs.deleteWorklog({
				issueIdOrKey: issueKey,
				id: worklogId,
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
