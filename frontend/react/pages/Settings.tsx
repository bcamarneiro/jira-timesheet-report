import React from 'react';
import { ProjectSettings } from '../components/ProjectSettings';
import { PersonalSettings } from '../components/PersonalSettings';
import { useConfigStore } from '../stores/configStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/Button';

export const Settings: React.FC = () => {
  const {
    projectConfig,
    personalConfig,
    isLoading,
    // Project actions
    updateProjectConfig,
    addEmojiMapping,
    updateEmojiMapping,
    removeEmojiMapping,
    addJiraComponent,
    removeJiraComponent,
    addTeamDeveloper,
    removeTeamDeveloper,
    exportProjectConfig,
    importProjectConfig,
    // Personal actions
    updatePersonalConfig,
    addTimeOffEntry,
    updateTimeOffEntry,
    
    removeTimeOffEntry,
    addPersonalEmojiOverride,
    updatePersonalEmojiOverride,
    removePersonalEmojiOverride,
    updateUIPreference,
    exportPersonalConfig,
    importPersonalConfig,
  } = useConfigStore();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure your application preferences and project settings
          </p>
        </div>
        
        {/* Settings Content */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="project" className="w-full">
              <div className="border-b border-border">
                <TabsList className="flex w-full h-14 rounded-none border-b-0 bg-transparent space-x-1">
                  <TabsTrigger 
                    value="project" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1"
                  >
                    <span>🏢</span>
                    <span>Project</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="personal" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1"
                  >
                    <span>👤</span>
                    <span>Personal</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-6">
                <TabsContent value="project" className="space-y-8 mt-0">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Project Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure Jira domain, team members, and project-specific settings to customize how your timesheet data is processed and displayed.
                    </p>
                  </div>
                  <ProjectSettings
                    config={projectConfig}
                    onUpdateProjectConfig={updateProjectConfig}
                    onAddEmojiMapping={addEmojiMapping}
                    onUpdateEmojiMapping={updateEmojiMapping}
                    onRemoveEmojiMapping={removeEmojiMapping}
                    onAddJiraComponent={addJiraComponent}
                    onRemoveJiraComponent={removeJiraComponent}
                    onAddTeamDeveloper={addTeamDeveloper}
                    onRemoveTeamDeveloper={removeTeamDeveloper}
                    onExport={exportProjectConfig}
                    onImport={importProjectConfig}
                    isLoading={isLoading}
                  />
                </TabsContent>
                
                <TabsContent value="personal" className="space-y-8 mt-0">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Personal Preferences</h3>
                    <p className="text-sm text-muted-foreground">
                      Set your JIRA credentials, time-off preferences, and UI customizations to personalize your experience.
                    </p>
                  </div>
                  <PersonalSettings
                    config={personalConfig}
                    currentUser={personalConfig.userName}
                    onUpdatePersonalConfig={updatePersonalConfig}
                    onAddTimeOffEntry={(entry) => addTimeOffEntry(personalConfig.userName, entry)}
                    onUpdateTimeOffEntry={(index, entry) => updateTimeOffEntry(personalConfig.userName, index, entry)}
                    onRemoveTimeOffEntry={(index) => removeTimeOffEntry(personalConfig.userName, index)}
                    onAddPersonalEmojiOverride={addPersonalEmojiOverride}
                    onUpdatePersonalEmojiOverride={updatePersonalEmojiOverride}
                    onRemovePersonalEmojiOverride={removePersonalEmojiOverride}
                    onUpdateUIPreference={(key, value) => updateUIPreference(key as keyof typeof personalConfig.uiPreferences, value)}
                    onExport={exportPersonalConfig}
                    onImport={importPersonalConfig}
                    isLoading={isLoading}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
