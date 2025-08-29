import React, { useState } from 'react';
import * as Toast from '@radix-ui/react-toast';
import type { TimeOffEntry } from '../../../types/PersonalConfig';
import type { TicketEmojiMapping } from '../../../types/ProjectConfig';
import { validateEmoji, validateTicketId } from '../utils/emojiMatcher';
import { Button } from './Button';

interface Props {
  config: {
    timeOffEntries: Record<string, TimeOffEntry[]>;
    uiPreferences: {
      theme?: string;
      defaultView?: string;
      defaultUser?: string;
    };
    personalEmojiOverrides: TicketEmojiMapping[];
    jiraPat: string;
    userName: string;
  };
  currentUser: string;
  onAddTimeOffEntry: (entry: TimeOffEntry) => void;
  onUpdateTimeOffEntry: (index: number, entry: TimeOffEntry) => void;
  onRemoveTimeOffEntry: (index: number) => void;
  onAddPersonalEmojiOverride: (mapping: TicketEmojiMapping) => void;
  onUpdatePersonalEmojiOverride: (index: number, mapping: TicketEmojiMapping) => void;
  onRemovePersonalEmojiOverride: (index: number) => void;
  onUpdateUIPreference: (key: string, value: string) => void;
  onUpdatePersonalConfig: (updates: Partial<{
    jiraPat: string;
    userName: string;
  }>) => void;
  onExport: () => void;
  onImport: (jsonString: string) => Promise<boolean>;
  isLoading: boolean;
}

export const PersonalSettings: React.FC<Props> = ({
  config,
  currentUser,
  onAddTimeOffEntry,
  onUpdateTimeOffEntry,
  onRemoveTimeOffEntry,
  onAddPersonalEmojiOverride,
  onUpdatePersonalEmojiOverride,
  onRemovePersonalEmojiOverride,
  onUpdateUIPreference,
  onUpdatePersonalConfig,
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
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

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
    showToast('Time off entry added successfully!', 'success');
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
    showToast('Time off entry updated successfully!', 'success');
  };

  const handleStartEditTimeOff = (index: number) => {
    const userEntries = config.timeOffEntries[currentUser] || [];
    const entry = userEntries[index];
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
      showToast('Invalid ticket ID format. Use format like "COM-12345"', 'error');
      return;
    }
    if (!validateEmoji(newEmoji)) {
      showToast('Please enter a valid emoji', 'error');
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
    showToast('Personal emoji override added successfully!', 'success');
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
    showToast('Personal emoji override updated successfully!', 'success');
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
             <h2 style={{ color: 'hsl(var(--foreground))' }}>Personal Configuration</h2>
      
      {/* JIRA Configuration */}
      <section style={{ marginBottom: '2rem' }}>
                 <h3 style={{ color: 'hsl(var(--foreground))' }}>JIRA Configuration</h3>
         <p style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>
           Configure your JIRA credentials and personal information.
         </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
                         <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>
               Your Name:
             </label>
                         <input
               type="text"
               placeholder="Your full name (e.g., John Doe)"
               value={config.userName}
               onChange={(e) => onUpdatePersonalConfig({ userName: e.target.value })}
               style={{ 
                 padding: '0.5rem', 
                 borderRadius: '4px', 
                 border: '1px solid hsl(var(--border))', 
                 width: '100%',
                 backgroundColor: 'hsl(var(--background))',
                 color: 'hsl(var(--foreground))'
               }}
             />
                         <small style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem' }}>
               This is your display name in the application
             </small>
          </div>
          
          <div>
                         <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>
               JIRA Personal Access Token:
             </label>
                         <input
               type="password"
               placeholder="Your JIRA PAT"
               value={config.jiraPat}
               onChange={(e) => onUpdatePersonalConfig({ jiraPat: e.target.value })}
               style={{ 
                 padding: '0.5rem', 
                 borderRadius: '4px', 
                 border: '1px solid hsl(var(--border))', 
                 width: '100%',
                 backgroundColor: 'hsl(var(--background))',
                 color: 'hsl(var(--foreground))'
               }}
             />
                         <small style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem' }}>
               Your JIRA Personal Access Token for API access
             </small>
          </div>
        </div>
      </section>
      
      {/* Time Off Entries */}
      <section style={{ marginBottom: '2rem' }}>
                 <h3 style={{ color: 'hsl(var(--foreground))' }}>Time Off Entries for {config.userName || 'You'}</h3>
         <p style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>
           Manage time off entries for {config.userName || 'yourself'} on specific dates.
         </p>
        
        {/* Add new time off entry */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                     <input
             type="date"
             value={newTimeOffDate}
             onChange={(e) => setNewTimeOffDate(e.target.value)}
             style={{ 
               padding: '0.5rem', 
               borderRadius: '4px', 
               border: '1px solid hsl(var(--border))',
               backgroundColor: 'hsl(var(--background))',
               color: 'hsl(var(--foreground))'
             }}
           />
                     <select
             value={newTimeOffHours}
             onChange={(e) => setNewTimeOffHours(Number(e.target.value))}
             style={{ 
               padding: '0.5rem', 
               borderRadius: '4px', 
               border: '1px solid hsl(var(--border))',
               backgroundColor: 'hsl(var(--background))',
               color: 'hsl(var(--foreground))'
             }}
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
             style={{ 
               padding: '0.5rem', 
               borderRadius: '4px', 
               border: '1px solid hsl(var(--border))', 
               flex: 1,
               backgroundColor: 'hsl(var(--background))',
               color: 'hsl(var(--foreground))'
             }}
           />
          {editingTimeOffIndex === null ? (
            <Button
              onClick={handleAddTimeOffEntry}
              disabled={!newTimeOffDate}
              variant="primary"
              size="small"
            >
              Add
            </Button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                onClick={() => handleUpdateTimeOffEntry(editingTimeOffIndex)}
                disabled={!newTimeOffDate}
                variant="primary"
                size="small"
              >
                Update
              </Button>
              <Button
                onClick={handleCancelEditTimeOff}
                variant="secondary"
                size="small"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

                 {/* Existing time off entries */}
         <div style={{ border: '1px solid hsl(var(--border))', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto' }}>
          {(config.timeOffEntries[currentUser] || []).length === 0 ? (
                         <div style={{ padding: '1rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
               No time off entries configured
             </div>
          ) : (
                         (config.timeOffEntries[currentUser] || []).map((entry, index) => (
               <div key={index} style={{ padding: '0.75rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 'bold', minWidth: '120px' }}>{entry.date}</span>
                <span style={{ minWidth: '60px' }}>{entry.hours}h</span>
                                 <span style={{ color: 'hsl(var(--muted-foreground))', flex: 1 }}>{entry.description || ''}</span>
                <Button
                  onClick={() => handleStartEditTimeOff(index)}
                  variant="secondary"
                  size="small"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    onRemoveTimeOffEntry(index);
                    showToast('Time off entry removed successfully!', 'success');
                  }}
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

      {/* Personal Emoji Overrides */}
      <section style={{ marginBottom: '2rem' }}>
                 <h3 style={{ color: 'hsl(var(--foreground))' }}>Personal Emoji Overrides</h3>
         <p style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>
           Personal emoji mappings that override project settings for specific ticket IDs.
         </p>
        
        {/* Add new personal emoji override */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                     <input
             type="text"
             placeholder="Ticket ID (e.g., COM-12345)"
             value={newTicketId}
             onChange={(e) => setNewTicketId(e.target.value)}
             style={{ 
               padding: '0.5rem', 
               borderRadius: '4px', 
               border: '1px solid hsl(var(--border))',
               backgroundColor: 'hsl(var(--background))',
               color: 'hsl(var(--foreground))'
             }}
           />
                     <input
             type="text"
             placeholder="Emoji"
             value={newEmoji}
             onChange={(e) => setNewEmoji(e.target.value)}
             style={{ 
               padding: '0.5rem', 
               borderRadius: '4px', 
               border: '1px solid hsl(var(--border))', 
               width: '80px',
               backgroundColor: 'hsl(var(--background))',
               color: 'hsl(var(--foreground))'
             }}
           />
                     <input
             type="text"
             placeholder="Description (optional)"
             value={newDescription}
             onChange={(e) => setNewDescription(e.target.value)}
             style={{ 
               padding: '0.5rem', 
               borderRadius: '4px', 
               border: '1px solid hsl(var(--border))', 
               flex: 1,
               backgroundColor: 'hsl(var(--background))',
               color: 'hsl(var(--foreground))'
             }}
           />
          {editingEmojiIndex === null ? (
            <Button
              onClick={handleAddPersonalEmojiOverride}
              disabled={!newTicketId.trim() || !newEmoji.trim()}
              variant="primary"
              size="small"
            >
              Add
            </Button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                onClick={() => handleUpdatePersonalEmojiOverride(editingEmojiIndex)}
                disabled={!newTicketId.trim() || !newEmoji.trim()}
                variant="primary"
                size="small"
              >
                Update
              </Button>
              <Button
                onClick={handleCancelEditEmoji}
                variant="secondary"
                size="small"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

                 {/* Existing personal emoji overrides */}
         <div style={{ border: '1px solid hsl(var(--border))', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto' }}>
          {config.personalEmojiOverrides.length === 0 ? (
                         <div style={{ padding: '1rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
               No personal emoji overrides configured
             </div>
          ) : (
                         config.personalEmojiOverrides.map((mapping, index) => (
               <div key={index} style={{ padding: '0.75rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{mapping.emoji}</span>
                <span style={{ fontWeight: 'bold', minWidth: '120px' }}>{mapping.ticketId}</span>
                                 <span style={{ color: 'hsl(var(--muted-foreground))', flex: 1 }}>{mapping.description || ''}</span>
                <Button
                  onClick={() => handleStartEditEmoji(index)}
                  variant="secondary"
                  size="small"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    onRemovePersonalEmojiOverride(index);
                    showToast('Personal emoji override removed successfully!', 'success');
                  }}
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

      {/* UI Preferences */}
      <section style={{ marginBottom: '2rem' }}>
        <h3>UI Preferences</h3>
        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>
          Personal display preferences.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>
              Theme:
            </label>
            <select
              value={config.uiPreferences.theme || 'default'}
              onChange={(e) => onUpdateUIPreference('theme', e.target.value)}
              style={{ 
                padding: '0.5rem', 
                borderRadius: '4px', 
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))'
              }}
            >
              <option value="default">Default (Dark)</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>
              Default View:
            </label>
            <select
              value={config.uiPreferences.defaultView || 'month'}
              onChange={(e) => onUpdateUIPreference('defaultView', e.target.value)}
              style={{ 
                padding: '0.5rem', 
                borderRadius: '4px', 
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))'
              }}
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
            </select>
          </div>
        </div>
      </section>

      {/* Import/Export */}
      <section>
                 <h3 style={{ color: 'hsl(var(--foreground))' }}>Import/Export Configuration</h3>
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
             style={{ 
               width: '100%', 
               height: '100px', 
               padding: '0.5rem', 
               borderRadius: '4px', 
               border: '1px solid hsl(var(--border))', 
               fontFamily: 'monospace',
               backgroundColor: 'hsl(var(--background))',
               color: 'hsl(var(--foreground))'
             }}
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
