import React, { useEffect, useMemo, useState } from 'react';
import type { JiraWorklog } from '../../types/JiraWorklog';
import { buildCsvForUser, download } from './utils/csv';
import { monthLabel } from './utils/date';
import { UserSelector } from './components/UserSelector';
import { MonthNavigator } from './components/MonthNavigator';
import { TimesheetGrid } from './components/TimesheetGrid';

type Grouped = Record<string, Record<string, JiraWorklog[]>>;

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

  function handleDownloadUser(user: string) {
    const csv = data ? buildCsvForUser(data, issueSummaries, user) : '';
    download(`${user.replace(/[^a-z0-9-_]/gi, '_')}.csv`, csv);
  }

  function handleDownloadAll(visibleUsers: string[]) {
    visibleUsers.forEach(user => handleDownloadUser(user));
  }

  if (!data) return <p>Loading...</p>;

  // monthLabel imported

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
      <UserSelector users={users} value={selectedUser} onChange={handleUserChange} />

      <div style={{ margin: '0.5em 0' }}>
        <button onClick={() => handleDownloadAll(
          Object.keys(grouped)
            .filter(user => (selectedUser === '' || user === selectedUser))
            .filter(user => !teamDevelopers || teamDevelopers.includes(user))
        )}>Download CSV for all</button>
      </div>

      <MonthNavigator label={monthLabel(currentYear, currentMonth)} onPrev={goPrevMonth} onNext={goNextMonth} />

      {Object.entries(grouped)
        .filter(([user]) => (selectedUser === '' || user === selectedUser))
        .filter(([user]) => !teamDevelopers || teamDevelopers.includes(user))
        .map(([user, days]) => (
          <TimesheetGrid
            key={user}
            user={user}
            days={days}
            year={currentYear}
            monthZeroIndexed={currentMonth}
            jiraDomain={jiraDomain}
            onDownloadUser={handleDownloadUser}
          />
        ))}
    </div>
  );
};



