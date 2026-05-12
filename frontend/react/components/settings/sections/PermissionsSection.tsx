import type React from 'react';
import { SETTINGS_SECTION_IDS } from '../../../constants/settingsSections';
import * as styles from '../SettingsForm.module.css';

type Props = {
	canAddWorklogs: boolean;
	canEditWorklogs: boolean;
	canDeleteWorklogs: boolean;
	complianceReminderEnabled: boolean;
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

/**
 * Worklog Permissions section: 3 toggles for add/edit/delete + the
 * compliance reminder toggle. The toggles are auto-populated when the
 * user tests the Jira connection (the response carries the user's
 * effective permissions); manual overrides land here.
 */
export const PermissionsSection: React.FC<Props> = ({
	canAddWorklogs,
	canEditWorklogs,
	canDeleteWorklogs,
	complianceReminderEnabled,
	handleChange,
}) => {
	return (
		<fieldset id={SETTINGS_SECTION_IDS.permissions} className={styles.section}>
			<legend className={styles.sectionTitle}>Worklog Permissions</legend>
			<small className={styles.permissionsHint}>
				Auto-detected when you test the connection. Override manually if needed.
			</small>
			<label className={styles.checkboxLabel}>
				<input
					type="checkbox"
					name="canAddWorklogs"
					checked={canAddWorklogs}
					onChange={handleChange}
				/>
				Allow adding worklogs
			</label>
			<label className={styles.checkboxLabel}>
				<input
					type="checkbox"
					name="canEditWorklogs"
					checked={canEditWorklogs}
					onChange={handleChange}
				/>
				Allow editing worklogs
			</label>
			<label className={styles.checkboxLabel}>
				<input
					type="checkbox"
					name="canDeleteWorklogs"
					checked={canDeleteWorklogs}
					onChange={handleChange}
				/>
				Allow deleting worklogs
			</label>
			<label className={styles.checkboxLabel}>
				<input
					type="checkbox"
					name="complianceReminderEnabled"
					checked={complianceReminderEnabled}
					onChange={handleChange}
				/>
				Enable timesheet reminders
			</label>
		</fieldset>
	);
};
