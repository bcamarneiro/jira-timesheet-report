import React from 'react';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import type { ProjectConfig } from '../../../types/ProjectConfig';
import type { PersonalConfig } from '../../../types/PersonalConfig';
import { getDaysInMonth, isoDateFromYMD } from '../utils/date';
import { useConfigStore } from '../stores/configStore';
import { DayCell } from './DayCell';
import { CalendarGrid } from './CalendarGrid';
import { UserStats } from './UserStats';
import { NoDataDialog } from './NoDataDialog';

type Props = {
  user: string;
  days: Record<string, JiraWorklog[]>;
  year: number;
  monthZeroIndexed: number;
  jiraDomain: string;
  issueSummaries: Record<string, string>;
  projectConfig: ProjectConfig;
  personalConfig: PersonalConfig;
  onDownloadUser: (user: string) => void;
  onTimeOffChange?: (date: string, hours: number) => void;
};

export const TimesheetGrid: React.FC<Props> = ({ user, days, year, monthZeroIndexed, jiraDomain, issueSummaries, projectConfig, personalConfig, onDownloadUser, onTimeOffChange }) => {
  const numDays = getDaysInMonth(year, monthZeroIndexed);
  const { getTimeOffForDate, setTimeOffForDate } = useConfigStore();

  const handleTimeOffChange = (iso: string, hours: number) => {
    setTimeOffForDate(user, iso, hours);
    if (onTimeOffChange) {
      onTimeOffChange(iso, hours);
    }
  };

  // Build time-off hours record for karma calculation
  const timeOffHours: Record<string, number> = {};
  for (let d = 1; d <= numDays; d++) {
    const iso = isoDateFromYMD(year, monthZeroIndexed, d);
    const jsDate = new Date(Date.UTC(year, monthZeroIndexed, d));
    const weekday = jsDate.getUTCDay();
    const isWeekend = weekday === 0 || weekday === 6;
    if (!isWeekend) {
      timeOffHours[iso] = getTimeOffForDate(user, iso);
    }
  }

  const cells: React.ReactNode[] = [];

  for (let d = 1; d <= numDays; d++) {
    const iso = isoDateFromYMD(year, monthZeroIndexed, d);
    const worklogs = days[iso] || [];
    const jsDate = new Date(Date.UTC(year, monthZeroIndexed, d));
    const weekday = jsDate.getUTCDay();
    const isWeekend = weekday === 0 || weekday === 6;

    cells.push(
      <DayCell
        key={iso}
        iso={iso}
        dayNumber={d}
        jiraDomain={jiraDomain}
        worklogs={worklogs}
        isWeekend={isWeekend}
        timeOffHours={!isWeekend ? getTimeOffForDate(user, iso) : 0}
        onTimeOffChange={(hours) => handleTimeOffChange(iso, hours)}
        issueSummaries={issueSummaries}
        projectConfig={projectConfig}
        personalConfig={personalConfig}
      />
    );
  }

  return (
    <div key={user}>
      <UserStats
        user={user}
        days={days}
        timeOffHours={timeOffHours}
        onDownloadUser={onDownloadUser}
      />
      <CalendarGrid year={year} monthZeroIndexed={monthZeroIndexed}>
        {cells}
      </CalendarGrid>
      {Object.keys(days).length === 0 && <NoDataDialog />}
    </div>
  );
};


