import type { Config } from '../../stores/useConfigStore';
import type { SettingsIntegrationTests } from '../../stores/useSettingsFormStore';
import { SETTINGS_SECTION_IDS } from '../constants/settingsSections';

export type SetupStatus = 'ready' | 'warning' | 'pending';

export interface SetupStepModel {
	id: 'connection' | 'scope' | 'signals' | 'verify';
	title: string;
	status: SetupStatus;
	summary: string;
	detail: string;
	sectionId: string;
	optional?: boolean;
}

export interface DiagnosticItemModel {
	id: 'jira' | 'scope' | 'permissions' | 'signals' | 'sync';
	label: string;
	status: SetupStatus;
	detail: string;
	sectionId: string;
}

export interface SurfaceReadinessModel {
	label: string;
	status: SetupStatus;
	detail: string;
}

export interface SettingsSetupModel {
	status: SetupStatus;
	headline: string;
	detail: string;
	progress: {
		completed: number;
		total: number;
		percent: number;
	};
	steps: SetupStepModel[];
	diagnostics: DiagnosticItemModel[];
	surfaces: {
		dashboard: SurfaceReadinessModel;
		reports: SurfaceReadinessModel;
	};
	quickFacts: {
		allowedUsersCount: number;
		configuredSignalCount: number;
		suggestionFeedCount: number;
		absenceFeedCount: number;
	};
}

function splitCsv(value: string): string[] {
	return value
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean);
}

function joinList(items: string[]): string {
	if (items.length <= 1) return items[0] ?? '';
	if (items.length === 2) return `${items[0]} and ${items[1]}`;
	return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;
}

function summarizeConfiguredSources({
	hasGitlab,
	hasRescueTime,
	suggestionFeedCount,
	absenceFeedCount,
}: {
	hasGitlab: boolean;
	hasRescueTime: boolean;
	suggestionFeedCount: number;
	absenceFeedCount: number;
}): string[] {
	const labels: string[] = [];

	if (hasGitlab) labels.push('GitLab');
	if (hasRescueTime) labels.push('RescueTime');
	if (suggestionFeedCount > 0) {
		labels.push(
			`${suggestionFeedCount} suggestion calendar${suggestionFeedCount === 1 ? '' : 's'}`,
		);
	}
	if (absenceFeedCount > 0) {
		labels.push(
			`${absenceFeedCount} absence calendar${absenceFeedCount === 1 ? '' : 's'}`,
		);
	}

	return labels;
}

function permissionSummary(config: Config): string {
	return [
		`add ${config.canAddWorklogs ? 'enabled' : 'disabled'}`,
		`edit ${config.canEditWorklogs ? 'enabled' : 'disabled'}`,
		`delete ${config.canDeleteWorklogs ? 'enabled' : 'disabled'}`,
	].join(', ');
}

export function buildSettingsSetupModel(
	config: Config,
	integrationTests: SettingsIntegrationTests,
	isDirty: boolean,
): SettingsSetupModel {
	const allowedUsersCount = splitCsv(config.allowedUsers).length;
	const suggestionFeedCount = (config.calendarFeeds ?? []).filter(
		(feed) => feed.url.trim() && feed.type === 'suggestion',
	).length;
	const absenceFeedCount = (config.calendarFeeds ?? []).filter(
		(feed) => feed.url.trim() && feed.type === 'absence',
	).length;

	const hasGitlab = !!config.gitlabHost.trim() && !!config.gitlabToken.trim();
	const hasRescueTime = !!config.rescueTimeApiKey.trim();
	const configuredSources = summarizeConfiguredSources({
		hasGitlab,
		hasRescueTime,
		suggestionFeedCount,
		absenceFeedCount,
	});
	const configuredSignalCount = configuredSources.length;

	const missingConnectionFields = [
		!config.jiraHost.trim() ? 'Jira host' : null,
		!config.email.trim() ? 'email' : null,
		!config.apiToken.trim() ? 'API token' : null,
	].filter(Boolean) as string[];

	const hasConnectionCredentials = missingConnectionFields.length === 0;
	const jiraResult = integrationTests.jira.result;
	const jiraStatus: SetupStatus = !hasConnectionCredentials
		? 'pending'
		: integrationTests.jira.loading
			? 'warning'
			: jiraResult?.success
				? 'ready'
				: 'warning';

	const scopeStatus: SetupStatus =
		config.jqlFilter.trim() || allowedUsersCount > 0 ? 'ready' : 'warning';

	const configuredSourceFailures = [
		hasGitlab && integrationTests.gitlab.result?.success === false
			? 'GitLab'
			: null,
		hasRescueTime && integrationTests.rescuetime.result?.success === false
			? 'RescueTime'
			: null,
		(suggestionFeedCount > 0 || absenceFeedCount > 0) &&
		integrationTests.calendar.result?.success === false
			? 'calendar feeds'
			: null,
	].filter(Boolean) as string[];

	const signalsStatus: SetupStatus =
		configuredSignalCount === 0
			? 'pending'
			: configuredSourceFailures.length > 0
				? 'warning'
				: 'ready';

	const verifyStatus: SetupStatus = !hasConnectionCredentials
		? 'pending'
		: !jiraResult?.success || isDirty
			? 'warning'
			: 'ready';

	const coreReady = jiraResult?.success === true && !isDirty;
	const overallStatus: SetupStatus = coreReady
		? 'ready'
		: hasConnectionCredentials
			? 'warning'
			: 'pending';

	const connectionDetail = !hasConnectionCredentials
		? `Add ${joinList(missingConnectionFields)} to connect to Jira.`
		: integrationTests.jira.loading
			? 'Checking your Jira account and worklog permissions now.'
			: jiraResult?.success
				? `${jiraResult.message}${config.corsProxy.trim() ? ` via ${config.corsProxy.trim()}` : ''}`
				: (jiraResult?.message ??
					'Run the Jira check once to confirm the account and auto-detect permissions.');

	const scopeDetail =
		config.jqlFilter.trim() && allowedUsersCount > 0
			? `JQL is narrowing the issue set and Reports is scoped to ${allowedUsersCount} allowed user${allowedUsersCount === 1 ? '' : 's'}.`
			: config.jqlFilter.trim()
				? 'JQL is narrowing the issue set; Reports will include everyone this Jira account can see.'
				: allowedUsersCount > 0
					? `Reports is scoped to ${allowedUsersCount} allowed user${allowedUsersCount === 1 ? '' : 's'}.`
					: 'No scope filters yet, so Reports will use all issues and users visible to this Jira account.';

	const signalsDetail =
		configuredSignalCount === 0
			? 'Dashboard can still work with Jira only, but suggestions stay lighter until you add calendar feeds, GitLab, or RescueTime.'
			: configuredSourceFailures.length > 0
				? `${joinList(configuredSources)} configured, but ${joinList(configuredSourceFailures)} still need attention.`
				: `${joinList(configuredSources)} configured for richer suggestions and absence handling.`;

	const syncDetail = !hasConnectionCredentials
		? 'Save becomes relevant after you add the Jira connection details.'
		: isDirty
			? 'You have form changes that are not live yet. Save when you are happy with the setup.'
			: jiraResult?.success
				? 'Saved settings match the verified configuration.'
				: 'Settings are saved, but the Jira connection still needs verification.';

	const steps: SetupStepModel[] = [
		{
			id: 'connection',
			title: 'Connect to Jira',
			status: jiraStatus,
			summary:
				jiraStatus === 'ready'
					? 'Your Jira account is connected and ready.'
					: hasConnectionCredentials
						? 'Your Jira credentials are filled in. Run a test to confirm them.'
						: 'Start by adding Jira host, email, and API token.',
			detail: connectionDetail,
			sectionId: SETTINGS_SECTION_IDS.connection,
		},
		{
			id: 'scope',
			title: 'Define report scope',
			status: scopeStatus,
			summary:
				scopeStatus === 'ready'
					? 'Reports now have an explicit scope.'
					: 'Scope is still wide open.',
			detail: scopeDetail,
			sectionId: SETTINGS_SECTION_IDS.scope,
			optional: true,
		},
		{
			id: 'signals',
			title: 'Add optional signals',
			status: signalsStatus,
			summary:
				signalsStatus === 'ready'
					? 'Dashboard has richer sources available.'
					: configuredSignalCount > 0
						? 'Some optional sources are configured but still need review.'
						: 'You can improve suggestions later with optional sources.',
			detail: signalsDetail,
			sectionId: SETTINGS_SECTION_IDS.integrations,
			optional: true,
		},
		{
			id: 'verify',
			title: 'Verify and save',
			status: verifyStatus,
			summary:
				verifyStatus === 'ready'
					? 'The current setup is saved and verified.'
					: isDirty
						? 'There are unsaved changes to review.'
						: 'Run the Jira check and save once you are happy.',
			detail: syncDetail,
			sectionId: SETTINGS_SECTION_IDS.form,
		},
	];

	const completed = steps.filter((step) => step.status === 'ready').length;
	const total = steps.length;

	const diagnostics: DiagnosticItemModel[] = [
		{
			id: 'jira',
			label: 'Jira connection',
			status: jiraStatus,
			detail: connectionDetail,
			sectionId: SETTINGS_SECTION_IDS.connection,
		},
		{
			id: 'scope',
			label: 'Reports scope',
			status: scopeStatus,
			detail: scopeDetail,
			sectionId: SETTINGS_SECTION_IDS.scope,
		},
		{
			id: 'permissions',
			label: 'Worklog permissions',
			status:
				config.canAddWorklogs &&
				config.canEditWorklogs &&
				config.canDeleteWorklogs
					? 'ready'
					: 'warning',
			detail: permissionSummary(config),
			sectionId: SETTINGS_SECTION_IDS.permissions,
		},
		{
			id: 'signals',
			label: 'Dashboard signals',
			status: signalsStatus,
			detail: signalsDetail,
			sectionId: SETTINGS_SECTION_IDS.integrations,
		},
		{
			id: 'sync',
			label: 'Saved state',
			status: isDirty ? 'warning' : 'ready',
			detail: syncDetail,
			sectionId: SETTINGS_SECTION_IDS.form,
		},
	];

	const dashboardStatus: SetupStatus = !coreReady
		? overallStatus
		: config.canAddWorklogs
			? 'ready'
			: 'warning';
	const dashboardDetail = !coreReady
		? 'Finish verifying Jira and save the current form before relying on Dashboard actions.'
		: config.canAddWorklogs
			? configuredSignalCount > 0
				? 'Ready for weekly triage, quick logging, and richer suggestions.'
				: 'Ready for weekly triage and quick logging. Add optional sources later if you want smarter suggestions.'
			: 'Dashboard is usable in read-only mode, but quick logging is disabled by the current permissions.';

	const reportsStatus: SetupStatus = !coreReady ? overallStatus : 'ready';
	const reportsDetail = !coreReady
		? 'Verify the Jira connection first so weekly and monthly reports have a trusted data source.'
		: allowedUsersCount > 0
			? `Ready and scoped to ${allowedUsersCount} allowed user${allowedUsersCount === 1 ? '' : 's'}.`
			: 'Ready and currently shows everyone visible to this Jira account.';

	const headline = coreReady
		? configuredSignalCount > 0
			? 'Core setup is ready'
			: 'Core setup is ready for Jira-only use'
		: hasConnectionCredentials
			? isDirty
				? 'You are close - review and save the remaining changes'
				: 'Run a Jira check to finish the core setup'
			: 'Start with your Jira account details';

	const detail = coreReady
		? configuredSignalCount > 0
			? 'The app is ready for daily use, and your optional signals are already helping Dashboard stay useful.'
			: 'The app is ready for weekly logging and reporting. Optional sources can come later without blocking you.'
		: hasConnectionCredentials
			? 'The essentials are almost there. A successful Jira check plus a clean save is what turns this into a trustworthy daily tool.'
			: 'The first useful milestone is simple: add Jira host, email, and API token, then run the Jira connection test.';

	return {
		status: overallStatus,
		headline,
		detail,
		progress: {
			completed,
			total,
			percent: Math.round((completed / total) * 100),
		},
		steps,
		diagnostics,
		surfaces: {
			dashboard: {
				label: 'Dashboard',
				status: dashboardStatus,
				detail: dashboardDetail,
			},
			reports: {
				label: 'Reports',
				status: reportsStatus,
				detail: reportsDetail,
			},
		},
		quickFacts: {
			allowedUsersCount,
			configuredSignalCount,
			suggestionFeedCount,
			absenceFeedCount,
		},
	};
}
