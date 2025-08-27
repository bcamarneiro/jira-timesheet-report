import React, { useState } from 'react';
import type { TicketEmojiMapping } from '../../../types/ProjectConfig';
import { validateEmoji, validateTicketId } from '../utils/emojiMatcher';

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

  const handleAddEmojiMapping = () => {
    if (!newTicketId.trim() || !newEmoji.trim()) return;
    if (!validateTicketId(newTicketId.trim())) {
      alert('Invalid ticket ID format. Use format like "COM-12345"');
      return;
    }
    if (!validateEmoji(newEmoji)) {
      alert('Please enter a valid emoji');
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
      alert('Configuration imported successfully!');
    } else {
      alert('Failed to import configuration. Please check the JSON format.');
    }
  };

  const handleExport = () => {
    onExport();
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
            <button
              onClick={handleAddEmojiMapping}
              disabled={!newTicketId.trim() || !newEmoji.trim()}
              style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: '#007bff', color: 'white', cursor: 'pointer' }}
            >
              Add
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleUpdateEmojiMapping(editingIndex)}
                disabled={!newTicketId.trim() || !newEmoji.trim()}
                style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: '#28a745', color: 'white', cursor: 'pointer' }}
              >
                Update
              </button>
              <button
                onClick={handleCancelEdit}
                style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
              >
                Cancel
              </button>
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
                <button
                  onClick={() => handleStartEdit(index)}
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onRemoveEmojiMapping(index)}
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #dc3545', background: '#dc3545', color: 'white', cursor: 'pointer' }}
                >
                  Remove
                </button>
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
          <button
            onClick={() => {
              onAddJiraComponent(newComponent);
              setNewComponent('');
            }}
            disabled={!newComponent.trim()}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: '#007bff', color: 'white', cursor: 'pointer' }}
          >
            Add
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {config.jiraComponents.map((component, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
              <span>{component}</span>
              <button
                onClick={() => onRemoveJiraComponent(component)}
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
          <button
            onClick={() => {
              onAddTeamDeveloper(newDeveloper);
              setNewDeveloper('');
            }}
            disabled={!newDeveloper.trim()}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: '#007bff', color: 'white', cursor: 'pointer' }}
          >
            Add
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {config.teamDevelopers.map((developer, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
              <span>{developer}</span>
              <button
                onClick={() => onRemoveTeamDeveloper(developer)}
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
          <button
            onClick={handleExport}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #28a745', background: '#28a745', color: 'white', cursor: 'pointer' }}
          >
            Export Configuration
          </button>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <textarea
            placeholder="Paste JSON configuration here..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            style={{ width: '100%', height: '100px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'monospace' }}
          />
        </div>
        
        <button
          onClick={handleImport}
          disabled={!importText.trim() || isLoading}
          style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #007bff', background: '#007bff', color: 'white', cursor: 'pointer' }}
        >
          {isLoading ? 'Importing...' : 'Import Configuration'}
        </button>
      </section>
    </div>
  );
};
