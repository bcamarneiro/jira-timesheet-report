import type { TeamMemberSummary } from '../../services/teamService';
import {
	buildProvenanceFooter,
	CSV_SEP as SEP,
	csvEscape,
} from './csvHelpers';
import { parseIsoDateLocal } from './date';

function formatDayLabel(dateStr: string): string {
	const d = parseIsoDateLocal(dateStr);
	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	return `${days[d.getDay()]} ${d.getDate()}`;
}

/**
 * Provenance metadata appended as a `# generated=…` footer line, mirroring
 * the finance-grade per-user CSV exporters.
 */
export interface TeamCsvProvenance {
	jiraHost?: string;
	sourceVersion?: string;
	generatedAt?: string;
}

export function buildTeamCsv(
	members: TeamMemberSummary[],
	weekdays: string[],
	provenance?: TeamCsvProvenance,
): string {
	const dayHeaders = weekdays.map(formatDayLabel);

	const headers = [
		'Team Member',
		'Email',
		...dayHeaders,
		'Total (h)',
		'Backdated (h)',
		'Gap (h)',
	].join(SEP);

	const rows = members.map((m) => {
		const dailyCells = weekdays.map((day) => {
			const hours = m.dailyHours.get(day) || 0;
			return hours > 0 ? hours.toFixed(1) : '0';
		});

		const backdatedHours = ((m.backdatedSeconds ?? 0) / 3600).toFixed(1);

		return [
			csvEscape(m.displayName),
			m.email,
			...dailyCells,
			(m.totalSeconds / 3600).toFixed(1),
			backdatedHours,
			(m.gapSeconds / 3600).toFixed(1),
		].join(SEP);
	});

	// Team average row
	const count = members.length;
	if (count > 0) {
		const avgCells = weekdays.map((day) => {
			const avg =
				members.reduce((sum, m) => sum + (m.dailyHours.get(day) || 0), 0) /
				count;
			return avg > 0 ? avg.toFixed(1) : '0';
		});
		const avgTotal =
			members.reduce((sum, m) => sum + m.totalSeconds, 0) / count / 3600;
		const avgBackdated =
			members.reduce((sum, m) => sum + (m.backdatedSeconds ?? 0), 0) /
			count /
			3600;
		const avgGap =
			members.reduce((sum, m) => sum + m.gapSeconds, 0) / count / 3600;

		rows.push(
			[
				'Team Average',
				'',
				...avgCells,
				avgTotal.toFixed(1),
				avgBackdated.toFixed(1),
				avgGap.toFixed(1),
			].join(SEP),
		);
	}

	const periodStart = weekdays[0] ?? '';
	const periodEnd = weekdays[weekdays.length - 1] ?? '';
	const provenanceFooter = buildProvenanceFooter({
		policy: 'logged',
		period: `${periodStart}..${periodEnd}`,
		provenance,
		omitMissingVersion: true,
	});

	return [headers, ...rows, provenanceFooter].join('\n');
}
