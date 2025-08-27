import { useState, useEffect, useCallback } from 'react';
import type { PersonalConfig, TimeOffEntry } from '../../../types/PersonalConfig';
import type { TicketEmojiMapping } from '../../../types/ProjectConfig';
import { loadPersonalConfig, savePersonalConfig, exportPersonalConfig, importPersonalConfig } from '../utils/configStorage';

export function usePersonalConfig() {
  const [config, setConfig] = useState<PersonalConfig>(loadPersonalConfig());
  const [isLoading, setIsLoading] = useState(false);

  // Save config whenever it changes
  useEffect(() => {
    savePersonalConfig(config);
  }, [config]);

  const updateConfig = useCallback((updates: Partial<PersonalConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const addTimeOffEntry = useCallback((entry: TimeOffEntry) => {
    setConfig(prev => ({
      ...prev,
      timeOffEntries: [...prev.timeOffEntries, entry]
    }));
  }, []);

  const updateTimeOffEntry = useCallback((index: number, entry: TimeOffEntry) => {
    setConfig(prev => ({
      ...prev,
      timeOffEntries: prev.timeOffEntries.map((e, i) => i === index ? entry : e)
    }));
  }, []);

  const removeTimeOffEntry = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      timeOffEntries: prev.timeOffEntries.filter((_, i) => i !== index)
    }));
  }, []);

  const getTimeOffForDate = useCallback((date: string): number => {
    const entry = config.timeOffEntries.find(e => e.date === date);
    return entry ? entry.hours : 0;
  }, [config.timeOffEntries]);

  const setTimeOffForDate = useCallback((date: string, hours: number) => {
    setConfig(prev => {
      const existingIndex = prev.timeOffEntries.findIndex(e => e.date === date);
      if (existingIndex >= 0) {
        // Update existing entry
        const updatedEntries = [...prev.timeOffEntries];
        if (hours === 0) {
          // Remove entry if hours is 0
          updatedEntries.splice(existingIndex, 1);
        } else {
          // Update hours
          updatedEntries[existingIndex] = { ...updatedEntries[existingIndex], hours };
        }
        return { ...prev, timeOffEntries: updatedEntries };
      } else if (hours > 0) {
        // Add new entry
        return {
          ...prev,
          timeOffEntries: [...prev.timeOffEntries, { date, hours }]
        };
      }
      return prev;
    });
  }, []);

  const addPersonalEmojiOverride = useCallback((mapping: TicketEmojiMapping) => {
    setConfig(prev => ({
      ...prev,
      personalEmojiOverrides: [...prev.personalEmojiOverrides, mapping]
    }));
  }, []);

  const updatePersonalEmojiOverride = useCallback((index: number, mapping: TicketEmojiMapping) => {
    setConfig(prev => ({
      ...prev,
      personalEmojiOverrides: prev.personalEmojiOverrides.map((m, i) => i === index ? mapping : m)
    }));
  }, []);

  const removePersonalEmojiOverride = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      personalEmojiOverrides: prev.personalEmojiOverrides.filter((_, i) => i !== index)
    }));
  }, []);

  const updateUIPreference = useCallback((key: keyof PersonalConfig['uiPreferences'], value: string) => {
    setConfig(prev => ({
      ...prev,
      uiPreferences: { ...prev.uiPreferences, [key]: value }
    }));
  }, []);

  const exportConfig = useCallback(() => {
    return exportPersonalConfig();
  }, []);

  const importConfig = useCallback(async (jsonString: string) => {
    setIsLoading(true);
    try {
      const importedConfig = importPersonalConfig(jsonString);
      if (importedConfig) {
        setConfig(importedConfig);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing personal config:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(loadPersonalConfig());
  }, []);

  return {
    config,
    isLoading,
    updateConfig,
    addTimeOffEntry,
    updateTimeOffEntry,
    removeTimeOffEntry,
    getTimeOffForDate,
    setTimeOffForDate,
    addPersonalEmojiOverride,
    updatePersonalEmojiOverride,
    removePersonalEmojiOverride,
    updateUIPreference,
    exportConfig,
    importConfig,
    resetConfig
  };
}
