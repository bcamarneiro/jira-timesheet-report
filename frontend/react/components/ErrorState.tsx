import React from 'react';

type ErrorStateProps = {
  error: string;
  title?: string;
  icon?: string;
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  title = "Error Loading Data",
  icon = "⚠️"
}) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-red-500 text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{error}</p>
    </div>
  );
};
