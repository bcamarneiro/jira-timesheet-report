import type React from 'react';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import { getMonthStartWeekday, getDaysInMonth, isoDateFromYMD } from '../utils/date';
import { useTimeOff } from '../hooks/useTimeOff';
import { DayCell } from './DayCell';

type Props = {
  user: string;
  days: Record<string, JiraWorklog[]>;
  year: number;
  monthZeroIndexed: number;
  jiraDomain: string;
  issueSummaries: Record<string, string>;
  onDownloadUser: (user: string) => void;
};

export const TimesheetGrid: React.FC<Props> = ({ user, days, year, monthZeroIndexed, jiraDomain, issueSummaries, onDownloadUser }) => {
  const firstWeekday = getMonthStartWeekday(year, monthZeroIndexed);
  const numDays = getDaysInMonth(year, monthZeroIndexed);
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const now = new Date();
  const todayStartUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const { getTimeOffHours, setTimeOffHours } = useTimeOff(user);

  let userTotalSeconds = 0;
  let userNetKarmaSeconds = 0; // Sum of (dayTotal - baseline), baseline=8h on weekdays, 0h on weekends
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
    const jsDate = new Date(Date.UTC(year, monthZeroIndexed, d));
    const weekday = jsDate.getUTCDay(); // 0=Sun,6=Sat
    const isWeekend = weekday === 0 || weekday === 6;
    const baselineSeconds = isWeekend ? 0 : 8 * 3600;
    const isBeforeToday = jsDate.getTime() < todayStartUtc.getTime();
    const timeOffSeconds = (!isWeekend ? getTimeOffHours(iso) * 3600 : 0);
    if (isBeforeToday) {
      userNetKarmaSeconds += (dayTotalSeconds + timeOffSeconds - baselineSeconds);
    }

    cells.push(
      <DayCell
        key={iso}
        iso={iso}
        dayNumber={d}
        jiraDomain={jiraDomain}
        worklogs={worklogs}
        isWeekend={isWeekend}
        timeOffHours={!isWeekend ? getTimeOffHours(iso) : 0}
        onTimeOffChange={(hours) => setTimeOffHours(iso, hours)}
        issueSummaries={issueSummaries}
        currentYear={year}
        currentMonth={monthZeroIndexed}
      />
    );
  }

  return (
    <div key={user}>
      <h2>{user}</h2>
      {userTotalSeconds > 0 && (
        <div style={{ marginBottom: '0.5em' }}>
          <button type="button" onClick={() => onDownloadUser(user)}>Download CSV</button>
        </div>
      )}
      <div style={{ marginBottom: '0.5em', fontWeight: 'bold' }}>Karma hours (net): {(userNetKarmaSeconds / 3600).toFixed(2)} h</div>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: '0.5em' }}>
          {weekdayLabels.map(w => (
            <div key={w} style={{ textAlign: 'center', fontWeight: 'bold' }}>{w}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {cells}
        </div>
        {userTotalSeconds === 0 && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(210, 210, 210, 0.9)', color: '#222', fontWeight: 'bold', fontSize: 22, textAlign: 'center' }}>
            não tens dados, maninho!
          </div>
        )}
      </div>
      <div style={{ fontWeight: 'bold', marginTop: '0.5em' }}>Month total: {(userTotalSeconds / 3600).toFixed(2)} h</div>
    </div>
  );
};


