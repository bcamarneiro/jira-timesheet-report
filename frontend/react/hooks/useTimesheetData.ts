import { useEffect, useMemo, useState } from 'react';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import type { ProjectConfig } from '../../../types/ProjectConfig';

export type GroupedWorklogs = Record<string, Record<string, JiraWorklog[]>>;

export type UseTimesheetDataResult = {
  data: JiraWorklog[] | null;
  jiraDomain: string;
  issueSummaries: Record<string, string>;
  teamDevelopers: string[] | null;
  users: string[];
  grouped: GroupedWorklogs;
  visibleEntries: [string, Record<string, JiraWorklog[]>][];
};

export function useTimesheetData(
  currentYear: number,
  currentMonth: number,
  selectedUser: string,
  projectConfig?: ProjectConfig
): UseTimesheetDataResult {
  const [data, setData] = useState<JiraWorklog[] | null>(null);
  const [jiraDomain, setJiraDomain] = useState('');
  const [issueSummaries, setIssueSummaries] = useState<Record<string, string>>({});
  const [teamDevelopers, setTeamDevelopers] = useState<string[] | null>(null);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams();
      params.set('year', String(currentYear));
      params.set('month', String(currentMonth + 1));
      
      const res = await fetch(`/api/timesheet?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectConfig: projectConfig || {}
        })
      });
      
      const json = await res.json();
      setJiraDomain(json.jiraDomain);
      setData(json.worklogs as JiraWorklog[]);
      setIssueSummaries((json.issueSummaries || {}) as Record<string, string>);
      const td: string[] = Array.isArray(json.teamDevelopers) ? json.teamDevelopers : [];
      setTeamDevelopers(td.length > 0 ? td : null);
    })();
  }, [currentYear, currentMonth, projectConfig]);

  const users = useMemo(() => {
    if (!data) return [] as string[];
    const unique: Record<string, true> = {};
    data.forEach(wl => { unique[wl.author.displayName] = true; });
    let list = Object.keys(unique);
    if (teamDevelopers && teamDevelopers.length > 0) {
      list = list.filter(name => teamDevelopers.includes(name));
    }
    return list.sort();
  }, [data, teamDevelopers]);

  const grouped: GroupedWorklogs = useMemo(() => {
    const map: GroupedWorklogs = {};
    (data || []).forEach((wl) => {
      const user = wl.author.displayName;
      const date = new Date(wl.started).toISOString().substring(0, 10);
      if (!map[user]) map[user] = {};
      if (!map[user][date]) map[user][date] = [];
      map[user][date].push(wl);
    });
    return map;
  }, [data]);

  const visibleEntries = useMemo(() => {
    return Object.entries(grouped)
      .filter(([user]) => (selectedUser === '' || user === selectedUser))
      .filter(([user]) => !teamDevelopers || teamDevelopers.includes(user));
  }, [grouped, selectedUser, teamDevelopers]);

  return {
    data,
    jiraDomain,
    issueSummaries,
    teamDevelopers,
    users,
    grouped,
    visibleEntries
  };
}


