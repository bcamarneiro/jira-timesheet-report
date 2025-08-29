import React, { useState } from 'react';
import { useConfigStore } from '../stores/configStore';
import { Button } from './Button';
import * as Toast from '@radix-ui/react-toast';

export const ProjectSettingsZustand: React.FC = () => {
  const {
    projectConfig,
    isLoading,
    addEmojiMapping,
    updateEmojiMapping,
    removeEmojiMapping,
    addJiraComponent,
    removeJiraComponent,
    addTeamDeveloper,
    removeTeamDeveloper,
    exportProjectConfig,
    importProjectConfig
  } = useConfigStore();

  const [newTicketId, setNewTicketId] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newComponent, setNewComponent] = useState('');
  const [newDeveloper, setNewDeveloper] = useState('');
  const [editingEmojiIndex, setEditingEmojiIndex] = useState<number | null>(null);
  const [importText, setImportText] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const handleAddEmojiMapping = () => {
    if (!newTicketId.trim() || !newEmoji.trim()) return;

    addEmojiMapping({
      ticketId: newTicketId.trim(),
      emoji: newEmoji.trim(),
      description: newDescription.trim() || undefined
    });

    setNewTicketId('');
    setNewEmoji('');
    setNewDescription('');
    showToast('Emoji mapping added successfully!', 'success');
  };

  const handleUpdateEmojiMapping = (index: number) => {
    if (!newTicketId.trim() || !newEmoji.trim()) return;

    updateEmojiMapping(index, {
      ticketId: newTicketId.trim(),
      emoji: newEmoji.trim(),
      description: newDescription.trim() || undefined
    });

    setNewTicketId('');
    setNewEmoji('');
    setNewDescription('');
    setEditingEmojiIndex(null);
    showToast('Emoji mapping updated successfully!', 'success');
  };

  const handleRemoveEmojiMapping = (index: number) => {
    removeEmojiMapping(index);
    showToast('Emoji mapping removed successfully!', 'success');
  };

  const handleAddJiraComponent = () => {
    if (!newComponent.trim()) return;
    addJiraComponent(newComponent.trim());
    setNewComponent('');
    showToast('Jira component added successfully!', 'success');
  };

  const handleRemoveJiraComponent = (component: string) => {
    removeJiraComponent(component);
    showToast('Jira component removed successfully!', 'success');
  };

  const handleAddTeamDeveloper = () => {
    if (!newDeveloper.trim()) return;
    addTeamDeveloper(newDeveloper.trim());
    setNewDeveloper('');
    showToast('Team developer added successfully!', 'success');
  };

  const handleRemoveTeamDeveloper = (developer: string) => {
    removeTeamDeveloper(developer);
    showToast('Team developer removed successfully!', 'success');
  };

  const handleExport = () => {
    const configJson = exportProjectConfig();
    navigator.clipboard.writeText(configJson);
    showToast('Configuration copied to clipboard!', 'success');
  };

  const handleImport = async () => {
    if (!importText.trim()) return;

    const success = await importProjectConfig(importText);
    if (success) {
      setImportText('');
      showToast('Configuration imported successfully!', 'success');
    } else {
      showToast('Failed to import configuration. Please check the JSON format.', 'error');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Project Configuration</h2>

      {/* Emoji Mappings */}
      <section>
        <h3>Emoji Mappings</h3>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Ticket ID (e.g., PROJ-123)"
            value={newTicketId}
            onChange={(e) => setNewTicketId(e.target.value)}
            style={{ marginRight: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="Emoji (e.g., 🐛)"
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
            style={{ marginRight: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            style={{ marginRight: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <Button
            onClick={editingEmojiIndex !== null ? () => handleUpdateEmojiMapping(editingEmojiIndex) : handleAddEmojiMapping}
            variant="primary"
            size="small"
          >
            {editingEmojiIndex !== null ? 'Update' : 'Add'} Mapping
          </Button>
          {editingEmojiIndex !== null && (
            <Button
              onClick={() => {
                setEditingEmojiIndex(null);
                setNewTicketId('');
                setNewEmoji('');
                setNewDescription('');
              }}
              variant="secondary"
              size="small"
            >
              Cancel
            </Button>
          )}
        </div>

        <div>
          {projectConfig.emojiMappings.map((mapping, index) => (
            <div key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', border: '1px solid #eee', borderRadius: '4px' }}>
              <span style={{ marginRight: '0.5rem' }}>{mapping.emoji}</span>
              <span style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>{mapping.ticketId}</span>
              {mapping.description && <span style={{ color: '#666' }}>({mapping.description})</span>}
              <Button
                onClick={() => {
                  setEditingEmojiIndex(index);
                  setNewTicketId(mapping.ticketId);
                  setNewEmoji(mapping.emoji);
                  setNewDescription(mapping.description || '');
                }}
                variant="secondary"
                size="small"
                style={{ marginLeft: '0.5rem' }}
              >
                Edit
              </Button>
              <Button
                onClick={() => handleRemoveEmojiMapping(index)}
                variant="danger"
                size="small"
                style={{ marginLeft: '0.25rem' }}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Jira Components */}
      <section>
        <h3>Jira Components</h3>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Component name"
            value={newComponent}
            onChange={(e) => setNewComponent(e.target.value)}
            style={{ marginRight: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <Button onClick={handleAddJiraComponent} variant="primary" size="small">
            Add Component
          </Button>
        </div>

        <div>
          {projectConfig.jiraComponents.map((component, index) => (
            <div key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', border: '1px solid #eee', borderRadius: '4px' }}>
              <span>{component}</span>
              <Button
                onClick={() => handleRemoveJiraComponent(component)}
                variant="danger"
                size="small"
                style={{ marginLeft: '0.5rem' }}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Team Developers */}
      <section>
        <h3>Team Developers</h3>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Developer name"
            value={newDeveloper}
            onChange={(e) => setNewDeveloper(e.target.value)}
            style={{ marginRight: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <Button onClick={handleAddTeamDeveloper} variant="primary" size="small">
            Add Developer
          </Button>
        </div>

        <div>
          {projectConfig.teamDevelopers.map((developer, index) => (
            <div key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', border: '1px solid #eee', borderRadius: '4px' }}>
              <span>{developer}</span>
              <Button
                onClick={() => handleRemoveTeamDeveloper(developer)}
                variant="danger"
                size="small"
                style={{ marginLeft: '0.5rem' }}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Import/Export */}
      <section>
        <h3>Import/Export Configuration</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <Button onClick={handleExport} variant="primary" size="small">
            Export Configuration
          </Button>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <textarea
            placeholder="Paste JSON configuration here..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            style={{ width: '100%', height: '100px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'monospace' }}
          />
        </div>
        
        <Button
          onClick={handleImport}
          disabled={!importText.trim() || isLoading}
          variant="primary"
          size="small"
        >
          {isLoading ? 'Importing...' : 'Import Configuration'}
        </Button>
      </section>

      {/* Toast Notifications */}
      <Toast.Provider>
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '1rem',
            backgroundColor: toastType === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            borderRadius: '4px',
            zIndex: 1000,
          }}
        >
          <Toast.Title>{toastMessage}</Toast.Title>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>
    </div>
  );
};
