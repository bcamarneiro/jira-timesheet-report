import React, { useState } from 'react';
import type { TimeOffEntry } from '../../../types/PersonalConfig';
import type { TicketEmojiMapping } from '../../../types/ProjectConfig';
import { validateEmoji, validateTicketId } from '../utils/emojiMatcher';

interface Props {
  config: {
    timeOffEntries: TimeOffEntry[];
    uiPreferences: {
      theme?: string;
      defaultView?: string;
      defaultUser?: string;
    };
    personalEmojiOverrides: TicketEmojiMapping[];
  };
  onAddTimeOffEntry: (entry: TimeOffEntry) => void;
  onUpdateTimeOffEntry: (index: number, entry: TimeOffEntry) => void;
  onRemoveTimeOffEntry: (index: number) => void;
  onAddPersonalEmojiOverride: (mapping: TicketEmojiMapping) => void;
  onUpdatePersonalEmojiOverride: (index: number, mapping: TicketEmojiMapping) => void;
  onRemovePersonalEmojiOverride: (index: number) => void;
  onUpdateUIPreference: (key: string, value: string) => void;
  onExport: () => void;
  onImport: (jsonString: string) => Promise<boolean>;
  isLoading: boolean;
}

export const PersonalSettings: React.FC<Props> = ({
  config,
  onAddTimeOffEntry,
  onUpdateTimeOffEntry,
  onRemoveTimeOffEntry,
  onAddPersonalEmojiOverride,
  onUpdatePersonalEmojiOverride,
  onRemovePersonalEmojiOverride,
  onUpdateUIPreference,
  onExport,
  onImport,
  isLoading
}) => {
  const [newTimeOffDate, setNewTimeOffDate] = useState('');
  const [newTimeOffHours, setNewTimeOffHours] = useState(8);
  const [newTimeOffDescription, setNewTimeOffDescription] = useState('');
  const [newTicketId, setNewTicketId] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingTimeOffIndex, setEditingTimeOffIndex] = useState<number | null>(null);
  const [editingEmojiIndex, setEditingEmojiIndex] = useState<number | null>(null);
  const [importText, setImportText] = useState('');

  const handleAddTimeOffEntry = () => {
    if (!newTimeOffDate) return;

    onAddTimeOffEntry({
      date: newTimeOffDate,
      hours: newTimeOffHours,
      description: newTimeOffDescription.trim() || undefined
    });

    setNewTimeOffDate('');
    setNewTimeOffHours(8);
    setNewTimeOffDescription('');
  };

  const handleUpdateTimeOffEntry = (index: number) => {
    onUpdateTimeOffEntry(index, {
      date: newTimeOffDate,
      hours: newTimeOffHours,
      description: newTimeOffDescription.trim() || undefined
    });

    setEditingTimeOffIndex(null);
    setNewTimeOffDate('');
    setNewTimeOffHours(8);
    setNewTimeOffDescription('');
  };

  const handleStartEditTimeOff = (index: number) => {
    const entry = config.timeOffEntries[index];
    if (!entry) return;

    setEditingTimeOffIndex(index);
    setNewTimeOffDate(entry.date);
    setNewTimeOffHours(entry.hours);
    setNewTimeOffDescription(entry.description || '');
  };

  const handleCancelEditTimeOff = () => {
    setEditingTimeOffIndex(null);
    setNewTimeOffDate('');
    setNewTimeOffHours(8);
    setNewTimeOffDescription('');
  };

  const handleAddPersonalEmojiOverride = () => {
    if (!newTicketId.trim() || !newEmoji.trim()) return;
    if (!validateTicketId(newTicketId.trim())) {
      alert('Invalid ticket ID format. Use format like "COM-12345"');
      return;
    }
    if (!validateEmoji(newEmoji)) {
      alert('Please enter a valid emoji');
      return;
    }

    onAddPersonalEmojiOverride({
      ticketId: newTicketId.trim(),
      emoji: newEmoji,
      description: newDescription.trim() || undefined
    });

    setNewTicketId('');
    setNewEmoji('');
    setNewDescription('');
  };

  const handleUpdatePersonalEmojiOverride = (index: number) => {
    const mapping = config.personalEmojiOverrides[index];
    if (!mapping) return;

    onUpdatePersonalEmojiOverride(index, {
      ...mapping,
      ticketId: newTicketId.trim(),
      emoji: newEmoji,
      description: newDescription.trim() || undefined
    });

    setEditingEmojiIndex(null);
    setNewTicketId('');
    setNewEmoji('');
    setNewDescription('');
  };

  const handleStartEditEmoji = (index: number) => {
    const mapping = config.personalEmojiOverrides[index];
    if (!mapping) return;

    setEditingEmojiIndex(index);
    setNewTicketId(mapping.ticketId);
    setNewEmoji(mapping.emoji);
    setNewDescription(mapping.description || '');
  };

  const handleCancelEditEmoji = () => {
    setEditingEmojiIndex(null);
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
      <h2>Personal Configuration</h2>
      
      {/* Time Off Entries */}
      <section style={{ marginBottom: '2rem' }}>
        <h3>Time Off Entries</h3>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
          Manage your time off entries for specific dates.
        </p>
        
        {/* Add new time off entry */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
          <input
            type="date"
            value={newTimeOffDate}
            onChange={(e) => setNewTimeOffDate(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <select
            value={newTimeOffHours}
            onChange={(e) => setNewTimeOffHours(Number(e.target.value))}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(hours => (
              <option key={hours} value={hours}>{hours}h</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Description (optional)"
            value={newTimeOffDescription}
            onChange={(e) => setNewTimeOffDescription(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
          />
          {editingTimeOffIndex === null ? (
            <button
              onClick={handleAddTimeOffEntry}
              disabled={!newTimeOffDate}
              style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: '#007bff', color: 'white', cursor: 'pointer' }}
            >
              Add
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleUpdateTimeOffEntry(editingTimeOffIndex)}
                disabled={!newTimeOffDate}
                style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: '#28a745', color: 'white', cursor: 'pointer' }}
              >
                Update
              </button>
              <button
                onClick={handleCancelEditTimeOff}
                style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Existing time off entries */}
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto' }}>
          {config.timeOffEntries.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
              No time off entries configured
            </div>
          ) : (
            config.timeOffEntries.map((entry, index) => (
              <div key={index} style={{ padding: '0.75rem', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 'bold', minWidth: '120px' }}>{entry.date}</span>
                <span style={{ minWidth: '60px' }}>{entry.hours}h</span>
                <span style={{ color: '#666', flex: 1 }}>{entry.description || ''}</span>
                <button
                  onClick={() => handleStartEditTimeOff(index)}
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onRemoveTimeOffEntry(index)}
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #dc3545', background: '#dc3545', color: 'white', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Personal Emoji Overrides */}
      <section style={{ marginBottom: '2rem' }}>
        <h3>Personal Emoji Overrides</h3>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
          Personal emoji mappings that override project settings for specific ticket IDs.
        </p>
        
        {/* Add new personal emoji override */}
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
          {editingEmojiIndex === null ? (
            <button
              onClick={handleAddPersonalEmojiOverride}
              disabled={!newTicketId.trim() || !newEmoji.trim()}
              style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: '#007bff', color: 'white', cursor: 'pointer' }}
            >
              Add
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleUpdatePersonalEmojiOverride(editingEmojiIndex)}
                disabled={!newTicketId.trim() || !newEmoji.trim()}
                style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: '#28a745', color: 'white', cursor: 'pointer' }}
              >
                Update
              </button>
              <button
                onClick={handleCancelEditEmoji}
                style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Existing personal emoji overrides */}
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto' }}>
          {config.personalEmojiOverrides.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
              No personal emoji overrides configured
            </div>
          ) : (
            config.personalEmojiOverrides.map((mapping, index) => (
              <div key={index} style={{ padding: '0.75rem', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{mapping.emoji}</span>
                <span style={{ fontWeight: 'bold', minWidth: '120px' }}>{mapping.ticketId}</span>
                <span style={{ color: '#666', flex: 1 }}>{mapping.description || ''}</span>
                <button
                  onClick={() => handleStartEditEmoji(index)}
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onRemovePersonalEmojiOverride(index)}
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #dc3545', background: '#dc3545', color: 'white', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* UI Preferences */}
      <section style={{ marginBottom: '2rem' }}>
        <h3>UI Preferences</h3>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
          Personal display preferences.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Default User:
            </label>
            <input
              type="text"
              placeholder="Your display name (e.g., John Doe)"
              value={config.uiPreferences.defaultUser || ''}
              onChange={(e) => onUpdateUIPreference('defaultUser', e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
            />
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              This will automatically select your user when the page loads
            </small>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Theme:
            </label>
            <select
              value={config.uiPreferences.theme || 'default'}
              onChange={(e) => onUpdateUIPreference('theme', e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Default View:
            </label>
            <select
              value={config.uiPreferences.defaultView || 'month'}
              onChange={(e) => onUpdateUIPreference('defaultView', e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
            </select>
          </div>
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
