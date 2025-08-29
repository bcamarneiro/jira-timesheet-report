import React from 'react';
import { UserSelector } from './UserSelector';
import { Button } from './Button';
import { Tooltip } from './Popover';
import { Card, CardContent } from './ui/card';

type CalendarControlsProps = {
  users: string[];
  selectedUser: string;
  onUserChange: (value: string) => void;
  onDownloadAll: () => void;
  visibleUsers: string[];
};

export const CalendarControls: React.FC<CalendarControlsProps> = ({
  users,
  selectedUser,
  onUserChange,
  onDownloadAll,
  visibleUsers
}) => {
  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <UserSelector users={users} value={selectedUser} onChange={onUserChange} />
          </div>
          
          <div className="flex items-center space-x-4">
            <Tooltip content="Download CSV files for all visible users">
              <Button 
                onClick={onDownloadAll}
                variant="default"
                size="default"
              >
                📥 Download CSV for all
              </Button>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
