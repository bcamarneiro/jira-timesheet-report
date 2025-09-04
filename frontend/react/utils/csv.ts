import type { JiraWorklog } from '../../../types/JiraWorklog';

function csvEscape(value: string): string {
  const safe = (value ?? '').replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
  if (safe.includes('"') || safe.includes(',') || safe.includes(';')) {
    return '"' + safe.replace(/"/g, '""') + '"';
  }
  return safe;
}

function parseOriginalDateFromComment(comment: string): string | null {
  const pattern = /Original Worklog Date was: (\d{4}\/\d{2}\/\d{2})/;
  const match = comment.match(pattern);
  if (match) {
    return match[1];
  }
  return null;
}

export function buildCsvForUser(data: JiraWorklog[], issueSummaries: Record<string, string>, user: string, year: number, month: number): string {
  if (!data) return '';
  const rows: string[] = [];
  rows.push(['Name', 'TicketKey', 'TicketName', 'ActualLoggedDate', 'OriginalIntendedDate', 'BookedTime'].join(','));
  
  // Filter worklogs by user and by actual logged date within the selected month
  const filteredData = data
    .filter(wl => wl.author.displayName === user)
    .filter(wl => {
      const actualLoggedDate = new Date(wl.started);
      return actualLoggedDate.getFullYear() === year && actualLoggedDate.getMonth() === month;
    });
  
  filteredData
    .sort((a, b) => {
      // Primary sort: ActualLoggedDate (started field)
      const actualDateA = new Date(a.started).getTime();
      const actualDateB = new Date(b.started).getTime();
      
      if (actualDateA !== actualDateB) {
        return actualDateA - actualDateB;
      }
      
      // Secondary sort: OriginalIntendedDate
      const originalDateA = parseOriginalDateFromComment(a.comment) || a.started;
      const originalDateB = parseOriginalDateFromComment(b.comment) || b.started;
      return new Date(originalDateA).getTime() - new Date(originalDateB).getTime();
    })
    .forEach(wl => {
      const key = wl.issueKey ?? String(wl.issueId);
      const ticketName = issueSummaries[key] || '';
      const actualLoggedDate = new Date(wl.started).toISOString().substring(0, 10);
      const originalIntendedDate = new Date(parseOriginalDateFromComment(wl.comment) || actualLoggedDate).toISOString().substring(0, 10);
      const bookedHours = (wl.timeSpentSeconds / 3600).toFixed(2);
      rows.push([
        csvEscape(user),
        csvEscape(key),
        csvEscape(ticketName),
        csvEscape(actualLoggedDate),
        csvEscape(originalIntendedDate),
        csvEscape(bookedHours)
      ].join(','));
    });
  return rows.join('\n');
}

export function download(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


