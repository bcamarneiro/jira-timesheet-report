import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProjectConfig, TicketEmojiMapping } from '../../../types/ProjectConfig';
import type { PersonalConfig, TimeOffEntry } from '../../../types/PersonalConfig';
import { DEFAULT_PROJECT_CONFIG } from '../../../types/ProjectConfig';
import { DEFAULT_PERSONAL_CONFIG } from '../../../types/PersonalConfig';

interface ConfigState {
  // State
  projectConfig: ProjectConfig;
  personalConfig: PersonalConfig;
  isLoading: boolean;
  
  // Project Config Actions
  updateProjectConfig: (updates: Partial<ProjectConfig>) => void;
  addEmojiMapping: (mapping: TicketEmojiMapping) => void;
  updateEmojiMapping: (index: number, mapping: TicketEmojiMapping) => void;
  removeEmojiMapping: (index: number) => void;
  addJiraComponent: (component: string) => void;
  removeJiraComponent: (component: string) => void;
  addTeamDeveloper: (developer: string) => void;
  removeTeamDeveloper: (developer: string) => void;
  
  // Personal Config Actions
  updatePersonalConfig: (updates: Partial<PersonalConfig>) => void;
  addTimeOffEntry: (entry: TimeOffEntry) => void;
  updateTimeOffEntry: (index: number, entry: TimeOffEntry) => void;
  removeTimeOffEntry: (index: number) => void;
  getTimeOffForDate: (date: string) => number;
  setTimeOffForDate: (date: string, hours: number) => void;
  addPersonalEmojiOverride: (mapping: TicketEmojiMapping) => void;
  updatePersonalEmojiOverride: (index: number, mapping: TicketEmojiMapping) => void;
  removePersonalEmojiOverride: (index: number) => void;
  updateUIPreference: (key: keyof PersonalConfig['uiPreferences'], value: string) => void;
  
  // Import/Export Actions
  exportProjectConfig: () => string;
  exportPersonalConfig: () => string;
  importProjectConfig: (jsonString: string) => Promise<boolean>;
  importPersonalConfig: (jsonString: string) => Promise<boolean>;
  resetProjectConfig: () => void;
  resetPersonalConfig: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      // Initial state
      projectConfig: DEFAULT_PROJECT_CONFIG,
      personalConfig: DEFAULT_PERSONAL_CONFIG,
      isLoading: false,

      // Project Config Actions
      updateProjectConfig: (updates) => {
        set((state) => ({
          projectConfig: { ...state.projectConfig, ...updates }
        }));
      },

      addEmojiMapping: (mapping) => {
        set((state) => ({
          projectConfig: {
            ...state.projectConfig,
            emojiMappings: [...state.projectConfig.emojiMappings, mapping]
          }
        }));
      },

      updateEmojiMapping: (index, mapping) => {
        set((state) => ({
          projectConfig: {
            ...state.projectConfig,
            emojiMappings: state.projectConfig.emojiMappings.map((m, i) => 
              i === index ? mapping : m
            )
          }
        }));
      },

      removeEmojiMapping: (index) => {
        set((state) => ({
          projectConfig: {
            ...state.projectConfig,
            emojiMappings: state.projectConfig.emojiMappings.filter((_, i) => i !== index)
          }
        }));
      },

      addJiraComponent: (component) => {
        if (!component.trim()) return;
        set((state) => ({
          projectConfig: {
            ...state.projectConfig,
            jiraComponents: [...state.projectConfig.jiraComponents, component.trim()]
          }
        }));
      },

      removeJiraComponent: (component) => {
        set((state) => ({
          projectConfig: {
            ...state.projectConfig,
            jiraComponents: state.projectConfig.jiraComponents.filter(c => c !== component)
          }
        }));
      },

      addTeamDeveloper: (developer) => {
        if (!developer.trim()) return;
        set((state) => ({
          projectConfig: {
            ...state.projectConfig,
            teamDevelopers: [...state.projectConfig.teamDevelopers, developer.trim()]
          }
        }));
      },

      removeTeamDeveloper: (developer) => {
        set((state) => ({
          projectConfig: {
            ...state.projectConfig,
            teamDevelopers: state.projectConfig.teamDevelopers.filter(d => d !== developer)
          }
        }));
      },

      // Personal Config Actions
      updatePersonalConfig: (updates) => {
        set((state) => ({
          personalConfig: { ...state.personalConfig, ...updates }
        }));
      },

      addTimeOffEntry: (entry) => {
        set((state) => ({
          personalConfig: {
            ...state.personalConfig,
            timeOffEntries: [...state.personalConfig.timeOffEntries, entry]
          }
        }));
      },

      updateTimeOffEntry: (index, entry) => {
        set((state) => ({
          personalConfig: {
            ...state.personalConfig,
            timeOffEntries: state.personalConfig.timeOffEntries.map((e, i) => 
              i === index ? entry : e
            )
          }
        }));
      },

      removeTimeOffEntry: (index) => {
        set((state) => ({
          personalConfig: {
            ...state.personalConfig,
            timeOffEntries: state.personalConfig.timeOffEntries.filter((_, i) => i !== index)
          }
        }));
      },

      getTimeOffForDate: (date) => {
        const state = get();
        const entry = state.personalConfig.timeOffEntries.find(e => e.date === date);
        return entry ? entry.hours : 0;
      },

      setTimeOffForDate: (date, hours) => {
        const state = get();
        const updatedEntries = [...state.personalConfig.timeOffEntries];
        const existingIndex = updatedEntries.findIndex(e => e.date === date);
        
        if (hours > 0) {
          const entry: TimeOffEntry = {
            date,
            hours: Math.max(0, Math.min(8, hours)),
            description: `Time off for ${date}`
          };
          
          if (existingIndex >= 0) {
            updatedEntries[existingIndex] = entry;
          } else {
            updatedEntries.push(entry);
          }
        } else {
          if (existingIndex >= 0) {
            updatedEntries.splice(existingIndex, 1);
          }
        }
        
        set((state) => ({
          personalConfig: {
            ...state.personalConfig,
            timeOffEntries: updatedEntries
          }
        }));
      },

      addPersonalEmojiOverride: (mapping) => {
        set((state) => ({
          personalConfig: {
            ...state.personalConfig,
            personalEmojiOverrides: [...state.personalConfig.personalEmojiOverrides, mapping]
          }
        }));
      },

      updatePersonalEmojiOverride: (index, mapping) => {
        set((state) => ({
          personalConfig: {
            ...state.personalConfig,
            personalEmojiOverrides: state.personalConfig.personalEmojiOverrides.map((m, i) => 
              i === index ? mapping : m
            )
          }
        }));
      },

      removePersonalEmojiOverride: (index) => {
        set((state) => ({
          personalConfig: {
            ...state.personalConfig,
            personalEmojiOverrides: state.personalConfig.personalEmojiOverrides.filter((_, i) => i !== index)
          }
        }));
      },

      updateUIPreference: (key, value) => {
        set((state) => ({
          personalConfig: {
            ...state.personalConfig,
            uiPreferences: {
              ...state.personalConfig.uiPreferences,
              [key]: value
            }
          }
        }));
      },

      // Import/Export Actions
      exportProjectConfig: () => {
        const state = get();
        return JSON.stringify(state.projectConfig, null, 2);
      },

      exportPersonalConfig: () => {
        const state = get();
        return JSON.stringify(state.personalConfig, null, 2);
      },

      importProjectConfig: async (jsonString) => {
        set({ isLoading: true });
        try {
          const config = JSON.parse(jsonString);
          if (typeof config === 'object' && config !== null) {
            set((state) => ({
              projectConfig: { ...DEFAULT_PROJECT_CONFIG, ...config },
              isLoading: false
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error importing project config:', error);
          set({ isLoading: false });
          return false;
        }
      },

      importPersonalConfig: async (jsonString) => {
        set({ isLoading: true });
        try {
          const config = JSON.parse(jsonString);
          if (typeof config === 'object' && config !== null) {
            set((state) => ({
              personalConfig: { ...DEFAULT_PERSONAL_CONFIG, ...config },
              isLoading: false
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error importing personal config:', error);
          set({ isLoading: false });
          return false;
        }
      },

      resetProjectConfig: () => {
        set({ projectConfig: DEFAULT_PROJECT_CONFIG });
      },

      resetPersonalConfig: () => {
        set({ personalConfig: DEFAULT_PERSONAL_CONFIG });
      },
    }),
    {
      name: 'jira-timesheet-config',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projectConfig: state.projectConfig,
        personalConfig: state.personalConfig,
      }),
    }
  )
);
