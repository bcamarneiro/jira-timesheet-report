import type React from 'react';
import { useConfigStore } from '../../../stores/useConfigStore';
import { useDashboardStore } from '../../../stores/useDashboardStore';
import * as styles from './SourceStatusBar.module.css';

export const SourceStatusBar: React.FC = () => {
	const config = useConfigStore((s) => s.config);
	const isLoadingJira = useDashboardStore((s) => s.isLoadingJiraSuggestions);
	const isLoadingGitlab = useDashboardStore(
		(s) => s.isLoadingGitlabSuggestions,
	);
	const isLoadingCalendar = useDashboardStore(
		(s) => s.isLoadingCalendarSuggestions,
	);
	const isLoadingRescueTime = useDashboardStore((s) => s.isLoadingRescueTime);
	const jiraError = useDashboardStore((s) => s.jiraSuggestionsError);
	const gitlabError = useDashboardStore((s) => s.gitlabSuggestionsError);
	const calendarError = useDashboardStore((s) => s.calendarSuggestionsError);
	const rescueTimeError = useDashboardStore((s) => s.rescueTimeError);

	const hasGitlab = !!(config.gitlabToken && config.gitlabHost);
	const hasCalendar = config.calendarFeeds && config.calendarFeeds.length > 0;
	const hasRescueTime = !!config.rescueTimeApiKey;

	return (
		<div className={styles.container}>
			<SourcePill
				label="Jira"
				loading={isLoadingJira}
				error={jiraError}
				configured
			/>
			<SourcePill
				label="GitLab"
				loading={isLoadingGitlab}
				error={gitlabError}
				configured={hasGitlab}
			/>
			<SourcePill
				label="Calendar"
				loading={isLoadingCalendar}
				error={calendarError}
				configured={hasCalendar}
			/>
			<SourcePill
				label="RescueTime"
				loading={isLoadingRescueTime}
				error={rescueTimeError}
				configured={hasRescueTime}
			/>
		</div>
	);
};

function SourcePill({
	label,
	loading,
	error,
	configured,
}: {
	label: string;
	loading: boolean;
	error: string | null;
	configured: boolean;
}) {
	let status: string;
	let className: string;

	if (!configured) {
		status = 'Off';
		className = styles.off;
	} else if (loading) {
		status = '...';
		className = styles.loading;
	} else if (error) {
		status = 'Error';
		className = styles.error;
	} else {
		status = 'OK';
		className = styles.ok;
	}

	return (
		<span
			className={`${styles.pill} ${className}`}
			title={error || (configured ? 'Connected' : 'Not configured')}
		>
			{label}: {status}
		</span>
	);
}
