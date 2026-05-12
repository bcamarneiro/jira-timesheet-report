import type React from 'react';
import { SETTINGS_SECTION_IDS } from '../../../constants/settingsSections';
import type {
	AbsenceAssignment,
	CalendarFeed,
} from '../../../../stores/useConfigStore';
import type { CalendarMapping } from '../../../../stores/useUserDataStore';
import { Button } from '../../ui/Button';
import { CalendarMappingsEditor } from '../CalendarMappingsEditor';
import * as styles from '../SettingsForm.module.css';
import { TeamAbsenceAssignmentsEditor } from '../TeamAbsenceAssignmentsEditor';

type ServiceStatus = {
	tone: 'ready' | 'warning' | 'pending';
	label: string;
};

interface IntegrationTestResult {
	loading: boolean;
	result: { success: boolean; message: string } | null;
}

type FeedEntry = {
	feed: CalendarFeed;
	index: number;
};

type Props = {
	// formData slices
	gitlabHost: string;
	gitlabToken: string;
	rescueTimeApiKey: string;
	absenceAssignments: AbsenceAssignment[];

	// Static IDs
	gitlabHostId: string;
	gitlabTokenId: string;
	rescueTimeKeyId: string;

	// Status / test state per service
	gitlabStatus: ServiceStatus;
	rescueTimeStatus: ServiceStatus;
	calendarStatus: ServiceStatus;
	gitlabTroubleshooting: string | null;
	integrationTests: {
		gitlab: IntegrationTestResult;
		rescuetime: IntegrationTestResult;
		calendar: IntegrationTestResult;
	};

	// Test action callbacks
	testGitlab: () => void;
	testRescueTime: () => void;
	testCalendar: () => void;
	canTestGitlab: boolean;
	canTestRescueTime: boolean;
	hasCalendarFeeds: boolean;

	// Calendar feeds
	suggestionFeedEntries: FeedEntry[];
	absenceFeedEntries: FeedEntry[];
	hasSharedAbsenceFeedsWithoutAssignments: boolean;
	showAbsenceAssignments: boolean;
	addCalendarFeed: (type: CalendarFeed['type']) => void;
	updateCalendarFeed: (index: number, patch: Partial<CalendarFeed>) => void;
	removeCalendarFeed: (index: number) => void;

	// Calendar mappings
	calendarMappings: CalendarMapping[];
	addCalendarMapping: (mapping: CalendarMapping) => void;
	updateCalendarMapping: (pattern: string, updated: CalendarMapping) => void;
	removeCalendarMapping: (pattern: string) => void;

	// Absence assignments
	addAbsenceAssignment: (assignment: AbsenceAssignment) => void;
	updateAbsenceAssignment: (
		target: { pattern: string; userEmail: string },
		next: AbsenceAssignment,
	) => void;
	removeAbsenceAssignment: (target: {
		pattern: string;
		userEmail: string;
	}) => void;
	allowedUserSuggestions: string[];

	// Input change handler
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

/**
 * Services / Integrations section: GitLab, RescueTime, Calendar feeds
 * (suggestion + time-off), Calendar mappings editor, and the team-absence
 * assignment editor. Largest single section in SettingsForm.
 */
export const IntegrationsSection: React.FC<Props> = ({
	gitlabHost,
	gitlabToken,
	rescueTimeApiKey,
	absenceAssignments,
	gitlabHostId,
	gitlabTokenId,
	rescueTimeKeyId,
	gitlabStatus,
	rescueTimeStatus,
	calendarStatus,
	gitlabTroubleshooting,
	integrationTests,
	testGitlab,
	testRescueTime,
	testCalendar,
	canTestGitlab,
	canTestRescueTime,
	hasCalendarFeeds,
	suggestionFeedEntries,
	absenceFeedEntries,
	hasSharedAbsenceFeedsWithoutAssignments,
	showAbsenceAssignments,
	addCalendarFeed,
	updateCalendarFeed,
	removeCalendarFeed,
	calendarMappings,
	addCalendarMapping,
	updateCalendarMapping,
	removeCalendarMapping,
	addAbsenceAssignment,
	updateAbsenceAssignment,
	removeAbsenceAssignment,
	allowedUserSuggestions,
	handleChange,
}) => {
	return (
		<fieldset id={SETTINGS_SECTION_IDS.integrations} className={styles.section}>
			<legend className={styles.sectionTitle}>
				Services <span className={styles.optional}>optional</span>
			</legend>
			<p className={styles.servicesIntro}>
				Each service helps in a different way. Keep them separate so it is
				obvious what powers suggestions, what reduces target hours, and what
				still needs review.
			</p>
			<div className={styles.servicesGrid}>
				<section className={styles.serviceCard}>
					<div className={styles.serviceHeader}>
						<div className={styles.serviceHeading}>
							<p className={styles.serviceKicker}>GitLab</p>
							<h3>Recent GitLab activity</h3>
							<p>
								Use GitLab events to suggest time from pushes, merge request
								actions, and review activity that already references Jira keys.
							</p>
						</div>
						<span
							className={`${styles.serviceStatusBadge} ${gitlabStatus.tone === 'ready' ? styles.serviceStatusReady : gitlabStatus.tone === 'warning' ? styles.serviceStatusWarning : styles.serviceStatusPending}`}
						>
							{gitlabStatus.label}
						</span>
					</div>
					<div className={styles.formGroup}>
						<label htmlFor={gitlabHostId}>GitLab Host</label>
						<input
							type="text"
							id={gitlabHostId}
							name="gitlabHost"
							value={gitlabHost}
							onChange={handleChange}
							placeholder="gitlab.com or vcs.company.net"
							autoCapitalize="off"
							autoCorrect="off"
							spellCheck={false}
						/>
						<small>
							Hostname only is ideal, but pasted <code>https://</code> URLs are
							normalized for you
						</small>
					</div>
					<div className={styles.formGroup}>
						<label htmlFor={gitlabTokenId}>GitLab Token</label>
						<input
							type="password"
							id={gitlabTokenId}
							name="gitlabToken"
							value={gitlabToken}
							onChange={handleChange}
						/>
						<small>
							Personal access token with <code>read_user</code> or{' '}
							<code>api</code> scope
						</small>
					</div>
					<div className={styles.serviceActions}>
						<Button
							type="button"
							variant="secondary"
							onClick={testGitlab}
							disabled={integrationTests.gitlab.loading || !canTestGitlab}
						>
							{integrationTests.gitlab.loading ? 'Testing...' : 'Test GitLab'}
						</Button>
					</div>
					{integrationTests.gitlab.result ? (
						<div className={styles.serviceFeedback}>
							<p
								className={`${styles.testResult} ${integrationTests.gitlab.result.success ? styles.testSuccess : styles.testError}`}
							>
								{integrationTests.gitlab.result.message}
							</p>
							{gitlabTroubleshooting ? (
								<p className={styles.serviceHint}>{gitlabTroubleshooting}</p>
							) : null}
						</div>
					) : (
						<p className={styles.serviceHint}>
							Run the test once to confirm the host, token, and proxy path are
							all valid together.
						</p>
					)}
				</section>

				<section className={styles.serviceCard}>
					<div className={styles.serviceHeader}>
						<div className={styles.serviceHeading}>
							<p className={styles.serviceKicker}>RescueTime</p>
							<h3>Personal activity signal</h3>
							<p>
								Use RescueTime to add a productivity signal when Jira and
								calendar data alone are not enough to explain a day.
							</p>
						</div>
						<span
							className={`${styles.serviceStatusBadge} ${rescueTimeStatus.tone === 'ready' ? styles.serviceStatusReady : rescueTimeStatus.tone === 'warning' ? styles.serviceStatusWarning : styles.serviceStatusPending}`}
						>
							{rescueTimeStatus.label}
						</span>
					</div>
					<div className={styles.formGroup}>
						<label htmlFor={rescueTimeKeyId}>RescueTime API Key</label>
						<input
							type="password"
							id={rescueTimeKeyId}
							name="rescueTimeApiKey"
							value={rescueTimeApiKey}
							onChange={handleChange}
						/>
						<small>Requires the CORS proxy to be running</small>
					</div>
					<div className={styles.serviceActions}>
						<Button
							type="button"
							variant="secondary"
							onClick={testRescueTime}
							disabled={
								integrationTests.rescuetime.loading || !canTestRescueTime
							}
						>
							{integrationTests.rescuetime.loading
								? 'Testing...'
								: 'Test RescueTime'}
						</Button>
					</div>
					{integrationTests.rescuetime.result ? (
						<p
							className={`${styles.testResult} ${integrationTests.rescuetime.result.success ? styles.testSuccess : styles.testError}`}
						>
							{integrationTests.rescuetime.result.message}
						</p>
					) : (
						<p className={styles.serviceHint}>
							Leave this blank if you only want Jira- and calendar-based
							suggestions.
						</p>
					)}
				</section>
			</div>

			<section className={`${styles.serviceCard} ${styles.serviceCardWide}`}>
				<div className={styles.serviceHeader}>
					<div className={styles.serviceHeading}>
						<p className={styles.serviceKicker}>Calendars</p>
						<h3>Suggestion feeds and time off calendars</h3>
						<p>
							Suggestion feeds turn meetings into worklog candidates. Time off
							calendars reduce target hours for the right person in Reports and
							for you in Dashboard.
						</p>
					</div>
					<span
						className={`${styles.serviceStatusBadge} ${calendarStatus.tone === 'ready' ? styles.serviceStatusReady : calendarStatus.tone === 'warning' ? styles.serviceStatusWarning : styles.serviceStatusPending}`}
					>
						{calendarStatus.label}
					</span>
				</div>

				<div className={styles.feedGroup}>
					<div className={styles.feedGroupHeader}>
						<div>
							<h4>Suggestion feeds</h4>
							<p>
								Best for calendars whose event titles already include Jira keys
								or can be mapped with the editor below.
							</p>
						</div>
						<Button
							type="button"
							variant="secondary"
							onClick={() => addCalendarFeed('suggestion')}
						>
							+ Suggestion feed
						</Button>
					</div>
					<div className={styles.feedList}>
						{suggestionFeedEntries.length > 0 ? (
							suggestionFeedEntries.map(({ feed, index }) => (
								<div
									key={`suggestion-${index.toString()}`}
									className={styles.calendarFeedCard}
								>
									<div className={styles.calendarCardHeader}>
										<div className={styles.calendarCardHeading}>
											<span className={styles.feedTypeBadge}>
												Suggestion feed
											</span>
											<strong>
												{feed.label.trim() || 'Untitled suggestion feed'}
											</strong>
										</div>
										<button
											type="button"
											className={styles.calendarRemove}
											onClick={() => removeCalendarFeed(index)}
											aria-label={`Remove ${feed.label || 'suggestion feed'}`}
										>
											&times;
										</button>
									</div>
									<div className={styles.feedFields}>
										<label className={styles.feedField}>
											<span className={styles.feedFieldLabel}>Label</span>
											<input
												type="text"
												value={feed.label}
												onChange={(e) =>
													updateCalendarFeed(index, { label: e.target.value })
												}
												placeholder="Team, Work, PrimeIT"
												className={styles.feedInput}
											/>
										</label>
										<label
											className={`${styles.feedField} ${styles.feedFieldWide}`}
										>
											<span className={styles.feedFieldLabel}>Feed URL</span>
											<input
												type="text"
												value={feed.url}
												onChange={(e) =>
													updateCalendarFeed(index, { url: e.target.value })
												}
												placeholder="https://calendar.google.com/...basic.ics"
												className={`${styles.feedInput} ${styles.feedUrlInput}`}
											/>
										</label>
									</div>
								</div>
							))
						) : (
							<p className={styles.feedHelper}>
								No suggestion feeds yet. Add one when you want meeting-based
								worklog suggestions.
							</p>
						)}
					</div>
				</div>

				<div className={styles.feedGroup}>
					<div className={styles.feedGroupHeader}>
						<div>
							<h4>Time off calendars</h4>
							<p>
								Each calendar can either count only for you or act as a shared
								team calendar that uses title-to-user assignments.
							</p>
						</div>
						<Button
							type="button"
							variant="secondary"
							onClick={() => addCalendarFeed('absence')}
						>
							+ Time off calendar
						</Button>
					</div>
					<div className={styles.feedList}>
						{absenceFeedEntries.length > 0 ? (
							absenceFeedEntries.map(({ feed, index }) => (
								<div
									key={`absence-${index.toString()}`}
									className={styles.calendarFeedCard}
								>
									<div className={styles.calendarCardHeader}>
										<div className={styles.calendarCardHeading}>
											<span className={styles.feedTypeBadge}>
												Time off calendar
											</span>
											<strong>
												{feed.label.trim() || 'Untitled time off calendar'}
											</strong>
										</div>
										<button
											type="button"
											className={styles.calendarRemove}
											onClick={() => removeCalendarFeed(index)}
											aria-label={`Remove ${feed.label || 'time off calendar'}`}
										>
											&times;
										</button>
									</div>
									<div className={styles.feedFields}>
										<label className={styles.feedField}>
											<span className={styles.feedFieldLabel}>Label</span>
											<input
												type="text"
												value={feed.label}
												onChange={(e) =>
													updateCalendarFeed(index, { label: e.target.value })
												}
												placeholder="Team vacations"
												className={styles.feedInput}
											/>
										</label>
										<label
											className={`${styles.feedField} ${styles.feedFieldWide}`}
										>
											<span className={styles.feedFieldLabel}>Feed URL</span>
											<input
												type="text"
												value={feed.url}
												onChange={(e) =>
													updateCalendarFeed(index, { url: e.target.value })
												}
												placeholder="https://outlook.office365.com/...ics"
												className={`${styles.feedInput} ${styles.feedUrlInput}`}
											/>
										</label>
										<label className={styles.feedField}>
											<span className={styles.feedFieldLabel}>
												Who should this affect?
											</span>
											<select
												value={feed.absenceAttribution ?? 'self'}
												onChange={(e) =>
													updateCalendarFeed(index, {
														absenceAttribution:
															e.target.value === 'shared' ? 'shared' : 'self',
													})
												}
												className={styles.feedSelect}
												aria-label={`Attribution mode for ${feed.label || 'time off calendar'}`}
											>
												<option value="self">Only me</option>
												<option value="shared">Shared team calendar</option>
											</select>
										</label>
										{(feed.absenceAttribution ?? 'self') === 'self' ? (
											<label className={styles.feedField}>
												<span className={styles.feedFieldLabel}>
													Optional title filter
												</span>
												<input
													type="text"
													value={feed.titleFilter ?? ''}
													onChange={(e) =>
														updateCalendarFeed(index, {
															titleFilter: e.target.value || undefined,
														})
													}
													placeholder="Only titles containing your name"
													className={styles.feedInput}
												/>
											</label>
										) : (
											<div
												className={`${styles.feedField} ${styles.feedFieldHint}`}
											>
												<span className={styles.feedFieldLabel}>
													Attribution rules
												</span>
												<p className={styles.calendarModeHint}>
													Shared calendars use the assignment rules below to
													match event titles to the right teammate.
												</p>
											</div>
										)}
									</div>
								</div>
							))
						) : (
							<p className={styles.feedHelper}>
								No time off calendars yet. Leave this empty if target hours
								should always assume a full work week.
							</p>
						)}
					</div>
					{hasSharedAbsenceFeedsWithoutAssignments ? (
						<p className={styles.serviceHint}>
							At least one shared time-off calendar still needs assignment rules
							below so shared events reduce the right person’s target hours.
						</p>
					) : null}
				</div>

				<div className={styles.serviceActions}>
					<Button
						type="button"
						variant="secondary"
						onClick={testCalendar}
						disabled={integrationTests.calendar.loading || !hasCalendarFeeds}
					>
						{integrationTests.calendar.loading
							? 'Testing...'
							: 'Test calendars'}
					</Button>
				</div>
				{integrationTests.calendar.result ? (
					<p
						className={`${styles.testResult} ${integrationTests.calendar.result.success ? styles.testSuccess : styles.testError}`}
					>
						{integrationTests.calendar.result.message}
					</p>
				) : (
					<p className={styles.serviceHint}>
						Calendar tests confirm the feed URLs are reachable and parse as
						ICS/iCal. They do not yet validate whether your title filters or
						shared-calendar assignment rules are too broad.
					</p>
				)}

				<div id={SETTINGS_SECTION_IDS.calendarMappings}>
					<CalendarMappingsEditor
						mappings={calendarMappings}
						onAdd={addCalendarMapping}
						onUpdate={updateCalendarMapping}
						onRemove={removeCalendarMapping}
					/>
				</div>

				{showAbsenceAssignments ? (
					<TeamAbsenceAssignmentsEditor
						assignments={absenceAssignments}
						userSuggestions={allowedUserSuggestions}
						onAdd={addAbsenceAssignment}
						onUpdate={updateAbsenceAssignment}
						onRemove={removeAbsenceAssignment}
					/>
				) : null}
			</section>
		</fieldset>
	);
};
