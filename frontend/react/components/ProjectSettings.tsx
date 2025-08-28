import React, { useState } from 'react';
import * as Toast from '@radix-ui/react-toast';
import type { TicketEmojiMapping } from '../../../types/ProjectConfig';
import { validateEmoji, validateTicketId } from '../utils/emojiMatcher';
import { Button } from './Button';

interface Props {
  config: {
    emojiMappings: TicketEmojiMapping[];
    jiraComponents: string[];
    teamDevelopers: string[];
  };
  onAddEmojiMapping: (mapping: TicketEmojiMapping) => void;
  onUpdateEmojiMapping: (index: number, mapping: TicketEmojiMapping) => void;
  onRemoveEmojiMapping: (index: number) => void;
  onAddJiraComponent: (component: string) => void;
  onRemoveJiraComponent: (component: string) => void;
  onAddTeamDeveloper: (developer: string) => void;
  onRemoveTeamDeveloper: (developer: string) => void;
  onExport: () => void;
  onImport: (jsonString: string) => Promise<boolean>;
  isLoading: boolean;
}

export const ProjectSettings: React.FC<Props> = ({
  config,
  onAddEmojiMapping,
  onUpdateEmojiMapping,
  onRemoveEmojiMapping,
  onAddJiraComponent,
  onRemoveJiraComponent,
  onAddTeamDeveloper,
  onRemoveTeamDeveloper,
  onExport,
  onImport,
  isLoading
}) => {
  const [newTicketId, setNewTicketId] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newComponent, setNewComponent] = useState('');
  const [newDeveloper, setNewDeveloper] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
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
    if (!validateTicketId(newTicketId.trim())) {
      showToast('Invalid ticket ID format. Use format like "COM-12345"', 'error');
      return;
    }
    if (!validateEmoji(newEmoji)) {
      showToast('Please enter a valid emoji', 'error');
      return;
    }

    onAddEmojiMapping({
      ticketId: newTicketId.trim(),
      emoji: newEmoji,
      description: newDescription.trim() || undefined
    });

    setNewTicketId('');
    setNewEmoji('');
    setNewDescription('');
    showToast('Emoji mapping added successfully!', 'success');
  };

  const handleUpdateEmojiMapping = (index: number) => {
    const mapping = config.emojiMappings[index];
    if (!mapping) return;

    onUpdateEmojiMapping(index, {
      ...mapping,
      ticketId: newTicketId.trim(),
      emoji: newEmoji,
      description: newDescription.trim() || undefined
    });

    setEditingIndex(null);
    setNewTicketId('');
    setNewEmoji('');
    setNewDescription('');
    showToast('Emoji mapping updated successfully!', 'success');
  };

  const handleStartEdit = (index: number) => {
    const mapping = config.emojiMappings[index];
    if (!mapping) return;

    setEditingIndex(index);
    setNewTicketId(mapping.ticketId);
    setNewEmoji(mapping.emoji);
    setNewDescription(mapping.description || '');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewTicketId('');
    setNewEmoji('');
    setNewDescription('');
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    const success = await onImport(importText);
    if (success) {
      setImportText('');
      showToast('Configuration imported successfully!', 'success');
    } else {
      showToast('Failed to import configuration. Please check the JSON format.', 'error');
    }
  };

  const handleExport = () => {
    onExport();
    showToast('Configuration exported to clipboard!', 'success');
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Project Configuration</h2>
      
      {/* Emoji Mappings */}
      <section style={{ marginBottom: '2rem' }}>
        <h3>Ticket Emoji Mappings</h3>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
          Configure emojis to display next to specific ticket IDs in daylogs.
        </p>
        
        {/* Add new mapping */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Ticket ID (e.g., COM-12345)"
            value={newTicketId}
            onChange={(e) => setNewTicketId(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="Emoji"
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '80px' }}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
          />
          {editingIndex === null ? (
            <Button
              onClick={handleAddEmojiMapping}
              disabled={!newTicketId.trim() || !newEmoji.trim()}
              variant="primary"
              size="small"
            >
              Add
            </Button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                onClick={() => handleUpdateEmojiMapping(editingIndex)}
                disabled={!newTicketId.trim() || !newEmoji.trim()}
                variant="primary"
                size="small"
              >
                Update
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="secondary"
                size="small"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Existing mappings */}
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto' }}>
          {config.emojiMappings.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
              No emoji mappings configured
            </div>
          ) : (
            config.emojiMappings.map((mapping, index) => (
              <div key={index} style={{ padding: '0.75rem', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{mapping.emoji}</span>
                <span style={{ fontWeight: 'bold', minWidth: '120px' }}>{mapping.ticketId}</span>
                <span style={{ color: '#666', flex: 1 }}>{mapping.description || ''}</span>
                <Button
                  onClick={() => handleStartEdit(index)}
                  variant="secondary"
                  size="small"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => onRemoveEmojiMapping(index)}
                  variant="danger"
                  size="small"
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Jira Components */}
      <section style={{ marginBottom: '2rem' }}>
        <h3>Jira Components</h3>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
          Filter worklogs to only include issues from these components. Leave empty to include all components.
        </p>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Component name"
            value={newComponent}
            onChange={(e) => setNewComponent(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
          />
          <Button
            onClick={() => {
              onAddJiraComponent(newComponent);
              setNewComponent('');
              showToast('Component added successfully!', 'success');
            }}
            disabled={!newComponent.trim()}
            variant="primary"
            size="small"
          >
            Add
          </Button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {config.jiraComponents.map((component, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
              <span>{component}</span>
              <button
                onClick={() => {
                  onRemoveJiraComponent(component);
                  showToast('Component removed successfully!', 'success');
                }}
                style={{ border: 'none', background: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Team Developers */}
      <section style={{ marginBottom: '2rem' }}>
        <h3>Team Developers</h3>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
          List of team members who should be considered developers for filtering purposes.
        </p>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Developer name"
            value={newDeveloper}
            onChange={(e) => setNewDeveloper(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
          />
          <Button
            onClick={() => {
              onAddTeamDeveloper(newDeveloper);
              setNewDeveloper('');
              showToast('Developer added successfully!', 'success');
            }}
            disabled={!newDeveloper.trim()}
            variant="primary"
            size="small"
          >
            Add
          </Button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {config.teamDevelopers.map((developer, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
              <span>{developer}</span>
              <button
                onClick={() => {
                  onRemoveTeamDeveloper(developer);
                  showToast('Developer removed successfully!', 'success');
                }}
                style={{ border: 'none', background: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Import/Export */}
      <section>
        <h3>Import/Export Configuration</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <Button
            onClick={handleExport}
            variant="primary"
            size="small"
          >
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
            backgroundColor: toastType === 'success' ? '#d4edda' : '#f8d7da',
            border: `1px solid ${toastType === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px',
            padding: '1rem',
            margin: '1rem',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            zIndex: 1000,
            maxWidth: '300px'
          }}
        >
          <Toast.Title style={{ 
            color: toastType === 'success' ? '#155724' : '#721c24',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            {toastType === 'success' ? 'Success' : 'Error'}
          </Toast.Title>
          <Toast.Description style={{ 
            color: toastType === 'success' ? '#155724' : '#721c24'
          }}>
            {toastMessage}
          </Toast.Description>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>
    </div>
  );
};
