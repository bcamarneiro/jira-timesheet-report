import type { TeamMemberSummary } from '../../services/teamService';

const SEP = ';';

function csvEscape(value: string): string {
	const safe = (value ?? '')
		.replace(/\r?\n|\r/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	if (safe.includes('"') || safe.includes(',') || safe.includes(';')) {
		return `"${safe.replace(/"/g, '""')}"`;
	}
	return safe;
}

function formatDayLabel(dateStr: string): string {
	const d = new Date(dateStr);
	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	return `${days[d.getDay()]} ${d.getDate()}`;
}

export function buildTeamCsv(
	members: TeamMemberSummary[],
	weekdays: string[],
): string {
	const dayHeaders = weekdays.map(formatDayLabel);

	const headers = [
		'Team Member',
		'Email',
		...dayHeaders,
		'Total (h)',
		'Gap (h)',
	].join(SEP);

	const rows = members.map((m) => {
		const dailyCells = weekdays.map((day) => {
			const hours = m.dailyHours.get(day) || 0;
			return hours > 0 ? hours.toFixed(1) : '0';
		});

		return [
			csvEscape(m.displayName),
			m.email,
			...dailyCells,
			(m.totalSeconds / 3600).toFixed(1),
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
		const avgGap =
			members.reduce((sum, m) => sum + m.gapSeconds, 0) / count / 3600;

		rows.push(
			[
				'Team Average',
				'',
				...avgCells,
				avgTotal.toFixed(1),
				avgGap.toFixed(1),
			].join(SEP),
		);
	}

	return [headers, ...rows].join('\n');
}
