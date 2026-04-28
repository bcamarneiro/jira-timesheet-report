import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchAbsenceDays, fetchAbsenceDaysByUser } from '../absenceService';

const teamCalendarIcs = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Bruno C - Vacation
DTSTART;VALUE=DATE:20260407
DTEND;VALUE=DATE:20260408
END:VEVENT
BEGIN:VEVENT
SUMMARY:Daniel D - Sick
DTSTART;VALUE=DATE:20260408
DTEND;VALUE=DATE:20260409
END:VEVENT
BEGIN:VEVENT
SUMMARY:Bruno C - Off
DTSTART;VALUE=DATE:20260409
DTEND;VALUE=DATE:20260410
END:VEVENT
END:VCALENDAR`;

describe('absenceService', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('assigns shared absence events to the configured users by title pattern', async () => {
		vi.spyOn(global, 'fetch').mockResolvedValue({
			ok: true,
			text: async () => teamCalendarIcs,
		} as Response);

		const result = await fetchAbsenceDaysByUser(
			[
				{
					label: 'Team vacations',
					url: 'https://calendar.example.com/team.ics',
					type: 'absence',
					absenceAttribution: 'shared',
				},
			],
			[
				{ pattern: 'Bruno C', userEmail: 'bruno@example.com' },
				{ pattern: 'Daniel D', userEmail: 'daniel@example.com' },
			],
			'bruno@example.com',
			'',
			'2026-04-06',
			'2026-04-10',
		);

		expect([...(result.get('bruno@example.com')?.keys() ?? [])]).toEqual([
			'2026-04-07',
			'2026-04-09',
		]);
		expect([...(result.get('daniel@example.com')?.keys() ?? [])]).toEqual([
			'2026-04-08',
		]);
		expect(result.get('bruno@example.com')?.get('2026-04-07')?.kind).toBe(
			'vacation',
		);
		expect(result.get('bruno@example.com')?.get('2026-04-09')?.kind).toBe(
			'off',
		);
		expect(result.get('daniel@example.com')?.get('2026-04-08')?.kind).toBe(
			'sick',
		);
		expect(result.has('nobody@example.com')).toBe(false);
	});

	it('falls back to the personal title filter for the current user', async () => {
		vi.spyOn(global, 'fetch').mockResolvedValue({
			ok: true,
			text: async () => teamCalendarIcs,
		} as Response);

		const result = await fetchAbsenceDays(
			[
				{
					label: 'Team vacations',
					url: 'https://calendar.example.com/team.ics',
					type: 'absence',
					absenceAttribution: 'self',
					titleFilter: 'Bruno C',
				},
			],
			[],
			'bruno@example.com',
			'',
			'2026-04-06',
			'2026-04-10',
		);

		expect([...result.keys()]).toEqual(['2026-04-07', '2026-04-09']);
		expect(result.get('2026-04-07')?.reasons).toEqual([
			'[Team vacations] Bruno C - Vacation',
		]);
		expect(result.get('2026-04-07')?.kind).toBe('vacation');
		expect(result.get('2026-04-09')?.kind).toBe('off');
	});

	it('prefers sick over other absence kinds when a day has multiple events', async () => {
		vi.spyOn(global, 'fetch').mockResolvedValue({
			ok: true,
			text: async () => `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Bruno C - Off
DTSTART;VALUE=DATE:20260407
DTEND;VALUE=DATE:20260408
END:VEVENT
BEGIN:VEVENT
SUMMARY:Bruno C - Sick
DTSTART;VALUE=DATE:20260407
DTEND;VALUE=DATE:20260408
END:VEVENT
END:VCALENDAR`,
		} as Response);

		const result = await fetchAbsenceDaysByUser(
			[
				{
					label: 'Team time off',
					url: 'https://calendar.example.com/team.ics',
					type: 'absence',
					absenceAttribution: 'shared',
				},
			],
			[{ pattern: 'Bruno C', userEmail: 'bruno@example.com' }],
			'bruno@example.com',
			'',
			'2026-04-06',
			'2026-04-10',
		);

		expect(result.get('bruno@example.com')?.get('2026-04-07')?.kind).toBe(
			'sick',
		);
	});
});
