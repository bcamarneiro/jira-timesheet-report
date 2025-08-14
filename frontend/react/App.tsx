import React, { useEffect, useMemo, useState } from 'react';
import type { JiraWorklog } from '../../types/JiraWorklog';

type Grouped = Record<string, Record<string, JiraWorklog[]>>;

function truncate(text: string, length = 20): string {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '…' : text;
}

export const App: React.FC = () => {
  const [data, setData] = useState<JiraWorklog[] | null>(null);
  const [jiraDomain, setJiraDomain] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [issueSummaries, setIssueSummaries] = useState<Record<string, string>>({});
  const [teamDevelopers, setTeamDevelopers] = useState<string[] | null>(null);
  const nowUtc = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(nowUtc.getUTCFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(nowUtc.getUTCMonth()); // 0-11

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const user = params.get('user');
    if (user) setSelectedUser(user);
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/timesheet');
      const json = await res.json();
      setJiraDomain(json.jiraDomain);
      setData(json.worklogs as JiraWorklog[]);
      setIssueSummaries((json.issueSummaries || {}) as Record<string, string>);
      const td: string[] = Array.isArray(json.teamDevelopers) ? json.teamDevelopers : [];
      setTeamDevelopers(td.length > 0 ? td : null);
    })();
  }, []);

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

  const grouped: Grouped = useMemo(() => {
    const map: Grouped = {};
    (data || []).forEach((wl) => {
      const user = wl.author.displayName;
      const date = new Date(wl.started).toISOString().substring(0, 10);
      if (!map[user]) map[user] = {};
      if (!map[user][date]) map[user][date] = [];
      map[user][date].push(wl);
    });
    return map;
  }, [data]);

  const handleUserChange = (value: string) => {
    setSelectedUser(value);
    const url = new URL(window.location.href);
    if (value) url.searchParams.set('user', value); else url.searchParams.delete('user');
    window.history.pushState({}, '', url.toString());
  };

  function csvEscape(value: string): string {
    const safe = (value ?? '').replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
    if (safe.includes('"') || safe.includes(',') || safe.includes(';')) {
      return '"' + safe.replace(/"/g, '""') + '"';
    }
    return safe;
  }

  function buildCsvForUser(user: string): string {
    if (!data) return '';
    const rows: string[] = [];
    rows.push(['Name', 'TicketKey', 'TicketName', 'Date', 'BookedTime'].join(','));
    (data || [])
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

  function download(filename: string, content: string) {
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

  function handleDownloadUser(user: string) {
    const csv = buildCsvForUser(user);
    download(`${user.replace(/[^a-z0-9-_]/gi, '_')}.csv`, csv);
  }

  function handleDownloadAll(visibleUsers: string[]) {
    visibleUsers.forEach(user => handleDownloadUser(user));
  }

  if (!data) return <p>Loading...</p>;

  function getMonthStartWeekday(year: number, monthZeroIndexed: number): number {
    return new Date(Date.UTC(year, monthZeroIndexed, 1)).getUTCDay(); // 0 (Sun) - 6 (Sat)
  }

  function getDaysInMonth(year: number, monthZeroIndexed: number): number {
    return new Date(Date.UTC(year, monthZeroIndexed + 1, 0)).getUTCDate();
  }

  function isoDateFromYMD(year: number, monthZeroIndexed: number, day: number): string {
    // Ensure keys match the grouping strategy (UTC ISO yyyy-mm-dd)
    const d = new Date(Date.UTC(year, monthZeroIndexed, day));
    return d.toISOString().substring(0, 10);
  }

  function monthLabel(year: number, monthZeroIndexed: number): string {
    return new Date(Date.UTC(year, monthZeroIndexed, 1)).toLocaleString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  }

  function goPrevMonth() {
    setCurrentMonth((m) => {
      if (m === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function goNextMonth() {
    setCurrentMonth((m) => {
      if (m === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h1>Timesheet</h1>
      <input
        type="text"
        value={selectedUser}
        onChange={(e) => handleUserChange(e.target.value)}
        placeholder="Enter user name"
        list="users"
      />
      <datalist id="users">
        {users.map(u => (<option key={u} value={u} />))}
      </datalist>

      <div style={{ margin: '0.5em 0' }}>
        <button onClick={() => handleDownloadAll(
          Object.keys(grouped)
            .filter(user => (selectedUser === '' || user === selectedUser))
            .filter(user => !teamDevelopers || teamDevelopers.includes(user))
        )}>Download CSV for all</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '1em' }}>
        <button onClick={goPrevMonth}>{'←'}</button>
        <div style={{ fontWeight: 'bold' }}>{monthLabel(currentYear, currentMonth)}</div>
        <button onClick={goNextMonth}>{'→'}</button>
      </div>

      {Object.entries(grouped)
        .filter(([user]) => (selectedUser === '' || user === selectedUser))
        .filter(([user]) => !teamDevelopers || teamDevelopers.includes(user))
        .map(([user, days]) => {
          const firstWeekday = getMonthStartWeekday(currentYear, currentMonth);
          const numDays = getDaysInMonth(currentYear, currentMonth);

          const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

          let userTotalSeconds = 0;

          const cells: React.ReactNode[] = [];
          // Leading empty cells before day 1
          for (let i = 0; i < firstWeekday; i++) {
            cells.push(
              <div key={`empty-${i}`} style={{ border: '1px solid #eee', minHeight: 100, padding: '0.5em', background: '#fafafa' }} />
            );
          }

          for (let d = 1; d <= numDays; d++) {
            const iso = isoDateFromYMD(currentYear, currentMonth, d);
            const worklogs = days[iso] || [];
            const dayTotalSeconds = worklogs.reduce((sum, wl) => sum + wl.timeSpentSeconds, 0);
            userTotalSeconds += dayTotalSeconds;
            cells.push(
              <div key={iso} style={{ border: '1px solid #ccc', borderRadius: 6, minHeight: 100, padding: '0.5em', display: 'flex', flexDirection: 'column', gap: '0.25em' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25em' }}>{String(d)}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {worklogs.map(wl => (
                    <div key={wl.id}>
                      <a href={`https://${jiraDomain}/browse/${wl.issueKey ?? wl.issueId}`} target="_blank" rel="noreferrer">
                        {wl.issueKey ?? wl.issueId}
                      </a>
                      {` - ${truncate(wl.comment || '(No comment)')} - ${(wl.timeSpentSeconds / 3600).toFixed(2)} h`}
                    </div>
                  ))}
                </div>
                {worklogs.length > 0 && (
                  <div style={{ fontWeight: 'bold', marginTop: 'auto' }}>Day: {(dayTotalSeconds / 3600).toFixed(2)} h</div>
                )}
              </div>
            );
          }

          return (
            <div key={user}>
              <h2>{user}</h2>
              <div style={{ marginBottom: '0.5em' }}>
                <button onClick={() => handleDownloadUser(user)}>Download CSV</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: '0.5em' }}>
                {weekdayLabels.map(w => (
                  <div key={w} style={{ textAlign: 'center', fontWeight: 'bold' }}>{w}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {cells}
              </div>
              <div style={{ fontWeight: 'bold', marginTop: '0.5em' }}>Month total: {(userTotalSeconds / 3600).toFixed(2)} h</div>
            </div>
          );
        })}
    </div>
  );
};



