import React, { useState, useEffect } from 'react';
import { SettingsModal } from '../components/SettingsModal';
import { Button } from '../components/Button';

export const Settings: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading time and check if localStorage is available
    const timer = setTimeout(() => {
      try {
        // Test if localStorage is available
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        setIsLoading(false);
      } catch (err) {
        setError('Settings cannot be loaded. Please check if localStorage is enabled.');
        setIsLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-32 bg-gray-300 rounded-lg"></div>
                <div className="h-32 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Settings</h2>
              <p className="text-red-700 mb-6">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-lg text-gray-600">Configure your application preferences</p>
        </div>
        
        {/* Main Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Configuration</h2>
              <p className="text-gray-600">
                Configure your project settings and personal preferences to customize your timesheet experience.
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Button
                onClick={() => setIsSettingsOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center"
              >
                <span className="mr-2">⚙️</span>
                Open Settings
              </Button>
            </div>
          </div>
          
          {/* Settings Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">🏢</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Project Settings</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Configure Jira domain, team members, and project-specific settings to customize how your timesheet data is processed and displayed.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">👤</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Personal Preferences</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Set your default user, time-off preferences, and UI customizations to personalize your experience.
              </p>
            </div>
          </div>
        </div>
        
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </div>
  );
};
