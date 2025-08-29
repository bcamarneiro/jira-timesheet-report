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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Configure your application preferences and project settings
          </p>
        </div>
        
        {/* Settings Content */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="project" className="w-full">
              <div className="border-b border-gray-200">
                <TabsList className="flex w-full h-14 rounded-none border-b-0 bg-transparent space-x-1">
                  <TabsTrigger 
                    value="project" 
                    className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none flex-1"
                  >
                    <span>🏢</span>
                    <span>Project</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="personal" 
                    className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none flex-1"
                  >
                    <span>👤</span>
                    <span>Personal</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-6">
                <TabsContent value="project" className="space-y-8 mt-0">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Project Settings</h3>
                    <p className="text-sm text-gray-600">
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal Preferences</h3>
                    <p className="text-sm text-gray-600">
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
