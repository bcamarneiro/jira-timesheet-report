import type { TeamMemberSummary } from '../../services/teamService';
import { addDaysToIsoDate } from '../utils/date';

/**
 * Static fixture powering the public `/demo` route (ADA-303).
 *
 * The demo renders the team-lead weekly rollup with no Jira connection, no
 * network calls, and no localStorage writes — it feeds this synthetic data
 * straight into the presentational `ReportsWeeklyView`. All names, emails, and
 * hosts are fictional; there is no real personal data here.
 */

/** Monday of the demo week. A real Monday so the Mon–Fri labels line up. */
export const DEMO_WEEK_START = '2026-05-18';

/** The five weekday ISO dates (Mon–Fri) the demo renders. */
export const DEMO_WEEKDAYS: string[] = Array.from({ length: 5 }, (_, i) =>
	addDaysToIsoDate(DEMO_WEEK_START, i),
);

const HOUR_SECONDS = 3600;
/** Full-time weekly target: 5 days × 8h. */
const WEEKLY_TARGET_SECONDS = 5 * 8 * HOUR_SECONDS;

interface DemoMemberSeed {
	displayName: string;
	email: string;
	/** Hours logged Mon–Fri, in `DEMO_WEEKDAYS` order. */
	hours: [number, number, number, number, number];
	/** ISO dates where the person logged on a day off (drives the ⚠ badge). */
	workedOnPtoDates?: string[];
}

// A realistic small consulting team: one fully compliant, a couple with minor
// gaps, and one clearly behind with a missed day — that contrast is the
// "value moment" the demo needs to land in the first few seconds.
const SEEDS: DemoMemberSeed[] = [
	{
		displayName: 'Alex Turner',
		email: 'alex.t@demo.hoursmith.io',
		hours: [8, 8, 8, 8, 8],
	},
	{
		displayName: 'Maria Kovač',
		email: 'maria.k@demo.hoursmith.io',
		hours: [8, 8, 4, 8, 8],
		workedOnPtoDates: [DEMO_WEEKDAYS[2]],
	},
	{
		displayName: 'Sam Patel',
		email: 'sam.p@demo.hoursmith.io',
		hours: [8, 8, 0, 8, 8],
	},
	{
		displayName: 'Jordan Lee',
		email: 'jordan.l@demo.hoursmith.io',
		hours: [6, 4, 7, 0, 5],
	},
	{
		displayName: 'Priya Nair',
		email: 'priya.n@demo.hoursmith.io',
		hours: [8, 7.5, 8, 8, 8],
	},
];

/** Build the demo team rollup as `TeamMemberSummary[]` (the shape the weekly
 *  view and the CSV exporter both consume). */
export function buildDemoTeam(): TeamMemberSummary[] {
	return SEEDS.map((seed) => {
		const dailyHours = new Map<string, number>();
		let totalSeconds = 0;
		seed.hours.forEach((hours, index) => {
			dailyHours.set(DEMO_WEEKDAYS[index], hours);
			totalSeconds += Math.round(hours * HOUR_SECONDS);
		});
		return {
			email: seed.email,
			displayName: seed.displayName,
			dailyHours,
			totalSeconds,
			targetSeconds: WEEKLY_TARGET_SECONDS,
			gapSeconds: Math.max(0, WEEKLY_TARGET_SECONDS - totalSeconds),
			backdatedSeconds: 0,
			workedOnPtoDates: seed.workedOnPtoDates,
		};
	});
}
