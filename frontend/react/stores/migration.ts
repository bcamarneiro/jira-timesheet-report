import { useConfigStore } from './configStore';
import { loadProjectConfig, loadPersonalConfig } from '../utils/configStorage';

/**
 * Migration utility to transition from old localStorage-based config to Zustand store
 */
export function migrateToZustand() {
  const { updateProjectConfig, updatePersonalConfig } = useConfigStore.getState();
  
  try {
    // Load existing configs from localStorage
    const existingProjectConfig = loadProjectConfig();
    const existingPersonalConfig = loadPersonalConfig();
    
    // Update Zustand store with existing data
    updateProjectConfig(existingProjectConfig);
    updatePersonalConfig(existingPersonalConfig);
    
    console.log('Successfully migrated configuration to Zustand store');
    return true;
  } catch (error) {
    console.error('Failed to migrate configuration:', error);
    return false;
  }
}

/**
 * Check if migration has been completed
 */
export function isMigrationCompleted(): boolean {
  return localStorage.getItem('jira-timesheet-config-migrated') === 'true';
}

/**
 * Mark migration as completed
 */
export function markMigrationCompleted(): void {
  localStorage.setItem('jira-timesheet-config-migrated', 'true');
}

/**
 * Clean up old localStorage keys after successful migration
 */
export function cleanupOldStorage(): void {
  try {
    localStorage.removeItem('timetracking_project_config');
    localStorage.removeItem('timetracking_personal_config');
    console.log('Cleaned up old localStorage keys');
  } catch (error) {
    console.error('Failed to cleanup old storage:', error);
  }
}
