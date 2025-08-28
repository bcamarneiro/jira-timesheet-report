import { useState, useEffect, useCallback } from 'react';
import type { ProjectConfig, TicketEmojiMapping } from '../../../types/ProjectConfig';
import { loadProjectConfig, saveProjectConfig, exportProjectConfig, importProjectConfig } from '../utils/configStorage';

export function useProjectConfig() {
  const [config, setConfig] = useState<ProjectConfig>(loadProjectConfig());
  const [isLoading, setIsLoading] = useState(false);

  // Save config whenever it changes
  useEffect(() => {
    saveProjectConfig(config);
  }, [config]);

  const updateConfig = useCallback((updates: Partial<ProjectConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const addEmojiMapping = useCallback((mapping: TicketEmojiMapping) => {
    setConfig(prev => ({
      ...prev,
      emojiMappings: [...prev.emojiMappings, mapping]
    }));
  }, []);

  const updateEmojiMapping = useCallback((index: number, mapping: TicketEmojiMapping) => {
    setConfig(prev => ({
      ...prev,
      emojiMappings: prev.emojiMappings.map((m, i) => i === index ? mapping : m)
    }));
  }, []);

  const removeEmojiMapping = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      emojiMappings: prev.emojiMappings.filter((_, i) => i !== index)
    }));
  }, []);

  const addJiraComponent = useCallback((component: string) => {
    if (!component.trim()) return;
    setConfig(prev => ({
      ...prev,
      jiraComponents: [...prev.jiraComponents, component.trim()]
    }));
  }, []);

  const removeJiraComponent = useCallback((component: string) => {
    setConfig(prev => ({
      ...prev,
      jiraComponents: prev.jiraComponents.filter(c => c !== component)
    }));
  }, []);

  const addTeamDeveloper = useCallback((developer: string) => {
    if (!developer.trim()) return;
    setConfig(prev => ({
      ...prev,
      teamDevelopers: [...prev.teamDevelopers, developer.trim()]
    }));
  }, []);

  const removeTeamDeveloper = useCallback((developer: string) => {
    setConfig(prev => ({
      ...prev,
      teamDevelopers: prev.teamDevelopers.filter(d => d !== developer)
    }));
  }, []);

  const exportConfig = useCallback(() => {
    return exportProjectConfig();
  }, []);

  const importConfig = useCallback(async (jsonString: string) => {
    setIsLoading(true);
    try {
      const importedConfig = importProjectConfig(jsonString);
      if (importedConfig) {
        setConfig(importedConfig);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing project config:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(loadProjectConfig());
  }, []);

  return {
    config,
    isLoading,
    updateConfig,
    addEmojiMapping,
    updateEmojiMapping,
    removeEmojiMapping,
    addJiraComponent,
    removeJiraComponent,
    addTeamDeveloper,
    removeTeamDeveloper,
    exportConfig,
    importConfig,
    resetConfig
  };
}
