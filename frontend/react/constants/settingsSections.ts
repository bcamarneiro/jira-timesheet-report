export const SETTINGS_SECTION_IDS = {
	form: 'settings-form',
	connection: 'settings-connection',
	scope: 'settings-scope',
	permissions: 'settings-permissions',
	integrations: 'settings-integrations',
	calendarMappings: 'settings-calendar-mappings',
	preferences: 'settings-preferences',
} as const;

export type SettingsSectionId =
	(typeof SETTINGS_SECTION_IDS)[keyof typeof SETTINGS_SECTION_IDS];
