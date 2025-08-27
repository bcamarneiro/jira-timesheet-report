import React, { useState, useEffect } from 'react';
import { buildCsvForUser, download } from './utils/csv';
import { monthLabel } from './utils/date';
import { UserSelector } from './components/UserSelector';
import { MonthNavigator } from './components/MonthNavigator';
import { TimesheetGrid } from './components/TimesheetGrid';
import { SettingsModal } from './components/SettingsModal';
import { useTimesheetQueryParams } from './hooks/useTimesheetQueryParams';
import { useTimesheetData } from './hooks/useTimesheetData';
import { useProjectConfig } from './hooks/useProjectConfig';
import { usePersonalConfig } from './hooks/usePersonalConfig';

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

  if (!data) return <p>Loading...</p>;

  const isValidUser = selectedUser !== '' && users.includes(selectedUser);
  const selectedEntry = visibleEntries.find(([user]) => user === selectedUser);

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Timesheet</h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            background: 'white',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
          title="Settings"
        >
          ⚙️ Settings
        </button>
      </div>
      <UserSelector users={users} value={selectedUser} onChange={handleUserChange} />

      <div style={{ margin: '0.5em 0' }}>
        <button onClick={() => handleDownloadAll(
          Object.keys(grouped)
            .filter(user => (selectedUser === '' || user === selectedUser))
            .filter(user => !teamDevelopers || teamDevelopers.includes(user))
        )}>Download CSV for all</button>
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
        <div style={{ marginTop: '1em', fontWeight: 'bold' }}>please select a dev</div>
      )}
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};



