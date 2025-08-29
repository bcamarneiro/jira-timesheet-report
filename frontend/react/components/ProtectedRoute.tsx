import React from 'react';
import { Navigate } from 'react-router-dom';
import { useConfigStore } from '../stores/configStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isEssentialConfigComplete } = useConfigStore();

  if (!isEssentialConfigComplete()) {
    // Redirect to dashboard if essential configuration is missing
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
