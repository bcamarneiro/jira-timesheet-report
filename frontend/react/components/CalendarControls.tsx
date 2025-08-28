import React from 'react';
import { UserSelector } from './UserSelector';
import { Button } from './Button';
import { Tooltip } from './Popover';

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1">
          <UserSelector users={users} value={selectedUser} onChange={onUserChange} />
        </div>
        
        <div className="flex items-center space-x-4">
          <Tooltip content="Download CSV files for all visible users">
            <Button 
              onClick={onDownloadAll}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              📥 Download CSV for all
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
