import React from 'react';

type CalendarLayoutProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
};

export const CalendarLayout: React.FC<CalendarLayoutProps> = ({ 
  children, 
  title = "Timesheet Calendar",
  subtitle = "View and manage your team's time tracking"
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-lg text-gray-600">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
};
