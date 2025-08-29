import type { TicketEmojiMapping } from './ProjectConfig';

export interface TimeOffEntry {
  date: string; // ISO date string
  hours: number;
  description?: string;
}

export interface PersonalConfig {
  timeOffEntries: Record<string, TimeOffEntry[]>; // Key is username, value is array of time off entries
  uiPreferences: {
    theme?: string;
    defaultUser?: string;
  };
  personalEmojiOverrides: TicketEmojiMapping[];
  jiraPat: string; // JIRA Personal Access Token
  userName: string; // User's name for JIRA
}

export const DEFAULT_PERSONAL_CONFIG: PersonalConfig = {
  timeOffEntries: {},
  uiPreferences: {},
  personalEmojiOverrides: [],
  jiraPat: '',
  userName: ''
};
