import { useCallback } from 'react';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import { buildCsvForUser, download } from '../utils/csv';

export function useDownload() {
  const downloadUser = useCallback((
    user: string,
    data: JiraWorklog[],
    issueSummaries: Record<string, string>,
    currentYear: number,
    currentMonth: number
  ) => {
    const csv = data
      ? buildCsvForUser(data, issueSummaries, user, currentYear, currentMonth)
      : "";
    download(`${user.replace(/[^a-z0-9-_]/gi, "_")}.csv`, csv);
  }, []);

  const downloadAll = useCallback((
    users: string[],
    data: JiraWorklog[],
    issueSummaries: Record<string, string>,
    currentYear: number,
    currentMonth: number
  ) => {
    users.forEach((user) => {
      downloadUser(user, data, issueSummaries, currentYear, currentMonth);
    });
  }, [downloadUser]);

  return { downloadUser, downloadAll };
}

