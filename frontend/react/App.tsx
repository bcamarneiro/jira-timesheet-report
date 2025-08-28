import React, { useState, useEffect } from 'react';
import { buildCsvForUser, download } from './utils/csv';
import { monthLabel } from './utils/date';
import { UserSelector } from './components/UserSelector';
import { MonthNavigator } from './components/MonthNavigator';
import { TimesheetGrid } from './components/TimesheetGrid';
import { SettingsModal } from './components/SettingsModal';
import { Button } from './components/Button';
import { useTimesheetQueryParams } from './hooks/useTimesheetQueryParams';
import { useTimesheetData } from './hooks/useTimesheetData';
import { useProjectConfig } from './hooks/useProjectConfig';
import { usePersonalConfig } from './hooks/usePersonalConfig';
import { Tooltip } from './components/Popover';

// Loading skeleton component
const LoadingSkeleton: React.FC = () => (
  <div className="font-sans">
    <div className="flex justify-between items-center mb-4">
      <div className="h-8 w-48 bg-gray-300 rounded animate-pulse" />
      <div className="h-8 w-28 bg-gray-300 rounded animate-pulse" />
    </div>
    <div className="h-10 w-72 bg-gray-300 rounded mb-4 animate-pulse" />
    <div className="h-8 w-36 bg-gray-300 rounded mb-4 animate-pulse" />
    <div className="h-8 w-48 bg-gray-300 rounded mb-8 animate-pulse" />
    
    {/* Grid skeleton */}
    <div className="grid grid-cols-7 gap-1.5 mb-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="h-8 bg-gray-300 rounded animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-7 gap-1.5">
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className="h-30 bg-gray-300 rounded-lg animate-pulse" />
      ))}
    </div>
  </div>
);

export const App: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const {
    selectedUser,
    setSelectedUser,
    currentYear,
    currentMonth,
    goPrevMonth,
    goNextMonth
  } = useTimesheetQueryParams();

  const projectConfig = useProjectConfig();
  const personalConfig = usePersonalConfig();

  const handleTimeOffChange = (date: string, hours: number) => {
    personalConfig.setTimeOffForDate(date, hours);
  };

  const {
    data,
    jiraDomain,
    issueSummaries,
    teamDevelopers,
    users,
    grouped,
    visibleEntries
  } = useTimesheetData(currentYear, currentMonth, selectedUser, projectConfig.config);

  // Auto-select default user if configured and no user is currently selected
  useEffect(() => {
    if (!selectedUser && personalConfig.config.uiPreferences.defaultUser && users && users.includes(personalConfig.config.uiPreferences.defaultUser)) {
      setSelectedUser(personalConfig.config.uiPreferences.defaultUser);
    }
  }, [selectedUser, personalConfig.config.uiPreferences.defaultUser, users, setSelectedUser]);

  const handleUserChange = (value: string) => {
    setSelectedUser(value);
  };

  function handleDownloadUser(user: string) {
    const csv = data ? buildCsvForUser(data, issueSummaries, user) : '';
    download(`${user.replace(/[^a-z0-9-_]/gi, '_')}.csv`, csv);
  }

  function handleDownloadAll(visibleUsers: string[]) {
    visibleUsers.forEach(user => handleDownloadUser(user));
  }

  if (!data) return <LoadingSkeleton />;

  const isValidUser = selectedUser !== '' && users.includes(selectedUser);
  const selectedEntry = visibleEntries.find(([user]) => user === selectedUser);

  return (
    <div className="font-sans">
      <div className="flex justify-between items-center mb-4">
        <h1 className="m-0 text-2xl font-bold text-gray-900">Timesheet</h1>
        <Tooltip content="Configure project settings and personal preferences">
          <Button
            onClick={() => setIsSettingsOpen(true)}
            variant="secondary"
          >
            ⚙️ Settings
          </Button>
        </Tooltip>
      </div>
      <UserSelector users={users} value={selectedUser} onChange={handleUserChange} />

      <div className="my-2">
        <Tooltip content="Download CSV files for all visible users">
          <Button onClick={() => handleDownloadAll(
            Object.keys(grouped)
              .filter(user => (selectedUser === '' || user === selectedUser))
              .filter(user => !teamDevelopers || teamDevelopers.includes(user))
          )}>
            Download CSV for all
          </Button>
        </Tooltip>
      </div>

      <MonthNavigator label={monthLabel(currentYear, currentMonth)} onPrev={goPrevMonth} onNext={goNextMonth} />

      {isValidUser ? (
        selectedEntry ? (
          <TimesheetGrid
            key={selectedEntry[0]}
            user={selectedEntry[0]}
            days={selectedEntry[1]}
            year={currentYear}
            monthZeroIndexed={currentMonth}
            jiraDomain={jiraDomain}
            issueSummaries={issueSummaries}
            projectConfig={projectConfig.config}
            personalConfig={personalConfig.config}
            onDownloadUser={handleDownloadUser}
            onTimeOffChange={handleTimeOffChange}
          />
        ) : (
          <TimesheetGrid
            key={selectedUser}
            user={selectedUser}
            days={{}}
            year={currentYear}
            monthZeroIndexed={currentMonth}
            jiraDomain={jiraDomain}
            issueSummaries={issueSummaries}
            projectConfig={projectConfig.config}
            personalConfig={personalConfig.config}
            onDownloadUser={handleDownloadUser}
            onTimeOffChange={handleTimeOffChange}
          />
        )
      ) : (
        <div className="mt-4 font-bold text-gray-700">Please select a developer</div>
      )}
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};



