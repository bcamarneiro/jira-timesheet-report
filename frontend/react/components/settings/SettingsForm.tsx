import type React from 'react';
import { useEffect, useId, useMemo, useRef } from 'react';
import type { CalendarFeed } from '../../../stores/useConfigStore';
import { useConfigStore } from '../../../stores/useConfigStore';
import { useSettingsFormStore } from '../../../stores/useSettingsFormStore';
import { useUserDataStore } from '../../../stores/useUserDataStore';
import { SETTINGS_SECTION_IDS } from '../../constants/settingsSections';
import { downloadAsFile } from '../../utils/downloadFile';
import { splitCsvEmailList, uniqueEmailEntries } from '../../utils/emailList';
import {
	createSettingsBackup,
	createSettingsSharePack,
	parseSettingsBackup,
} from '../../utils/settingsBackup';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';
import { ConnectionSection } from './sections/ConnectionSection';
import { IntegrationsSection } from './sections/IntegrationsSection';
import { PermissionsSection } from './sections/PermissionsSection';
import { PreferencesSection } from './sections/PreferencesSection';
import { ScopeSection } from './sections/ScopeSection';
import * as styles from './SettingsForm.module.css';

type FeedEntry = {
	feed: CalendarFeed;
	index: number;
};

type ServiceStatus = {
	tone: 'ready' | 'warning' | 'pending';
	label: string;
};

function getServiceStatus(
	configured: boolean,
	loading: boolean,
	result: { success: boolean; message: string } | null,
): ServiceStatus {
	if (!configured) {
		return { tone: 'pending', label: 'Not configured' };
	}
	if (loading) {
		return { tone: 'warning', label: 'Testing' };
	}
	if (result?.success) {
		return { tone: 'ready', label: 'Ready' };
	}
	if (result?.success === false) {
		return { tone: 'warning', label: 'Needs review' };
	}
	return { tone: 'warning', label: 'Needs review' };
}

function buildFeedEntries(
	feeds: CalendarFeed[] | undefined,
	type: CalendarFeed['type'],
): FeedEntry[] {
	return (feeds ?? [])
		.map((feed, index) => ({ feed, index }))
		.filter((entry) => entry.feed.type === type);
}

function getGitlabTroubleshooting(message: string | null): string | null {
	if (!message) return null;
	const normalized = message.toLowerCase();
	if (
		normalized.includes('rejected the token') ||
		normalized.includes('invalid gitlab token')
	) {
		return 'This usually means the host was reached but the token was rejected. Check that the token belongs to this GitLab instance and still has read_user or api scope.';
	}
	if (normalized.includes('denied access')) {
		return 'GitLab understood the token but blocked the request. Confirm the account can access this instance and the PAT has enough scope.';
	}
	if (normalized.includes('api was not found')) {
		return 'The hostname looks reachable, but the standard GitLab API path was not found. Double-check the host or whether this self-hosted instance needs a custom base path.';
	}
	if (normalized.includes('could not reach')) {
		return 'This is usually a networking, certificate, VPN, or CORS-proxy issue rather than a bad token.';
	}
	return null;
}

export const SettingsForm: React.FC = () => {
	const formData = useSettingsFormStore((state) => state.formData);
	const integrationTests = useSettingsFormStore(
		(state) => state.integrationTests,
	);
	const savedConfig = useConfigStore((state) => state.config);
	const updateFormField = useSettingsFormStore(
		(state) => state.updateFormField,
	);
	const saveSettings = useSettingsFormStore((state) => state.saveSettings);
	const testJira = useSettingsFormStore((state) => state.testJira);
	const testGitlab = useSettingsFormStore((state) => state.testGitlab);
	const testCalendar = useSettingsFormStore((state) => state.testCalendar);
	const testRescueTime = useSettingsFormStore((state) => state.testRescueTime);
	const loadFromConfig = useSettingsFormStore((state) => state.loadFromConfig);
	const resetForm = useSettingsFormStore((state) => state.resetForm);
	const replaceFormData = useSettingsFormStore(
		(state) => state.replaceFormData,
	);

	const calendarMappings = useUserDataStore((s) => s.calendarMappings);
	const addCalendarMapping = useUserDataStore((s) => s.addCalendarMapping);
	const removeCalendarMapping = useUserDataStore(
		(s) => s.removeCalendarMapping,
	);
	const updateCalendarMapping = useUserDataStore(
		(s) => s.updateCalendarMapping,
	);
	const replaceCalendarMappings = useUserDataStore(
		(s) => s.replaceCalendarMappings,
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const jiraHostId = useId();
	const emailId = useId();
	const apiTokenId = useId();
	const corsProxyId = useId();
	const jqlFilterId = useId();
	const allowedUsersId = useId();
	const gitlabTokenId = useId();
	const gitlabHostId = useId();
	const rescueTimeKeyId = useId();
	const timeRoundingId = useId();
	const themeId = useId();
	const includeAbsenceInCsvId = useId();
	const isDirty = JSON.stringify(formData) !== JSON.stringify(savedConfig);
	const canTestJira =
		!!formData.jiraHost.trim() &&
		!!formData.email.trim() &&
		!!formData.apiToken.trim();
	const canTestGitlab =
		!!formData.gitlabHost.trim() && !!formData.gitlabToken.trim();
	const canTestRescueTime = !!formData.rescueTimeApiKey.trim();
	const hasCalendarFeeds = (formData.calendarFeeds ?? []).some((f) =>
		f.url.trim(),
	);
	const suggestionFeedEntries = useMemo(
		() => buildFeedEntries(formData.calendarFeeds, 'suggestion'),
		[formData.calendarFeeds],
	);
	const absenceFeedEntries = useMemo(
		() => buildFeedEntries(formData.calendarFeeds, 'absence'),
		[formData.calendarFeeds],
	);
	const holidayFeedEntries = useMemo(
		() => buildFeedEntries(formData.calendarFeeds, 'holiday'),
		[formData.calendarFeeds],
	);
	const sharedAbsenceFeedEntries = useMemo(
		() =>
			absenceFeedEntries.filter(
				({ feed }) => (feed.absenceAttribution ?? 'self') === 'shared',
			),
		[absenceFeedEntries],
	);
	const gitlabStatus = getServiceStatus(
		!!formData.gitlabHost.trim() || !!formData.gitlabToken.trim(),
		integrationTests.gitlab.loading,
		integrationTests.gitlab.result,
	);
	const rescueTimeStatus = getServiceStatus(
		!!formData.rescueTimeApiKey.trim(),
		integrationTests.rescuetime.loading,
		integrationTests.rescuetime.result,
	);
	const calendarStatus = getServiceStatus(
		hasCalendarFeeds,
		integrationTests.calendar.loading,
		integrationTests.calendar.result,
	);
	const hasSharedAbsenceFeeds = sharedAbsenceFeedEntries.length > 0;
	const showAbsenceAssignments =
		hasSharedAbsenceFeeds || (formData.absenceAssignments ?? []).length > 0;
	const hasSharedAbsenceFeedsWithoutAssignments =
		hasSharedAbsenceFeeds && (formData.absenceAssignments ?? []).length === 0;
	const allowedUserSuggestions = useMemo(
		() =>
			uniqueEmailEntries([
				formData.email,
				savedConfig.email,
				...splitCsvEmailList(savedConfig.allowedUsers),
				...splitCsvEmailList(formData.allowedUsers),
			]),
		[
			formData.allowedUsers,
			formData.email,
			savedConfig.allowedUsers,
			savedConfig.email,
		],
	);
	const gitlabTroubleshooting = getGitlabTroubleshooting(
		integrationTests.gitlab.result?.success === false
			? integrationTests.gitlab.result.message
			: null,
	);

	const updateCalendarFeed = (index: number, patch: Partial<CalendarFeed>) => {
		const feeds = [...(formData.calendarFeeds ?? [])];
		feeds[index] = {
			...feeds[index],
			...patch,
		};
		updateFormField('calendarFeeds', feeds as never);
	};

	const removeCalendarFeed = (index: number) => {
		const feeds = (formData.calendarFeeds ?? []).filter((_, i) => i !== index);
		updateFormField('calendarFeeds', feeds as never);
	};

	const addCalendarFeed = (type: CalendarFeed['type']) => {
		const feeds: CalendarFeed[] = [
			...(formData.calendarFeeds ?? []),
			{ label: '', url: '', type },
		];
		updateFormField('calendarFeeds', feeds as never);
	};

	const addAbsenceAssignment = (assignment: {
		pattern: string;
		userEmail: string;
	}) => {
		updateFormField('absenceAssignments', [
			...(formData.absenceAssignments ?? []),
			assignment,
		] as never);
	};

	const updateAbsenceAssignment = (
		original: { pattern: string; userEmail: string },
		nextAssignment: { pattern: string; userEmail: string },
	) => {
		updateFormField(
			'absenceAssignments',
			(formData.absenceAssignments ?? []).map((assignment) =>
				assignment.pattern === original.pattern &&
				assignment.userEmail === original.userEmail
					? nextAssignment
					: assignment,
			) as never,
		);
	};

	const removeAbsenceAssignment = (target: {
		pattern: string;
		userEmail: string;
	}) => {
		updateFormField(
			'absenceAssignments',
			(formData.absenceAssignments ?? []).filter(
				(assignment) =>
					assignment.pattern !== target.pattern ||
					assignment.userEmail !== target.userEmail,
			) as never,
		);
	};

	useEffect(() => {
		loadFromConfig();
	}, [loadFromConfig]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		if (type === 'checkbox') {
			updateFormField(name as keyof typeof formData, checked as never);
		} else {
			updateFormField(name as keyof typeof formData, value as never);
		}
	};

	const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = e.target;
		updateFormField(name as keyof typeof formData, value as never);
	};

	const handleSave = () => {
		if (!isDirty) return;
		saveSettings();
		toast.success('Settings saved');
	};

	const handleExportSettings = () => {
		const userDataState = useUserDataStore.getState();
		const backup = createSettingsBackup(savedConfig, calendarMappings, {
			favorites: userDataState.favorites,
			templates: userDataState.templates,
			commentPresets: userDataState.commentPresets,
			dayNotes: userDataState.dayNotes,
			reportPresets: userDataState.reportPresets,
		});
		downloadAsFile(
			`${JSON.stringify(backup, null, 2)}\n`,
			'jira-timesheet-settings.json',
			'application/json;charset=utf-8',
		);
		toast.success('Settings exported');
	};

	const handleExportSharePack = () => {
		const sharePack = createSettingsSharePack(savedConfig, calendarMappings);
		downloadAsFile(
			`${JSON.stringify(sharePack, null, 2)}\n`,
			'jira-timesheet-share-pack.json',
			'application/json;charset=utf-8',
		);
		toast.success('Share pack exported without local secrets');
	};

	const handleImportClick = () => {
		fileInputRef.current?.click();
	};

	const handleImportSettings = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const content = await file.text();
			const imported = parseSettingsBackup(content, savedConfig);
			replaceFormData(imported.config);
			replaceCalendarMappings(imported.calendarMappings);
			if (imported.userData) {
				useUserDataStore.setState({
					favorites: imported.userData.favorites,
					templates: imported.userData.templates,
					commentPresets: imported.userData.commentPresets,
					dayNotes: imported.userData.dayNotes,
					reportPresets: imported.userData.reportPresets,
				});
			}
			toast.success(
				imported.kind === 'share-pack'
					? 'Share pack imported into the form'
					: 'Settings backup imported into the form',
			);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to import settings',
			);
		} finally {
			e.target.value = '';
		}
	};

	return (
		<div id={SETTINGS_SECTION_IDS.form} className={styles.form}>
			<input
				ref={fileInputRef}
				type="file"
				accept="application/json,.json"
				className={styles.hiddenInput}
				onChange={handleImportSettings}
			/>
			<div className={styles.formStatus} aria-live="polite">
				<div className={styles.formStatusText}>
					<strong>{isDirty ? 'Unsaved changes' : 'Settings up to date'}</strong>
					<span>
						{isDirty
							? 'Review and save when you are ready.'
							: 'The form matches your saved configuration.'}
					</span>
				</div>
				<div className={styles.buttonGroup}>
					<Button
						type="button"
						variant="secondary"
						onClick={handleExportSettings}
					>
						Backup
					</Button>
					<Button
						type="button"
						variant="secondary"
						onClick={handleExportSharePack}
					>
						Share Pack
					</Button>
					<Button type="button" variant="secondary" onClick={handleImportClick}>
						Import
					</Button>
					<Button
						type="button"
						variant="secondary"
						onClick={resetForm}
						disabled={!isDirty}
					>
						Discard
					</Button>
					<Button type="button" disabled={!isDirty} onClick={handleSave}>
						Save
					</Button>
				</div>
			</div>

			<ConnectionSection
				formData={formData}
				handleChange={handleChange}
				testJira={testJira}
				canTestJira={canTestJira}
				integrationTest={integrationTests.jira}
				jiraHostId={jiraHostId}
				emailId={emailId}
				apiTokenId={apiTokenId}
				corsProxyId={corsProxyId}
			/>

			<ScopeSection
				jqlFilter={formData.jqlFilter}
				allowedUsers={formData.allowedUsers}
				allowedUserSuggestions={allowedUserSuggestions}
				handleChange={handleChange}
				onAllowedUsersChange={(nextValue) =>
					updateFormField('allowedUsers', nextValue as never)
				}
				jqlFilterId={jqlFilterId}
				allowedUsersId={allowedUsersId}
			/>

			<PermissionsSection
				canAddWorklogs={formData.canAddWorklogs}
				canEditWorklogs={formData.canEditWorklogs}
				canDeleteWorklogs={formData.canDeleteWorklogs}
				complianceReminderEnabled={formData.complianceReminderEnabled}
				handleChange={handleChange}
			/>

			<IntegrationsSection
				gitlabHost={formData.gitlabHost}
				gitlabToken={formData.gitlabToken}
				rescueTimeApiKey={formData.rescueTimeApiKey}
				absenceAssignments={formData.absenceAssignments ?? []}
				gitlabHostId={gitlabHostId}
				gitlabTokenId={gitlabTokenId}
				rescueTimeKeyId={rescueTimeKeyId}
				gitlabStatus={gitlabStatus}
				rescueTimeStatus={rescueTimeStatus}
				calendarStatus={calendarStatus}
				gitlabTroubleshooting={gitlabTroubleshooting}
				integrationTests={integrationTests}
				testGitlab={testGitlab}
				testRescueTime={testRescueTime}
				testCalendar={testCalendar}
				canTestGitlab={canTestGitlab}
				canTestRescueTime={canTestRescueTime}
				hasCalendarFeeds={hasCalendarFeeds}
				suggestionFeedEntries={suggestionFeedEntries}
				absenceFeedEntries={absenceFeedEntries}
				holidayFeedEntries={holidayFeedEntries}
				hasSharedAbsenceFeedsWithoutAssignments={
					hasSharedAbsenceFeedsWithoutAssignments
				}
				showAbsenceAssignments={showAbsenceAssignments}
				addCalendarFeed={addCalendarFeed}
				updateCalendarFeed={updateCalendarFeed}
				removeCalendarFeed={removeCalendarFeed}
				calendarMappings={calendarMappings}
				addCalendarMapping={addCalendarMapping}
				updateCalendarMapping={updateCalendarMapping}
				removeCalendarMapping={removeCalendarMapping}
				addAbsenceAssignment={addAbsenceAssignment}
				updateAbsenceAssignment={updateAbsenceAssignment}
				removeAbsenceAssignment={removeAbsenceAssignment}
				allowedUserSuggestions={allowedUserSuggestions}
				handleChange={handleChange}
			/>

			<PreferencesSection
				theme={formData.theme}
				timeRounding={formData.timeRounding}
				includeAbsenceInCsv={formData.includeAbsenceInCsv}
				handleSelectChange={handleSelectChange}
				handleChange={handleChange}
				themeId={themeId}
				timeRoundingId={timeRoundingId}
				includeAbsenceInCsvId={includeAbsenceInCsvId}
			/>
		</div>
	);
};
