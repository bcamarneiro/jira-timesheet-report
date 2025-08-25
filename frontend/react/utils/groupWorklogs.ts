import type { JiraWorklog } from '../../../types/JiraWorklog';

export type GroupedWorklogs = Record<string, Record<string, JiraWorklog[]>>;

export function groupWorklogsByUserAndDate(worklogs: JiraWorklog[] | null): GroupedWorklogs {
  const map: GroupedWorklogs = {};
  (worklogs || []).forEach((wl) => {
    const user = wl.author.displayName;
    const date = new Date(wl.started).toISOString().substring(0, 10);
    if (!map[user]) map[user] = {};
    if (!map[user][date]) map[user][date] = [];
    map[user][date].push(wl);
  });
  return map;
}


