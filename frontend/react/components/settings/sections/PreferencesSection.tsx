import type React from 'react';
import { SETTINGS_SECTION_IDS } from '../../../constants/settingsSections';
import * as styles from '../SettingsForm.module.css';

type Props = {
	theme: 'system' | 'light' | 'dark';
	timeRounding: 'off' | '15m' | '30m';
	handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	themeId: string;
	timeRoundingId: string;
};

/**
 * Preferences section: theme + time-rounding selects. Local UI state
 * only — does not touch any external service.
 */
export const PreferencesSection: React.FC<Props> = ({
	theme,
	timeRounding,
	handleSelectChange,
	themeId,
	timeRoundingId,
}) => {
	return (
		<fieldset id={SETTINGS_SECTION_IDS.preferences} className={styles.section}>
			<legend className={styles.sectionTitle}>Preferences</legend>
			<div className={styles.formGroup}>
				<label htmlFor={themeId}>Theme</label>
				<select
					id={themeId}
					name="theme"
					value={theme}
					onChange={handleSelectChange}
				>
					<option value="system">System</option>
					<option value="light">Light</option>
					<option value="dark">Dark</option>
				</select>
				<small>Choose light, dark, or follow your system preference</small>
			</div>
			<div className={styles.formGroup}>
				<label htmlFor={timeRoundingId}>Time Rounding</label>
				<select
					id={timeRoundingId}
					name="timeRounding"
					value={timeRounding}
					onChange={handleSelectChange}
				>
					<option value="off">Off</option>
					<option value="15m">15 minutes</option>
					<option value="30m">30 minutes</option>
				</select>
				<small>Round suggestion durations to the nearest interval</small>
			</div>
		</fieldset>
	);
};
