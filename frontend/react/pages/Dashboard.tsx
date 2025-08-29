import React from 'react';
import { useConfigStore } from '../stores/configStore';

export const Dashboard: React.FC = () => {
  const { projectConfig, personalConfig, isEssentialConfigComplete, getMissingEssentialConfig } = useConfigStore();

  // Check if essential configuration is complete
  const isEssentialComplete = isEssentialConfigComplete();
  const missingEssential = getMissingEssentialConfig();

  // Check if full configuration is complete (including team developers)
  const isFullConfigComplete = 
    isEssentialComplete &&
    projectConfig.teamDevelopers.length > 0;

  const getConfigStatus = () => {
    if (isEssentialComplete) {
      if (isFullConfigComplete) {
        return { status: 'complete', color: 'green', text: 'Configuration Complete' };
      } else {
        return { status: 'partial', color: 'blue', text: 'Essential config complete, team developers needed' };
      }
    }
    
    return { 
      status: 'critical', 
      color: 'red', 
      text: `Missing essential configuration: ${missingEssential.join(', ')}` 
    };
  };

  const configStatus = getConfigStatus();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Hello {personalConfig.userName || 'there'}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">Welcome to your timesheet overview</p>
        </div>
        
        {/* Critical Warning Banner */}
        {!isEssentialComplete ? (
          <div className="mb-8 bg-destructive/10 border border-destructive/20 rounded-xl p-6">
            <div className="flex items-start">
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-destructive mb-2">
                <span className="text-destructive text-lg">🚨</span> Essential Configuration Required
                </h3>
                <p className="text-destructive/80 mb-4">
                  The following essential settings must be configured before you can access the calendar and other features:
                </p>
                <ul className="list-disc list-inside text-destructive/80 mb-4 space-y-1">
                  {missingEssential.map((item, index) => (
                    <li key={index} className="font-medium">{item}</li>
                  ))}
                </ul>
                <button 
                  className="px-6 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors duration-200 font-medium"
                  onClick={() => window.location.href = '/settings'}
                >
                  Configure Essential Settings Now
                </button>
              </div>
            </div>
          </div>
        ): (        <div className="mb-8">
          <div className={`bg-card rounded-xl shadow-sm border p-6 border-primary/20`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                  <span className={`text-lg text-primary`}>✅</span> Configuration Status
                  </h3>
                  <p className={`text-sm text-primary/80`}>
                    {configStatus.text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>)}


        
        {/* Team Members Section */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4">
              
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground"><span className="text-primary text-2xl">👥</span> Team Members</h3>

              {projectConfig.teamDevelopers.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground mb-2">
                  {projectConfig.teamDevelopers.length} team member{projectConfig.teamDevelopers.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div
                    className="flex items-center p-3 bg-muted rounded-lg border border-border hover:bg-accent transition-colors duration-200"
                >
                  <span className="text-sm font-medium text-foreground truncate">
                    {personalConfig.userName}
                  </span>
                </div>
                {projectConfig.teamDevelopers.map((developer, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-muted rounded-lg border border-border hover:bg-accent transition-colors duration-200"
                  >
                    <span className="text-sm font-medium text-foreground truncate">
                      {developer}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8">
              <p className="text-muted-foreground text-base mb-2">No team members configured yet</p>
              <p className="text-muted-foreground/60 text-sm">Add team members in the Settings page</p>
            </div>
          )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
