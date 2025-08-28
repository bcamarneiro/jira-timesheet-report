import React from 'react';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import type { ProjectConfig } from '../../../types/ProjectConfig';
import type { PersonalConfig } from '../../../types/PersonalConfig';
import { formatHours } from '../utils/format';
import { WorklogDisplay } from './WorklogDisplay';
import { TimeOffSelector } from './TimeOffSelector';
import styles from './DayCell.module.css';

type Props = {
  iso: string;
  dayNumber: number;
  jiraDomain: string;
  worklogs: JiraWorklog[];
  isWeekend: boolean;
  timeOffHours: number;
  onTimeOffChange: (hours: number) => void;
  issueSummaries: Record<string, string>;
  projectConfig: ProjectConfig;
  personalConfig: PersonalConfig;
};

export const DayCell: React.FC<Props> = ({ iso, dayNumber, jiraDomain, worklogs, isWeekend, timeOffHours, onTimeOffChange, issueSummaries, projectConfig, personalConfig }) => {
  const dayTotalSeconds = worklogs.reduce((sum, wl) => sum + wl.timeSpentSeconds, 0);
  const baselineSeconds = isWeekend ? 0 : 8 * 3600;
  const timeOffSeconds = !isWeekend ? timeOffHours * 3600 : 0;
  const effectiveSeconds = dayTotalSeconds + timeOffSeconds;
  const missingSeconds = Math.max(0, baselineSeconds - effectiveSeconds);

  const getDayCellClass = () => {
    if (isWeekend) {
      return dayTotalSeconds > 0 ? styles.dayCellWeekend : styles.dayCell;
    } else {
      if (effectiveSeconds === 8 * 3600) return styles.dayCellComplete;
      else if (effectiveSeconds < 8 * 3600) return styles.dayCellIncomplete;
      else return styles.dayCellOvertime;
    }
  };

  return (
    <div key={iso} className={`${styles.dayCell} ${getDayCellClass()}`}>
      <div className={styles.dayHeader}>
        <div className={styles.dayNumber}>{String(dayNumber)}</div>
        <div className={styles.dayControls}>
          {worklogs.length > 0 && (
            <div className={styles.logCount}>{worklogs.length} {worklogs.length === 1 ? 'log' : 'logs'}</div>
          )}
          {!isWeekend && (
            <TimeOffSelector
              value={timeOffHours}
              onChange={onTimeOffChange}
            />
          )}
        </div>
      </div>
      <div className={styles.worklogList}>
        {worklogs.map(wl => (
          <WorklogDisplay
            key={wl.id}
            worklog={wl}
            jiraDomain={jiraDomain}
            issueSummaries={issueSummaries}
            projectConfig={projectConfig}
            personalConfig={personalConfig}
          />
        ))}
      </div>
      <div className={styles.dayFooter}>
        <div className={styles.dayTotal}>Total: {formatHours(dayTotalSeconds)}</div>
        <div className={styles.dayStats}>
          {(() => {
            const to = !isWeekend ? timeOffHours : 0;
            return to > 0 ? <span className={styles.timeOff} title="Time off (counts for karma)">TO: {to}h</span> : null;
          })()}
          {(missingSeconds > 0) && (
            <div className={styles.missingTime}>{formatHours(missingSeconds)} missing</div>
          )}
        </div>
      </div>
    </div>
  );
};


