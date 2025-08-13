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
    })();
  }, []);

  const users = useMemo(() => {
    if (!data) return [] as string[];
    const unique: Record<string, true> = {};
    data.forEach(wl => { unique[wl.author.displayName] = true; });
    return Object.keys(unique).sort();
  }, [data]);

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

      {Object.entries(grouped)
        .filter(([user]) => selectedUser === '' || user === selectedUser)
        .map(([user, days]) => {
          let userTotalSeconds = 0;

          const dayTemplates = Object.entries(days).map(([day, worklogs]) => {
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
              {dayTemplates}
              <div style={{ fontWeight: 'bold', marginTop: '0.5em' }}>Monthly total: {(userTotalSeconds / 3600).toFixed(2)} h</div>
            </div>
          );
        })}
    </div>
  );
};



