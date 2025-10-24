import { useJiraClientStore } from '../../stores/useJiraClientStore';

export const useJiraClient = () => {
	const getClient = useJiraClientStore((state) => state.getClient);
	return getClient();
};
