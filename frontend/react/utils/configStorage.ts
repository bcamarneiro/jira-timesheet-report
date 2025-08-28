import type { ProjectConfig } from '../../../types/ProjectConfig';
import type { PersonalConfig } from '../../../types/PersonalConfig';
import { DEFAULT_PROJECT_CONFIG } from '../../../types/ProjectConfig';
import { DEFAULT_PERSONAL_CONFIG } from '../../../types/PersonalConfig';

const PROJECT_CONFIG_KEY = 'timetracking_project_config';
const PERSONAL_CONFIG_KEY = 'timetracking_personal_config';

// Project Configuration Storage
export function loadProjectConfig(): ProjectConfig {
  try {
    const stored = localStorage.getItem(PROJECT_CONFIG_KEY);
    if (!stored) {
      return DEFAULT_PROJECT_CONFIG;
    }
    const config = JSON.parse(stored);
    return { ...DEFAULT_PROJECT_CONFIG, ...config };
  } catch (error) {
    console.error('Error loading project config:', error);
    return DEFAULT_PROJECT_CONFIG;
  }
}

export function saveProjectConfig(config: ProjectConfig): void {
  try {
    localStorage.setItem(PROJECT_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving project config:', error);
  }
}

export function exportProjectConfig(): string {
  const config = loadProjectConfig();
  return JSON.stringify(config, null, 2);
}

export function importProjectConfig(jsonString: string): ProjectConfig | null {
  try {
    const config = JSON.parse(jsonString);
    // Validate the structure
    if (typeof config === 'object' && config !== null) {
      return { ...DEFAULT_PROJECT_CONFIG, ...config };
    }
    return null;
  } catch (error) {
    console.error('Error importing project config:', error);
    return null;
  }
}

// Personal Configuration Storage
export function loadPersonalConfig(): PersonalConfig {
  try {
    const stored = localStorage.getItem(PERSONAL_CONFIG_KEY);
    if (!stored) {
      return DEFAULT_PERSONAL_CONFIG;
    }
    const config = JSON.parse(stored);
    return { ...DEFAULT_PERSONAL_CONFIG, ...config };
  } catch (error) {
    console.error('Error loading personal config:', error);
    return DEFAULT_PERSONAL_CONFIG;
  }
}

export function savePersonalConfig(config: PersonalConfig): void {
  try {
    localStorage.setItem(PERSONAL_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving personal config:', error);
  }
}

export function exportPersonalConfig(): string {
  const config = loadPersonalConfig();
  return JSON.stringify(config, null, 2);
}

export function importPersonalConfig(jsonString: string): PersonalConfig | null {
  try {
    const config = JSON.parse(jsonString);
    // Validate the structure
    if (typeof config === 'object' && config !== null) {
      return { ...DEFAULT_PERSONAL_CONFIG, ...config };
    }
    return null;
  } catch (error) {
    console.error('Error importing personal config:', error);
    return null;
  }
}

// Migration helper for existing JIRA_COMPONENT env var
export function migrateFromEnvironmentVariable(): void {
  const projectConfig = loadProjectConfig();
  
  // Check if we need to migrate from environment variable
  // This would be called during app initialization
  // For now, we'll just ensure the config is properly initialized
  if (projectConfig.jiraComponents.length === 0) {
    // Could check for environment variable here if needed
    // For now, just ensure we have a valid config
    saveProjectConfig(projectConfig);
  }
}
