import type { JiraWorklog } from '../../../types/JiraWorklog';
import { toLocalDateString } from './date';

export type GroupedWorklogs = Record<string, Record<string, JiraWorklog[]>>;

export function groupWorklogsByUserAndDate(
	worklogs: JiraWorklog[] | null,
): GroupedWorklogs {
	const map: GroupedWorklogs = {};
	(worklogs || []).forEach((wl) => {
		const user = wl.author.displayName;
		// Use local date to avoid timezone conversion issues
		const date = toLocalDateString(wl.started);
		if (!map[user]) map[user] = {};
		if (!map[user][date]) map[user][date] = [];
		map[user][date].push(wl);
	});
	return map;
}
