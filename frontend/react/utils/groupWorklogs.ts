import type { JiraWorklog } from '../../../types/JiraWorklog';
import { toLocalDateString } from './date';

export type GroupedWorklogs = Record<string, Record<string, JiraWorklog[]>>;

export function groupWorklogsByUserAndDate(
	worklogs: JiraWorklog[] | null,
): GroupedWorklogs {
	const map: GroupedWorklogs = {};
	(worklogs || []).forEach((wl) => {
		const user = wl.author?.displayName;
		const started = wl.started;
		// Drop worklogs that are missing the author or started date — defensive
		// against malformed Jira responses; production hits this path with
		// well-formed data.
		if (!user || !started) return;
		const date = toLocalDateString(started);
		if (!map[user]) map[user] = {};
		if (!map[user][date]) map[user][date] = [];
		map[user][date].push(wl);
	});
	return map;
}
