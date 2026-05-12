import type React from 'react';
import { SETTINGS_SECTION_IDS } from '../../../constants/settingsSections';
import { AllowedUsersInput } from '../AllowedUsersInput';
import * as styles from '../SettingsForm.module.css';

type Props = {
	jqlFilter: string;
	allowedUsers: string;
	allowedUserSuggestions: string[];
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onAllowedUsersChange: (next: string) => void;
	jqlFilterId: string;
	allowedUsersId: string;
};

/**
 * Reports Scope section: JQL filter + allowed-users chip editor.
 * `onAllowedUsersChange` is split out from `handleChange` because the
 * chip editor doesn't emit native input events.
 */
export const ScopeSection: React.FC<Props> = ({
	jqlFilter,
	allowedUsers,
	allowedUserSuggestions,
	handleChange,
	onAllowedUsersChange,
	jqlFilterId,
	allowedUsersId,
}) => {
	return (
		<fieldset id={SETTINGS_SECTION_IDS.scope} className={styles.section}>
			<legend className={styles.sectionTitle}>Reports Scope</legend>
			<div className={styles.formGroup}>
				<label htmlFor={jqlFilterId}>
					JQL Filter <span className={styles.optional}>optional</span>
				</label>
				<input
					type="text"
					id={jqlFilterId}
					name="jqlFilter"
					value={jqlFilter}
					onChange={handleChange}
					placeholder="project = MYPROJECT"
				/>
				<small>Applied to all timesheet queries</small>
			</div>
			<div className={styles.formGroup}>
				<label htmlFor={allowedUsersId}>
					Team Members <span className={styles.optional}>optional</span>
				</label>
				<AllowedUsersInput
					id={allowedUsersId}
					value={allowedUsers}
					onChange={onAllowedUsersChange}
					suggestions={allowedUserSuggestions}
					placeholder="john@example.com, jane@example.com"
				/>
				<small>
					Add the teammates you want to keep in scope for Reports and for shared
					time-off assignments. Press <code>Enter</code>, <code>Tab</code>, or
					paste a list to create chips.
				</small>
			</div>
		</fieldset>
	);
};
