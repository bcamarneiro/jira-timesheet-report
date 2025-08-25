import React from 'react';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import { truncate } from '../utils/text';
import { formatHours } from '../utils/format';

type Props = {
  iso: string;
  dayNumber: number;
  jiraDomain: string;
  worklogs: JiraWorklog[];
  isWeekend: boolean;
  timeOffHours: number;
  onTimeOffChange: (hours: number) => void;
  issueSummaries: Record<string, string>;
};

export const DayCell: React.FC<Props> = ({ iso, dayNumber, jiraDomain, worklogs, isWeekend, timeOffHours, onTimeOffChange, issueSummaries }) => {
  const dayTotalSeconds = worklogs.reduce((sum, wl) => sum + wl.timeSpentSeconds, 0);
  const baselineSeconds = isWeekend ? 0 : 8 * 3600;
  const timeOffSeconds = !isWeekend ? timeOffHours * 3600 : 0;
  const effectiveSeconds = dayTotalSeconds + timeOffSeconds;
  const missingSeconds = Math.max(0, baselineSeconds - effectiveSeconds);

  let dayBackground: string | undefined = undefined;
  if (isWeekend) {
    if (dayTotalSeconds > 0) dayBackground = '#ffd6d6';
  } else {
    if (effectiveSeconds === 8 * 3600) dayBackground = '#e6f6ea';
    else if (effectiveSeconds < 8 * 3600) dayBackground = '#ffe9e3';
    else dayBackground = '#fff6cc';
  }

  return (
    <div key={iso} style={{ border: '1px solid #ddd', borderRadius: 8, minHeight: 100, padding: '0.5em', display: 'flex', flexDirection: 'column', gap: '0.25em', background: dayBackground }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25em' }}>
        <div style={{ fontWeight: 'bold' }}>{String(dayNumber)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {worklogs.length > 0 && (
            <div style={{ fontSize: 11, color: '#666' }}>{worklogs.length} {worklogs.length === 1 ? 'log' : 'logs'}</div>
          )}
          <select
            value={timeOffHours}
            onChange={(e) => onTimeOffChange(Number(e.target.value) || 0)}
            title="Time off (counts only for karma)"
            style={{ fontSize: 11, padding: '2px 4px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', color: '#333' }}
          >
            <option value={0}>time off</option>
            <option value={1}>1h</option>
            <option value={2}>2h</option>
            <option value={3}>3h</option>
            <option value={4}>4h</option>
            <option value={5}>5h</option>
            <option value={6}>6h</option>
            <option value={7}>7h</option>
            <option value={8}>8h</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, lineHeight: 1.3 }}>
        {worklogs.map(wl => {
          const keyOrId = wl.issueKey ?? wl.issueId;
          const issueTitle = (wl.issueKey && issueSummaries[wl.issueKey]) ? issueSummaries[wl.issueKey] : '';
          const comment = wl.comment || '';
          const tooltip = [
            issueTitle ? `Issue: ${issueTitle}` : '',
            comment ? `Comment: ${truncate(comment)}` : ''
          ].filter(Boolean).join('\n');
          return (
            <div key={wl.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#444', whiteSpace: 'nowrap' }}>{formatHours(wl.timeSpentSeconds)} - </span>
              <a href={`https://${jiraDomain}/browse/${keyOrId}?focusedId=${wl.id}&page=com.atlassian.jira.plugin.system.issuetabpanels%3Aworklog-tabpanel#worklog-${wl.id}`} target="_blank" rel="noreferrer" style={{ color: '#0b5cff', textDecoration: 'none' }}>
                {keyOrId}
              </a>
              {(issueTitle || comment) && (
                <span title={tooltip} aria-label="Details" style={{ cursor: 'help', marginLeft: 4 }}>🛈</span>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
        <div style={{ color: '#333' }}>Total: {formatHours(dayTotalSeconds)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {(() => {
            const to = !isWeekend ? timeOffHours : 0;
            return to > 0 ? <span title="Time off (counts for karma)">TO: {to}h</span> : null;
          })()}
          {(missingSeconds > 0) && (
            <div style={{ color: '#a14' }}>{formatHours(missingSeconds)} missing</div>
          )}
        </div>
      </div>
    </div>
  );
};


