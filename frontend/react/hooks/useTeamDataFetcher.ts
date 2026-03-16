import { useEffect } from 'react';
import { fetchTeamWorklogs } from '../../services/teamService';
import { useConfigStore } from '../../stores/useConfigStore';
import { useTeamStore } from '../../stores/useTeamStore';

export function useTeamDataFetcher() {
	const config = useConfigStore((s) => s.config);
	const weekStart = useTeamStore((s) => s.weekStart);
	const weekEnd = useTeamStore((s) => s.weekEnd);
	const setTeamMembers = useTeamStore((s) => s.setTeamMembers);
	const setLoading = useTeamStore((s) => s.setLoading);
	const setError = useTeamStore((s) => s.setError);

	useEffect(() => {
		if (!config.jiraHost || !config.apiToken) return;

		const controller = new AbortController();
		const { signal } = controller;

		async function run() {
			setError(null);
			setLoading(true);

			try {
				const members = await fetchTeamWorklogs(
					config,
					weekStart,
					weekEnd,
					signal,
				);
				if (!signal.aborted) {
					setTeamMembers(members);
				}
			} catch (e) {
				if (!signal.aborted) {
					setError(
						e instanceof Error ? e.message : 'Failed to fetch team data',
					);
				}
			} finally {
				if (!signal.aborted) {
					setLoading(false);
				}
			}
		}

		run();

		return () => controller.abort();
	}, [config, weekStart, weekEnd, setTeamMembers, setLoading, setError]);
}
