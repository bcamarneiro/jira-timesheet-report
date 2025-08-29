import React from 'react';
import { Button } from './Button';
import { calculateUserKarma } from '../utils/karmaCalculator';
import type { JiraWorklog } from '../../../types/JiraWorklog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

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
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-xl">{user}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData && (
          <div className="mb-4">
            <Button onClick={() => onDownloadUser(user)} variant="secondary" size="small">
              Download CSV
            </Button>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Karma hours (net): {karma.netKarmaHours.toFixed(2)} h
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">
              Month total: {karma.totalHours.toFixed(2)} h
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
