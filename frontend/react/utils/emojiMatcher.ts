import type { ProjectConfig } from '../../../types/ProjectConfig';
import type { PersonalConfig } from '../../../types/PersonalConfig';

export function getEmojiForTicket(
  ticketId: string, 
  projectConfig: ProjectConfig, 
  personalConfig: PersonalConfig
): string | null {
  // 1. Check personal overrides first (highest priority)
  const personalEmoji = personalConfig.personalEmojiOverrides.find(
    mapping => mapping.ticketId === ticketId
  );
  if (personalEmoji) {
    return personalEmoji.emoji;
  }
  
  // 2. Check project configuration
  const projectEmoji = projectConfig.emojiMappings.find(
    mapping => mapping.ticketId === ticketId
  );
  if (projectEmoji) {
    return projectEmoji.emoji;
  }
  
  // 3. No emoji configured
  return null;
}

export function validateEmoji(emoji: string): boolean {
  // Basic emoji validation - check if it's a valid emoji
  // This is a simple check, could be enhanced with a proper emoji library
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(emoji) || emoji.length === 1;
}

export function validateTicketId(ticketId: string): boolean {
  // Basic ticket ID validation - should be alphanumeric with possible hyphens
  const ticketIdRegex = /^[A-Z0-9]+-[0-9]+$/;
  return ticketIdRegex.test(ticketId);
}
