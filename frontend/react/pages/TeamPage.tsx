import type React from 'react';
import { Navigate } from 'react-router-dom';

export const TeamPage: React.FC = () => {
	return <Navigate to="/reports" replace />;
};
