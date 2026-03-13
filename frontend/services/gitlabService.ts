import type { WorklogSuggestion } from '../../types/Suggestion';

const JIRA_KEY_RE = /([A-Z][A-Z0-9]+-\d+)/g;

interface GitLabEvent {
	action_name: string;
	created_at: string;
	push_data?: {
		commit_title?: string;
		ref?: string;
		commit_count?: number;
	};
}

function extractJiraKeys(text: string): string[] {
	const matches = text.match(JIRA_KEY_RE);
	return matches ? [...new Set(matches)] : [];
}

function dateOnly(iso: string): string {
	return iso.slice(0, 10);
}

/**
 * Fetch the user's recent GitLab push events and extract Jira issue keys
 * from commit messages and branch names.
 */
export async function fetchGitlabSuggestions(
	gitlabToken: string,
	gitlabHost: string,
	corsProxy: string,
	weekStart: string,
	weekEnd: string,
	signal?: AbortSignal,
): Promise<WorklogSuggestion[]> {
	if (!gitlabToken || !gitlabHost) return [];

	const suggestions: WorklogSuggestion[] = [];
	const cleanHost = gitlabHost.replace(/^https?:\/\//, '').replace(/\/$/, '');
	const gitlabOrigin = `https://${cleanHost}`;
	const baseUrl = corsProxy
		? `${corsProxy.replace(/\/$/, '')}/${gitlabOrigin}`
		: gitlabOrigin;

	// Fetch up to 3 pages of events (60 events)
	const allEvents: GitLabEvent[] = [];
	for (let page = 1; page <= 3; page++) {
		const params = new URLSearchParams({
			per_page: '20',
			page: String(page),
			after: weekStart,
			before: weekEnd,
		});
		const res = await fetch(`${baseUrl}/api/v4/events?${params}`, {
			headers: {
				'PRIVATE-TOKEN': gitlabToken,
				Accept: 'application/json',
			},
			signal,
		});
		if (!res.ok) {
			if (res.status === 401) throw new Error('Invalid GitLab token');
			throw new Error(`GitLab API error: ${res.status}`);
		}
		const events = (await res.json()) as GitLabEvent[];
		allEvents.push(...events);
		if (events.length < 20) break;
	}

	// Group pushes by (date, issueKey)
	const grouped = new Map<
		string,
		{ keys: Set<string>; commitCount: number; reasons: string[] }
	>();

	for (const event of allEvents) {
		if (event.action_name !== 'pushed to' && event.action_name !== 'pushed new')
			continue;

		const day = dateOnly(event.created_at);
		if (day < weekStart || day > weekEnd) continue;

		const pushData = event.push_data;
		if (!pushData) continue;

		const branchKeys = pushData.ref ? extractJiraKeys(pushData.ref) : [];
		const titleKeys = pushData.commit_title
			? extractJiraKeys(pushData.commit_title)
			: [];
		const allKeys = [...new Set([...branchKeys, ...titleKeys])];

		if (allKeys.length === 0) continue;

		const commits = pushData.commit_count || 1;

		for (const key of allKeys) {
			const mapKey = `${day}::${key}`;
			const existing = grouped.get(mapKey) || {
				keys: new Set<string>(),
				commitCount: 0,
				reasons: [],
			};
			existing.keys.add(key);
			existing.commitCount += commits;
			if (pushData.commit_title) {
				existing.reasons.push(pushData.commit_title.slice(0, 80));
			}
			grouped.set(mapKey, existing);
		}
	}

	for (const [mapKey, data] of grouped) {
		const [day, issueKey] = mapKey.split('::');
		// Estimate: 1h per commit, max 4h per issue per day
		const estimatedSeconds = Math.min(data.commitCount * 3600, 4 * 3600);
		const hours = estimatedSeconds / 3600;

		suggestions.push({
			id: `gitlab-${issueKey}-${day}`,
			source: 'gitlab',
			issueKey,
			date: day,
			suggestedTimeSpent: `${hours}h`,
			suggestedSeconds: estimatedSeconds,
			confidence: data.commitCount >= 3 ? 'high' : 'medium',
			reason: `${data.commitCount} commit${data.commitCount > 1 ? 's' : ''}: ${data.reasons.slice(0, 2).join('; ')}${data.reasons.length > 2 ? '...' : ''}`,
			logged: false,
		});
	}

	return suggestions;
}

export { JIRA_KEY_RE, extractJiraKeys };
