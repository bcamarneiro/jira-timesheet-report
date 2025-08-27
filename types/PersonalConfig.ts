import type { TicketEmojiMapping } from './ProjectConfig';

export interface TimeOffEntry {
  date: string; // ISO date string
  hours: number;
  description?: string;
}

export interface PersonalConfig {
  timeOffEntries: TimeOffEntry[];
  uiPreferences: {
    theme?: string;
    defaultUser?: string;
  };
  personalEmojiOverrides: TicketEmojiMapping[];
}

export const DEFAULT_PERSONAL_CONFIG: PersonalConfig = {
  timeOffEntries: [],
  uiPreferences: {},
  personalEmojiOverrides: []
};
