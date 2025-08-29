import type { JiraWorklog } from '../../../types/JiraWorklog';

function csvEscape(value: string): string {
  const safe = (value ?? '').replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
  if (safe.includes('"') || safe.includes(',') || safe.includes(';')) {
    return '"' + safe.replace(/"/g, '""') + '"';
  }
  return safe;
}

export function buildCsvForUser(data: JiraWorklog[], issueSummaries: Record<string, string>, user: string): string {
  if (!data) return '';
  const rows: string[] = [];
  rows.push(['Name', 'TicketKey', 'TicketName', 'Date', 'BookedTime'].join(','));
  data
    .filter(wl => wl.author.displayName === user)
    .sort((a, b) => new Date(a.started).getTime() - new Date(b.started).getTime())
    .forEach(wl => {
      const key = wl.issueKey ?? String(wl.issueId);
      const ticketName = issueSummaries[key] || '';
      const startedIso = new Date(wl.started).toISOString().substring(0, 10);
      const bookedHours = (wl.timeSpentSeconds / 3600).toFixed(2);
      rows.push([
        csvEscape(user),
        csvEscape(key),
        csvEscape(ticketName),
        csvEscape(startedIso),
        csvEscape(bookedHours)
      ].join(','));
    });
  return rows.join('\n');
}




