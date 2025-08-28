import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">Welcome to your timesheet overview</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Team Overview</h3>
                <p className="text-sm text-gray-600">Productivity and activity metrics</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">📈</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Recent Activity</h3>
                <p className="text-sm text-gray-600">Latest timesheet entries</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">⚡</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Quick Actions</h3>
                <p className="text-sm text-gray-600">Common shortcuts</p>
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
