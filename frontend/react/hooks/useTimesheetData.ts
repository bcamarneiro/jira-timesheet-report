import { useMemo } from 'react';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import type { ProjectConfig } from '../../../types/ProjectConfig';
import type { PersonalConfig } from '../../../types/PersonalConfig';
import { useTimesheetApi } from './useTimesheetApi';

export type GroupedWorklogs = Record<string, Record<string, JiraWorklog[]>>;

export type UseTimesheetDataResult = {
  data: JiraWorklog[] | null;
  jiraDomain: string;
  issueSummaries: Record<string, string>;
  teamDevelopers: string[] | null;
  users: string[];
  grouped: GroupedWorklogs;
  visibleEntries: [string, Record<string, JiraWorklog[]>][];
  loading: boolean;
  error: string | null;
};

export function useTimesheetData(
  currentYear: number,
  currentMonth: number,
  selectedUser: string,
  projectConfig?: ProjectConfig,
  personalConfig?: PersonalConfig
): UseTimesheetDataResult {
  const { data: apiData, loading, error } = useTimesheetApi(currentYear, currentMonth, projectConfig, personalConfig);
  
  const data = apiData?.worklogs || null;
  const jiraDomain = apiData?.jiraDomain || '';
  const issueSummaries = apiData?.issueSummaries || {};
  const teamDevelopers = apiData?.teamDevelopers && apiData.teamDevelopers.length > 0 ? apiData.teamDevelopers : null;

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
    visibleEntries,
    loading,
    error
  };
}


