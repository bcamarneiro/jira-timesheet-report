import React from 'react';
import type { JiraWorklog } from '../../types/JiraWorklog';
import { getMonthStartWeekday, getDaysInMonth, isoDateFromYMD } from '../utils/date';
import { truncate } from '../utils/text';

type Props = {
  user: string;
  days: Record<string, JiraWorklog[]>;
  year: number;
  monthZeroIndexed: number;
  jiraDomain: string;
  onDownloadUser: (user: string) => void;
};

export const TimesheetGrid: React.FC<Props> = ({ user, days, year, monthZeroIndexed, jiraDomain, onDownloadUser }) => {
  const firstWeekday = getMonthStartWeekday(year, monthZeroIndexed);
  const numDays = getDaysInMonth(year, monthZeroIndexed);
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let userTotalSeconds = 0;
  const cells: React.ReactNode[] = [];

  for (let i = 0; i < firstWeekday; i++) {
    cells.push(
      <div key={`empty-${i}`} style={{ border: '1px solid #eee', minHeight: 100, padding: '0.5em', background: '#fafafa' }} />
    );
  }

  for (let d = 1; d <= numDays; d++) {
    const iso = isoDateFromYMD(year, monthZeroIndexed, d);
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
        <button onClick={() => onDownloadUser(user)}>Download CSV</button>
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
};


