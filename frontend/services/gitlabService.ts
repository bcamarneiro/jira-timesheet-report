import type { WorklogSuggestion } from '../../types/Suggestion';

const JIRA_KEY_RE = /([A-Z][A-Z0-9]+-\d+)/g;

interface GitLabEvent {
	action_name: string;
	created_at: string;
	target_type?: string;
	target_title?: string;
	note?: {
		body?: string;
		noteable_type?: string;
	};
	push_data?: {
		commit_title?: string;
		ref?: string;
		commit_count?: number;
	};
}

type ActivityType = 'push' | 'mr-action' | 'review';

interface ActivityEntry {
	type: ActivityType;
	count: number;
	reasons: string[];
}

const PUSH_ACTIONS = new Set(['pushed to', 'pushed new']);
const MR_ACTIONS = new Set([
	'accepted',
	'merged',
	'opened',
	'closed',
	'approved',
]);
const REVIEW_ACTIONS = new Set(['commented on']);

function extractJiraKeys(text: string): string[] {
	const matches = text.match(JIRA_KEY_RE);
	return matches ? [...new Set(matches)] : [];
}

function dateOnly(iso: string): string {
	return iso.slice(0, 10);
}

function isPushEvent(action: string): boolean {
	return PUSH_ACTIONS.has(action);
}

function isMrActionEvent(event: GitLabEvent): boolean {
	return (
		MR_ACTIONS.has(event.action_name) && event.target_type === 'MergeRequest'
	);
}

function isReviewEvent(event: GitLabEvent): boolean {
	return (
		REVIEW_ACTIONS.has(event.action_name) &&
		(event.target_type === 'MergeRequest' ||
			event.note?.noteable_type === 'MergeRequest')
	);
}

function getEntry(
	map: Map<string, ActivityEntry>,
	mapKey: string,
	type: ActivityType,
): ActivityEntry {
	let entry = map.get(mapKey);
	if (!entry) {
		entry = { type, count: 0, reasons: [] };
		map.set(mapKey, entry);
	}
	return entry;
}

function formatReason(entry: ActivityEntry): string {
	const { type, count, reasons } = entry;
	const snippet =
		reasons.length > 0
			? `: ${reasons.slice(0, 2).join('; ')}${reasons.length > 2 ? '...' : ''}`
			: '';

	switch (type) {
		case 'push':
			return `${count} commit${count > 1 ? 's' : ''}${snippet}`;
		case 'mr-action':
			return `${count} MR action${count > 1 ? 's' : ''}${snippet}`;
		case 'review':
			return `${count} review comment${count > 1 ? 's' : ''}${snippet}`;
	}
}

const TIME_ESTIMATES: Record<ActivityType, { perUnit: number; max: number }> = {
	push: { perUnit: 3600, max: 4 * 3600 },
	'mr-action': { perUnit: 1800, max: 2 * 3600 },
	review: { perUnit: 900, max: 2 * 3600 },
};

function estimateSeconds(type: ActivityType, count: number): number {
	const { perUnit, max } = TIME_ESTIMATES[type];
	return Math.min(count * perUnit, max);
}

function estimateConfidence(
	type: ActivityType,
	count: number,
): 'high' | 'medium' | 'low' {
	if (type === 'push') return count >= 3 ? 'high' : 'medium';
	if (type === 'mr-action') return 'medium';
	return count >= 3 ? 'medium' : 'low';
}

/**
 * Fetch the user's recent GitLab events (pushes, MR actions, review comments)
 * and extract Jira issue keys to build worklog suggestions.
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

	// Group activities by (date, issueKey, activityType)
	const grouped = new Map<string, ActivityEntry>();

	for (const event of allEvents) {
		const day = dateOnly(event.created_at);
		if (day < weekStart || day > weekEnd) continue;

		if (isPushEvent(event.action_name)) {
			const pushData = event.push_data;
			if (!pushData) continue;

			const branchKeys = pushData.ref ? extractJiraKeys(pushData.ref) : [];
			const titleKeys = pushData.commit_title
				? extractJiraKeys(pushData.commit_title)
				: [];
			const keys = [...new Set([...branchKeys, ...titleKeys])];
			if (keys.length === 0) continue;

			const commits = pushData.commit_count || 1;
			for (const key of keys) {
				const entry = getEntry(grouped, `${day}::${key}::push`, 'push');
				entry.count += commits;
				if (pushData.commit_title) {
					entry.reasons.push(pushData.commit_title.slice(0, 80));
				}
			}
		} else if (isMrActionEvent(event)) {
			const title = event.target_title || '';
			const keys = extractJiraKeys(title);
			if (keys.length === 0) continue;

			const label = event.action_name;
			for (const key of keys) {
				const entry = getEntry(
					grouped,
					`${day}::${key}::mr-action`,
					'mr-action',
				);
				entry.count++;
				entry.reasons.push(`${label} MR: ${title.slice(0, 60)}`);
			}
		} else if (isReviewEvent(event)) {
			const title = event.target_title || event.note?.body || '';
			const noteBody = event.note?.body || '';
			const keys = [...extractJiraKeys(title), ...extractJiraKeys(noteBody)];
			const uniqueKeys = [...new Set(keys)];
			if (uniqueKeys.length === 0) continue;

			for (const key of uniqueKeys) {
				const entry = getEntry(grouped, `${day}::${key}::review`, 'review');
				entry.count++;
				const snippet =
					noteBody.length > 60
						? `${noteBody.slice(0, 57)}...`
						: noteBody || title.slice(0, 60);
				entry.reasons.push(snippet);
			}
		}
	}

	// Convert grouped entries to suggestions, merging activity types per (day, issueKey)
	const merged = new Map<
		string,
		{
			seconds: number;
			confidence: 'high' | 'medium' | 'low';
			reasons: string[];
		}
	>();

	for (const [mapKey, entry] of grouped) {
		const parts = mapKey.split('::');
		const day = parts[0];
		const issueKey = parts[1];
		const dayIssueKey = `${day}::${issueKey}`;

		const seconds = estimateSeconds(entry.type, entry.count);
		const confidence = estimateConfidence(entry.type, entry.count);

		const existing = merged.get(dayIssueKey);
		if (existing) {
			existing.seconds += seconds;
			existing.reasons.push(formatReason(entry));
			// Upgrade confidence
			const rank = { high: 2, medium: 1, low: 0 };
			if (rank[confidence] > rank[existing.confidence]) {
				existing.confidence = confidence;
			}
		} else {
			merged.set(dayIssueKey, {
				seconds,
				confidence,
				reasons: [formatReason(entry)],
			});
		}
	}

	const suggestions: WorklogSuggestion[] = [];

	for (const [dayIssueKey, data] of merged) {
		const [day, issueKey] = dayIssueKey.split('::');
		const cappedSeconds = Math.min(data.seconds, 6 * 3600);
		const hours = cappedSeconds / 3600;

		suggestions.push({
			id: `gitlab-${issueKey}-${day}`,
			source: 'gitlab',
			issueKey,
			date: day,
			suggestedTimeSpent:
				hours >= 1
					? `${Math.floor(hours)}h${hours % 1 >= 0.5 ? ' 30m' : ''}`
					: '30m',
			suggestedSeconds: cappedSeconds,
			confidence: data.confidence,
			reason: data.reasons.join(' + '),
			logged: false,
		});
	}

	return suggestions;
}

export { JIRA_KEY_RE, extractJiraKeys };
