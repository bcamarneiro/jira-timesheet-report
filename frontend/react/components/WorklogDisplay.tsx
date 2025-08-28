import React from 'react';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import type { ProjectConfig } from '../../../types/ProjectConfig';
import type { PersonalConfig } from '../../../types/PersonalConfig';
import { truncate } from '../utils/text';
import { formatHours } from '../utils/format';
import { getEmojiForTicket } from '../utils/emojiMatcher';
import { Tooltip } from './Popover';
import styles from './DayCell.module.css';

type WorklogDisplayProps = {
  worklog: JiraWorklog;
  jiraDomain: string;
  issueSummaries: Record<string, string>;
  projectConfig: ProjectConfig;
  personalConfig: PersonalConfig;
};

export const WorklogDisplay: React.FC<WorklogDisplayProps> = ({
  worklog,
  jiraDomain,
  issueSummaries,
  projectConfig,
  personalConfig
}) => {
  const keyOrId = worklog.issueKey ?? worklog.issueId;
  const issueTitle = (worklog.issueKey && issueSummaries[worklog.issueKey]) ? issueSummaries[worklog.issueKey] : '';
  const comment = worklog.comment || '';
  const tooltip = [
    issueTitle ? `Issue: ${issueTitle}` : '',
    comment ? `Comment: ${truncate(comment)}` : ''
  ].filter(Boolean).join('\n');
  
  // Get emoji for this ticket
  const emoji = getEmojiForTicket(keyOrId, projectConfig, personalConfig);
  
  return (
    <div className={styles.worklogItem}>
      <span className={styles.worklogTime}>{formatHours(worklog.timeSpentSeconds)} - </span>
      {emoji && <span className={styles.worklogEmoji}>{emoji}</span>}
      <a 
        href={`https://${jiraDomain}/browse/${keyOrId}?focusedId=${worklog.id}&page=com.atlassian.jira.plugin.system.issuetabpanels%3Aworklog-tabpanel#worklog-${worklog.id}`} 
        target="_blank" 
        rel="noreferrer" 
        className={styles.worklogLink}
      >
        {keyOrId}
      </a>
      {(issueTitle || comment) && (
        <Tooltip content={tooltip}>
          <span aria-label="Details" className={styles.worklogInfo}>🛈</span>
        </Tooltip>
      )}
    </div>
  );
};
