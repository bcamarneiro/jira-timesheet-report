import React from 'react';

type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Select a Developer",
  description = "Choose a team member to view their timesheet",
  icon = "👤"
}) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-gray-400 text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};
