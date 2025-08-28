import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { ProjectSettings } from './ProjectSettings';
import { PersonalSettings } from './PersonalSettings';
import { useProjectConfig } from '../hooks/useProjectConfig';
import { usePersonalConfig } from '../hooks/usePersonalConfig';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const projectConfig = useProjectConfig();
  const personalConfig = usePersonalConfig();

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            position: 'fixed',
            inset: 0,
            animation: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
        <Dialog.Content
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            maxWidth: '800px',
            maxHeight: '85vh',
            animation: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Dialog.Title style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
              Settings
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                }}
                title="Close"
              >
                ×
              </button>
            </Dialog.Close>
          </div>

          {/* Tabs */}
          <Tabs.Root defaultValue="project" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Tabs.List
              style={{
                flexShrink: 0,
                display: 'flex',
                borderBottom: '1px solid #ddd',
              }}
            >
              <Tabs.Trigger
                value="project"
                style={{
                  fontFamily: 'inherit',
                  padding: '1rem 2rem',
                  height: '45px',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  lineHeight: 1,
                  color: '#6F767E',
                  userSelect: 'none',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  borderBottom: '2px solid transparent',
                }}
              >
                Project Configuration
              </Tabs.Trigger>
              <Tabs.Trigger
                value="personal"
                style={{
                  fontFamily: 'inherit',
                  padding: '1rem 2rem',
                  height: '45px',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  lineHeight: 1,
                  color: '#6F767E',
                  userSelect: 'none',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  borderBottom: '2px solid transparent',
                }}
              >
                Personal Configuration
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content
              value="project"
              style={{
                flexGrow: 1,
                outline: 'none',
                overflow: 'auto',
                padding: '1rem',
              }}
            >
              <ProjectSettings
                config={projectConfig.config}
                onAddEmojiMapping={projectConfig.addEmojiMapping}
                onUpdateEmojiMapping={projectConfig.updateEmojiMapping}
                onRemoveEmojiMapping={projectConfig.removeEmojiMapping}
                onAddJiraComponent={projectConfig.addJiraComponent}
                onRemoveJiraComponent={projectConfig.removeJiraComponent}
                onAddTeamDeveloper={projectConfig.addTeamDeveloper}
                onRemoveTeamDeveloper={projectConfig.removeTeamDeveloper}
                onExport={projectConfig.exportConfig}
                onImport={projectConfig.importConfig}
                isLoading={projectConfig.isLoading}
              />
            </Tabs.Content>
            <Tabs.Content
              value="personal"
              style={{
                flexGrow: 1,
                outline: 'none',
                overflow: 'auto',
                padding: '1rem',
              }}
            >
              <PersonalSettings
                config={personalConfig.config}
                onAddTimeOffEntry={personalConfig.addTimeOffEntry}
                onUpdateTimeOffEntry={personalConfig.updateTimeOffEntry}
                onRemoveTimeOffEntry={personalConfig.removeTimeOffEntry}
                onAddPersonalEmojiOverride={personalConfig.addPersonalEmojiOverride}
                onUpdatePersonalEmojiOverride={personalConfig.updatePersonalEmojiOverride}
                onRemovePersonalEmojiOverride={personalConfig.removePersonalEmojiOverride}
                onUpdateUIPreference={(key, value) => personalConfig.updateUIPreference(key as any, value)}
                onExport={personalConfig.exportConfig}
                onImport={personalConfig.importConfig}
                isLoading={personalConfig.isLoading}
              />
            </Tabs.Content>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
