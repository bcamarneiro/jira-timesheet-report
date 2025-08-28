import React, { useEffect } from 'react';
import { monthLabel } from '../utils/date';
import { MonthNavigator } from '../components/MonthNavigator';
import { TimesheetGrid } from '../components/TimesheetGrid';
import { CalendarLayout } from '../components/CalendarLayout';
import { CalendarControls } from '../components/CalendarControls';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { useTimesheetQueryParams } from '../hooks/useTimesheetQueryParams';
import { useTimesheetData } from '../hooks/useTimesheetData';
import { useProjectConfig } from '../hooks/useProjectConfig';
import { usePersonalConfig } from '../hooks/usePersonalConfig';
import { CsvService } from '../services/csvService';

// Loading skeleton component
const LoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
        <div className="h-12 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-gray-300 rounded w-1/4 mb-8"></div>
        
        {/* Grid skeleton */}
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-300 rounded animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const Calendar: React.FC = () => {
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
    visibleEntries,
    loading,
    error
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
    if (data) {
      CsvService.downloadUserCsv(data, issueSummaries, user);
    }
  }

  function handleDownloadAll() {
    const visibleUsers = Object.keys(grouped)
      .filter(user => (selectedUser === '' || user === selectedUser))
      .filter(user => !teamDevelopers || teamDevelopers.includes(user));
    
    if (data) {
      CsvService.downloadMultipleUsers(data, issueSummaries, visibleUsers);
    }
  }

  if (loading) return <LoadingSkeleton />;
  if (error) {
    return (
      <CalendarLayout>
        <ErrorState error={error} />
      </CalendarLayout>
    );
  }
  if (!data) return <LoadingSkeleton />;

  const isValidUser = selectedUser !== '' && users.includes(selectedUser);
  const selectedEntry = visibleEntries.find(([user]) => user === selectedUser);

  return (
    <CalendarLayout>
      <CalendarControls
        users={users}
        selectedUser={selectedUser}
        onUserChange={handleUserChange}
        onDownloadAll={handleDownloadAll}
        visibleUsers={[]}
      />

      {/* Month Navigator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <MonthNavigator 
          label={monthLabel(currentYear, currentMonth)} 
          onPrev={goPrevMonth} 
          onNext={goNextMonth} 
        />
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
          <EmptyState />
        )}
      </div>
    </CalendarLayout>
  );
};
