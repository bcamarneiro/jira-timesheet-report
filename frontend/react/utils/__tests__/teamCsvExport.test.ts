import { describe, expect, it } from 'vitest';
import type { TeamMemberSummary } from '../../../services/teamService';
import { buildTeamCsv } from '../teamCsvExport';

const weekdays = [
	'2026-03-09',
	'2026-03-10',
	'2026-03-11',
	'2026-03-12',
	'2026-03-13',
];

const fixedProvenance = {
	jiraHost: 'example.atlassian.net',
	generatedAt: '2026-03-16T09:00:00.000Z',
	sourceVersion: '1.2.3',
};

function makeMember(
	overrides: Partial<TeamMemberSummary> = {},
): TeamMemberSummary {
	return {
		email: 'alice@example.com',
		displayName: 'Alice',
		dailyHours: new Map([
			['2026-03-09', 8],
			['2026-03-10', 7.5],
			['2026-03-11', 8],
			['2026-03-12', 8],
			['2026-03-13', 6],
		]),
		totalSeconds: 37.5 * 3600,
		targetSeconds: 40 * 3600,
		gapSeconds: 2.5 * 3600,
		...overrides,
	};
}

describe('buildTeamCsv', () => {
	it('includes Backdated (h) column in the header', () => {
		const csv = buildTeamCsv([makeMember()], weekdays, fixedProvenance);
		const headerLine = csv.split('\n')[0];

		expect(headerLine).toContain('Backdated (h)');
		// The Backdated column sits between Total and Gap so the schema mirrors
		// the finance-grade per-user export.
		const fields = headerLine.split(';');
		const totalIdx = fields.indexOf('Total (h)');
		const backdatedIdx = fields.indexOf('Backdated (h)');
		const gapIdx = fields.indexOf('Gap (h)');
		expect(backdatedIdx).toBe(totalIdx + 1);
		expect(gapIdx).toBe(backdatedIdx + 1);
	});

	it('emits 0.0 in the Backdated column until teamService surfaces it', () => {
		const csv = buildTeamCsv([makeMember()], weekdays, fixedProvenance);
		const lines = csv.split('\n');
		const memberRow = lines[1].split(';');
		// Backdated value sits second-from-last (before Gap).
		expect(memberRow.at(-2)).toBe('0.0');
	});

	it('appends a provenance footer line in the canonical format', () => {
		const csv = buildTeamCsv([makeMember()], weekdays, fixedProvenance);
		const lastLine = csv.split('\n').at(-1) ?? '';

		expect(lastLine).toBe(
			'# generated=2026-03-16T09:00:00.000Z jira=example.atlassian.net policy=logged period=2026-03-09..2026-03-13 version=1.2.3',
		);
	});

	it('keeps the matrix shape with one column per weekday', () => {
		const csv = buildTeamCsv([makeMember()], weekdays, fixedProvenance);
		const headerLine = csv.split('\n')[0];
		const fields = headerLine.split(';');
		// Team Member, Email, 5 weekdays, Total, Backdated, Gap = 10 columns
		expect(fields).toHaveLength(2 + weekdays.length + 3);
	});

	it('renders a Team Average row when at least one member is present', () => {
		const csv = buildTeamCsv(
			[
				makeMember(),
				makeMember({ email: 'bob@example.com', displayName: 'Bob' }),
			],
			weekdays,
			fixedProvenance,
		);
		const lines = csv.split('\n');
		// header, two member rows, average row, footer
		expect(lines).toHaveLength(5);
		expect(lines[3].startsWith('Team Average')).toBe(true);
	});

	it('defaults provenance metadata when not supplied', () => {
		const csv = buildTeamCsv([makeMember()], weekdays);
		const lastLine = csv.split('\n').at(-1) ?? '';

		expect(lastLine.startsWith('# generated=')).toBe(true);
		expect(lastLine).toContain('policy=logged');
		expect(lastLine).toContain('period=2026-03-09..2026-03-13');
	});

	it('keeps daily hours at 1dp precision', () => {
		const csv = buildTeamCsv([makeMember()], weekdays, fixedProvenance);
		const memberRow = csv.split('\n')[1].split(';');
		// First weekday cell after Email
		expect(memberRow[2]).toBe('8.0');
		expect(memberRow[3]).toBe('7.5');
	});
});
