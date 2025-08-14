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
    rows.push(['Name', 'TicketKey', 'TicketName', 'DateTime', 'BookedTime'].join(','));
    (data || [])
      .filter(wl => wl.author.displayName === user)
      .sort((a, b) => new Date(a.started).getTime() - new Date(b.started).getTime())
      .forEach(wl => {
        const key = wl.issueKey ?? String(wl.issueId);
        const ticketName = issueSummaries[key] || '';
        const startedIso = new Date(wl.started).toISOString();
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

      {Object.entries(grouped)
        .filter(([user]) => (selectedUser === '' || user === selectedUser))
        .filter(([user]) => !teamDevelopers || teamDevelopers.includes(user))
        .map(([user, days]) => {
          let userTotalSeconds = 0;

          const dayTemplates = Object.entries(days)
            .sort(([d1], [d2]) => d1.localeCompare(d2))
            .map(([day, worklogs]) => {
            const dayTotalSeconds = worklogs.reduce((sum, wl) => sum + wl.timeSpentSeconds, 0);
            userTotalSeconds += dayTotalSeconds;
            return (
              <div key={day} style={{ marginBottom: '1em', padding: '0.5em', border: '1px solid #ccc', borderRadius: 6 }}>
                <h3>{day}</h3>
                {worklogs.map((wl) => (
                  <div key={wl.id} style={{ marginLeft: '1em' }}>
                    <a href={`https://${jiraDomain}/browse/${wl.issueKey ?? wl.issueId}`} target="_blank" rel="noreferrer">
                      {wl.issueKey ?? wl.issueId}
                    </a>
                    {` - ${truncate(wl.comment || '(No comment)')} - ${(wl.timeSpentSeconds / 3600).toFixed(2)} h`}
                  </div>
                ))}
                <div style={{ fontWeight: 'bold', marginTop: '0.5em' }}>Day total: {(dayTotalSeconds / 3600).toFixed(2)} h</div>
              </div>
            );
          });

          return (
            <div key={user}>
              <h2>{user}</h2>
              <div style={{ marginBottom: '0.5em' }}>
                <button onClick={() => handleDownloadUser(user)}>Download CSV</button>
              </div>
              {dayTemplates}
              <div style={{ fontWeight: 'bold', marginTop: '0.5em' }}>Monthly total: {(userTotalSeconds / 3600).toFixed(2)} h</div>
            </div>
          );
        })}
    </div>
  );
};



