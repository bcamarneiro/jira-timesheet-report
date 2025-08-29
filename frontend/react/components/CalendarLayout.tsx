import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-4xl">{title}</CardTitle>
            <CardDescription className="text-lg">{subtitle}</CardDescription>
          </CardHeader>
        </Card>
        {children}
      </div>
    </div>
  );
};
