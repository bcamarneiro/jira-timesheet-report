import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import type { ProjectConfig } from '../../../types/ProjectConfig';
import type { PersonalConfig } from '../../../types/PersonalConfig';
import { getMonthStartWeekday, getDaysInMonth, isoDateFromYMD } from '../utils/date';
import { useTimeOff } from '../hooks/useTimeOff';
import { DayCell } from './DayCell';
import { Button } from './Button';

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
  const firstWeekday = getMonthStartWeekday(year, monthZeroIndexed);
  const numDays = getDaysInMonth(year, monthZeroIndexed);
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const now = new Date();
  const todayStartUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const { getTimeOffHours, setTimeOffHours } = useTimeOff(user, personalConfig);

  const handleTimeOffChange = (iso: string, hours: number) => {
    setTimeOffHours(iso, hours);
    if (onTimeOffChange) {
      onTimeOffChange(iso, hours);
    }
  };

  let userTotalSeconds = 0;
  let userNetKarmaSeconds = 0; // Sum of (dayTotal - baseline), baseline=8h on weekdays, 0h on weekends
  const cells: React.ReactNode[] = [];

  for (let i = 0; i < firstWeekday; i++) {
    cells.push(
      <div key={`empty-${i}`} className="border border-gray-200 min-h-[100px] p-2 bg-gray-50" />
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
        onTimeOffChange={(hours) => handleTimeOffChange(iso, hours)}
        issueSummaries={issueSummaries}
        projectConfig={projectConfig}
        personalConfig={personalConfig}
      />
    );
  }

  return (
    <div key={user}>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{user}</h2>
      {userTotalSeconds > 0 && (
        <div className="mb-2">
          <Button onClick={() => onDownloadUser(user)} variant="secondary" size="small">
            Download CSV
          </Button>
        </div>
      )}
      <div className="mb-2 font-bold text-gray-700">Karma hours (net): {(userNetKarmaSeconds / 3600).toFixed(2)} h</div>
      <div className="relative">
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {weekdayLabels.map(w => (
            <div key={w} className="text-center font-bold text-sm py-2">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells}
        </div>
        {userTotalSeconds === 0 && (
          <Dialog.Root open={true}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
              <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-xl shadow-large z-50 text-center max-w-md w-full mx-4">
                <Dialog.Title className="text-2xl font-bold mb-4">
                  No Data Available
                </Dialog.Title>
                <Dialog.Description className="text-lg text-gray-600">
                  não tens dados, maninho!
                </Dialog.Description>
                <div className="mt-6">
                  <Button onClick={() => window.location.reload()} variant="primary">
                    Refresh Page
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </div>
      <div className="font-bold mt-2 text-gray-700">Month total: {(userTotalSeconds / 3600).toFixed(2)} h</div>
    </div>
  );
};


