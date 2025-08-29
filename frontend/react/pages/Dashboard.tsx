import React from 'react';
import { useConfigStore } from '../stores/configStore';

export const Dashboard: React.FC = () => {
  const { projectConfig, personalConfig } = useConfigStore();

  // Check if configuration is complete
  const isConfigComplete = 
    projectConfig.jiraDomain && 
    personalConfig.jiraPat && 
    personalConfig.userName &&
    projectConfig.teamDevelopers.length > 0;

  const getConfigStatus = () => {
    if (isConfigComplete) {
      return { status: 'complete', color: 'green', text: 'Configuration Complete' };
    }
    
    const missingItems = [];
    if (!projectConfig.jiraDomain) missingItems.push('JIRA Domain');
    if (!personalConfig.jiraPat) missingItems.push('JIRA PAT');
    if (!personalConfig.userName) missingItems.push('User Name');
    if (projectConfig.teamDevelopers.length === 0) missingItems.push('Team Developers');
    
    return { 
      status: 'incomplete', 
      color: 'yellow', 
      text: `Missing: ${missingItems.join(', ')}` 
    };
  };

  const configStatus = getConfigStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">Welcome to your timesheet overview</p>
        </div>

        {/* Configuration Status */}
        <div className="mb-8">
          <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${
            configStatus.status === 'complete' ? 'border-green-200' : 'border-yellow-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  configStatus.status === 'complete' 
                    ? 'bg-green-100' 
                    : 'bg-yellow-100'
                }`}>
                  <span className={`text-lg ${
                    configStatus.status === 'complete' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {configStatus.status === 'complete' ? '✅' : '⚠️'}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Configuration Status
                  </h3>
                  <p className={`text-sm ${
                    configStatus.status === 'complete' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {configStatus.text}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  onClick={() => window.location.href = '/settings'}
                >
                  Configure Settings
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Team Members</h3>
                <p className="text-sm text-gray-600">
                  {projectConfig.teamDevelopers.length} developers configured
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">🏢</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">JIRA Domain</h3>
                <p className="text-sm text-gray-600">
                  {projectConfig.jiraDomain || 'Not configured'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">👤</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Current User</h3>
                <p className="text-sm text-gray-600">
                  {personalConfig.userName || 'Not configured'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                onClick={() => window.location.href = '/calendar'}
              >
                <span className="mr-2">📅</span>
                View Calendar
              </button>
              <button 
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                onClick={() => window.location.href = '/settings'}
              >
                <span className="mr-2">⚙️</span>
                Settings
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">JIRA Domain:</span>
                <span className={projectConfig.jiraDomain ? 'text-green-600' : 'text-red-600'}>
                  {projectConfig.jiraDomain ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">JIRA PAT:</span>
                <span className={personalConfig.jiraPat ? 'text-green-600' : 'text-red-600'}>
                  {personalConfig.jiraPat ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">User Name:</span>
                <span className={personalConfig.userName ? 'text-green-600' : 'text-red-600'}>
                  {personalConfig.userName ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Team Developers:</span>
                <span className={projectConfig.teamDevelopers.length > 0 ? 'text-green-600' : 'text-red-600'}>
                  {projectConfig.teamDevelopers.length > 0 ? `${projectConfig.teamDevelopers.length} configured` : '✗'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Coming Soon Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl">🚀</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              This dashboard will provide comprehensive insights into your team's time tracking data, 
              including productivity trends, project summaries, and actionable analytics to help you 
              make better decisions.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Analytics Dashboard
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Team Insights
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Performance Metrics
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
