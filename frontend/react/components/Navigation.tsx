import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useConfigStore } from '../stores/configStore';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { isEssentialConfigComplete } = useConfigStore();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊', requiresConfig: false },
    { path: '/calendar', label: 'Calendar', icon: '📅', requiresConfig: true },
    { path: '/settings', label: 'Settings', icon: '⚙️', requiresConfig: false },
  ];

  return (
    <nav className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Timesheet Report
            </h1>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-3">
            {navItems.map((item) => {
              const isConfigComplete = isEssentialConfigComplete();
              const isDisabled = item.requiresConfig && !isConfigComplete;
              
              return (
                <Link
                  key={item.path}
                  to={isDisabled ? '/' : item.path}
                  className={`flex flex-row gap items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isDisabled
                      ? 'text-muted-foreground cursor-not-allowed bg-muted border border-border'
                      : isActive(item.path)
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent'
                  }`}
                  title={isDisabled ? 'Configure essential settings first' : undefined}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
