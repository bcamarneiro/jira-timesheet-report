import React from 'react';
import { Button } from './Button';
import { calculateUserKarma } from '../utils/karmaCalculator';
import type { JiraWorklog } from '../../../types/JiraWorklog';

type UserStatsProps = {
  user: string;
  days: Record<string, JiraWorklog[]>;
  timeOffHours: Record<string, number>;
  onDownloadUser: (user: string) => void;
};

export const UserStats: React.FC<UserStatsProps> = ({
  user,
  days,
  timeOffHours,
  onDownloadUser
}) => {
  const karma = calculateUserKarma(days, timeOffHours);
  const hasData = karma.totalSeconds > 0;

  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-gray-900 mb-2">{user}</h2>
      {hasData && (
        <div className="mb-2">
          <Button onClick={() => onDownloadUser(user)} variant="secondary" size="small">
            Download CSV
          </Button>
        </div>
      )}
      <div className="mb-2 font-bold text-gray-700">
        Karma hours (net): {karma.netKarmaHours.toFixed(2)} h
      </div>
      <div className="font-bold mt-2 text-gray-700">
        Month total: {karma.totalHours.toFixed(2)} h
      </div>
    </div>
  );
};
