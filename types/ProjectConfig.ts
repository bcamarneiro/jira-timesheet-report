export interface TicketEmojiMapping {
  ticketId: string;
  emoji: string;
  description?: string;
}

export interface ProjectConfig {
  emojiMappings: TicketEmojiMapping[];
  jiraComponents: string[];
  teamDevelopers: string[];
  jiraDomain: string; // JIRA domain (e.g., "yourcompany.atlassian.net")
  defaultSettings: {
    // Future project-wide defaults can go here
  };
}

export const DEFAULT_PROJECT_CONFIG: ProjectConfig = {
  emojiMappings: [],
  jiraComponents: [],
  teamDevelopers: [],
  jiraDomain: '',
  defaultSettings: {}
};
