import { useEffect, useState } from 'react';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import type { ProjectConfig } from '../../../types/ProjectConfig';

export type TimesheetApiResponse = {
  worklogs: JiraWorklog[];
  jiraDomain: string;
  issueSummaries: Record<string, string>;
  teamDevelopers: string[];
};

export function useTimesheetApi(
  currentYear: number,
  currentMonth: number,
  projectConfig?: ProjectConfig
) {
  const [data, setData] = useState<TimesheetApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
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
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const json = await res.json();
        setData({
          worklogs: json.worklogs as JiraWorklog[],
          jiraDomain: json.jiraDomain,
          issueSummaries: json.issueSummaries || {},
          teamDevelopers: Array.isArray(json.teamDevelopers) ? json.teamDevelopers : []
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentYear, currentMonth, projectConfig]);

  return { data, loading, error };
}
