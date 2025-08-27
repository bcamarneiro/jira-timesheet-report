import React, { useState } from 'react';
import { ProjectSettings } from './ProjectSettings';
import { PersonalSettings } from './PersonalSettings';
import { useProjectConfig } from '../hooks/useProjectConfig';
import { usePersonalConfig } from '../hooks/usePersonalConfig';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'project' | 'personal'>('project');
  
  const projectConfig = useProjectConfig();
  const personalConfig = usePersonalConfig();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '800px',
        height: '90%',
        maxHeight: '800px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Settings</h1>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '4px'
            }}
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #ddd'
        }}>
          <button
            onClick={() => setActiveTab('project')}
            style={{
              padding: '1rem 2rem',
              border: 'none',
              background: activeTab === 'project' ? '#007bff' : 'transparent',
              color: activeTab === 'project' ? 'white' : '#333',
              cursor: 'pointer',
              borderBottom: activeTab === 'project' ? '2px solid #007bff' : '2px solid transparent'
            }}
          >
            Project Configuration
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            style={{
              padding: '1rem 2rem',
              border: 'none',
              background: activeTab === 'personal' ? '#007bff' : 'transparent',
              color: activeTab === 'personal' ? 'white' : '#333',
              cursor: 'pointer',
              borderBottom: activeTab === 'personal' ? '2px solid #007bff' : '2px solid transparent'
            }}
          >
            Personal Configuration
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto'
        }}>
          {activeTab === 'project' ? (
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
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};
