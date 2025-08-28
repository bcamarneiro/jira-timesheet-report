import React from 'react';
import * as Select from '@radix-ui/react-select';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import type { ProjectConfig } from '../../../types/ProjectConfig';
import type { PersonalConfig } from '../../../types/PersonalConfig';
import { truncate } from '../utils/text';
import { formatHours } from '../utils/format';
import { getEmojiForTicket } from '../utils/emojiMatcher';
import { Tooltip } from './Popover';
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
            <Select.Root value={timeOffHours.toString()} onValueChange={(value) => onTimeOffChange(Number(value) || 0)}>
              <Select.Trigger 
                className={styles.timeOffSelect}
                title="Time off (counts only for karma)"
              >
                <Select.Value placeholder="Time off" />
                <Select.Icon>▼</Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="bg-white rounded-md shadow-soft border border-gray-300 py-1">
                  <Select.Viewport>
                    <Select.Item value="0" className="px-2 py-1 cursor-pointer text-xs">
                      <Select.ItemText>No time off</Select.ItemText>
                    </Select.Item>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(hours => (
                      <Select.Item key={hours} value={hours.toString()} className="px-2 py-1 cursor-pointer text-xs">
                        <Select.ItemText>{hours}h</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          )}
        </div>
      </div>
      <div className={styles.worklogList}>
        {worklogs.map(wl => {
          const keyOrId = wl.issueKey ?? wl.issueId;
          const issueTitle = (wl.issueKey && issueSummaries[wl.issueKey]) ? issueSummaries[wl.issueKey] : '';
          const comment = wl.comment || '';
          const tooltip = [
            issueTitle ? `Issue: ${issueTitle}` : '',
            comment ? `Comment: ${truncate(comment)}` : ''
          ].filter(Boolean).join('\n');
          
          // Get emoji for this ticket
          const emoji = getEmojiForTicket(keyOrId, projectConfig, personalConfig);
          
          return (
            <div key={wl.id} className={styles.worklogItem}>
              <span className={styles.worklogTime}>{formatHours(wl.timeSpentSeconds)} - </span>
              {emoji && <span className={styles.worklogEmoji}>{emoji}</span>}
              <a href={`https://${jiraDomain}/browse/${keyOrId}?focusedId=${wl.id}&page=com.atlassian.jira.plugin.system.issuetabpanels%3Aworklog-tabpanel#worklog-${wl.id}`} target="_blank" rel="noreferrer" className={styles.worklogLink}>
                {keyOrId}
              </a>
              {(issueTitle || comment) && (
                <Tooltip content={tooltip}>
                  <span aria-label="Details" className={styles.worklogInfo}>🛈</span>
                </Tooltip>
              )}
            </div>
          );
        })}
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


