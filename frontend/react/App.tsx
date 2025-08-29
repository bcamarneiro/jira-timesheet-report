import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Calendar } from './pages/Calendar';
import { Settings } from './pages/Settings';
import { useConfigStore } from './stores/configStore';
import './utils/persistenceTest'; // Import for development testing
import './utils/clearOldData'; // Import for clearing old localStorage
import './utils/testUserSpecificTimeOff'; // Import for testing user-specific time off

export const App: React.FC = () => {
  const { personalConfig } = useConfigStore();

  useEffect(() => {
    // Apply theme based on personal settings preference
    const theme = personalConfig.uiPreferences.theme;
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Default to dark theme if no preference is set
      document.documentElement.classList.add('dark');
    }
  }, [personalConfig.uiPreferences.theme]);

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};



