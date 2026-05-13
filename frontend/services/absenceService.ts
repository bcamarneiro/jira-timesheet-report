import type { AbsenceKind } from '../../types/absence';
import { logger } from '../react/utils/logger';
import type { AbsenceAssignment, CalendarFeed } from '../stores/useConfigStore';
import { fromHttpResponse } from './serviceErrors';

/**
 * ICS parsing utilities — lightweight re-implementation of the subset needed
 * for absence detection (all-day events only).
 */

interface AbsenceEvent {
	summary: string;
	dtstart: string;
	dtend: string;
	rrule: string;
	exdates: string[];
}

function isAbortError(error: unknown): boolean {
	return (
		(error instanceof DOMException && error.name === 'AbortError') ||
		(error instanceof Error && error.name === 'AbortError')
	);
}

function matchesTitleFilter(summary: string, titleFilter?: string): boolean {
	if (!titleFilter?.trim()) return true;
	return summary.toLowerCase().includes(titleFilter.trim().toLowerCase());
}

function getAbsenceAttributionMode(feed: CalendarFeed): 'self' | 'shared' {
	return feed.absenceAttribution === 'shared' ? 'shared' : 'self';
}

export function classifyAbsenceKind(summary: string): AbsenceKind {
	const normalized = summary.trim().toLowerCase();
	if (normalized.includes('sick')) return 'sick';
	if (normalized.includes('vacation')) return 'vacation';
	return 'off';
}

function resolveAbsenceKind(
	current: AbsenceKind,
	next: AbsenceKind,
): AbsenceKind {
	// Priority: a more specific reason wins. Sick > holiday > vacation > off.
	// `holiday` ranks above `vacation` so that a public holiday colliding with
	// a personal vacation day still surfaces as "Holiday" in the label.
	const priority: Record<AbsenceKind, number> = {
		off: 1,
		vacation: 2,
		holiday: 3,
		sick: 4,
	};
	return priority[next] >= priority[current] ? next : current;
}

function unfoldLines(raw: string): string[] {
	const lines: string[] = [];
	for (const line of raw.split(/\r?\n/)) {
		if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length > 0) {
			lines[lines.length - 1] += line.slice(1);
		} else {
			lines.push(line);
		}
	}
	return lines;
}

function parseIcsDate(value: string): string | null {
	const parts = value.split(':');
	const clean = value.includes(':') ? parts[parts.length - 1] : value;
	const digits = clean.replace(/[^0-9]/g, '');

	if (digits.length >= 8) {
		const y = digits.slice(0, 4);
		const m = digits.slice(4, 6);
		const d = digits.slice(6, 8);
		return `${y}-${m}-${d}`;
	}
	return null;
}

function toLocalDateStr(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function parseRRule(rrule: string): Record<string, string> {
	const result: Record<string, string> = {};
	for (const part of rrule.split(';')) {
		const eqIdx = part.indexOf('=');
		if (eqIdx > 0) {
			result[part.slice(0, eqIdx)] = part.slice(eqIdx + 1);
		}
	}
	return result;
}

function parseAbsenceEvents(text: string): AbsenceEvent[] {
	const lines = unfoldLines(text);
	const events: AbsenceEvent[] = [];
	let inEvent = false;
	let summary = '';
	let dtstart = '';
	let dtend = '';
	let status = '';
	let rrule = '';
	let exdates: string[] = [];

	for (const line of lines) {
		if (line === 'BEGIN:VEVENT') {
			inEvent = true;
			summary = '';
			dtstart = '';
			dtend = '';
			status = '';
			rrule = '';
			exdates = [];
			continue;
		}

		if (line === 'END:VEVENT') {
			if (inEvent && dtstart && status !== 'CANCELLED') {
				// Only keep all-day events (VALUE=DATE or 8-digit dates without T)
				const isAllDay =
					line.includes('VALUE=DATE') ||
					dtstart.length <= 8 ||
					dtstart.includes('VALUE=DATE');
				// Check the raw dtstart for all-day pattern
				const rawValue = dtstart.includes(':')
					? dtstart.split(':').pop() || ''
					: dtstart;
				const isAllDayByLength = rawValue.replace(/[^0-9]/g, '').length === 8;

				if (isAllDay || isAllDayByLength) {
					events.push({
						summary,
						dtstart,
						dtend: dtend || dtstart,
						rrule,
						exdates,
					});
				}
			}
			inEvent = false;
			continue;
		}

		if (!inEvent) continue;

		if (line.startsWith('SUMMARY')) {
			summary = line.replace(/^SUMMARY[^:]*:/, '');
		} else if (line.startsWith('DTSTART')) {
			dtstart = line.replace(/^DTSTART/, '');
		} else if (line.startsWith('DTEND')) {
			dtend = line.replace(/^DTEND/, '');
		} else if (line.startsWith('STATUS')) {
			status = line.replace(/^STATUS[^:]*:/, '').trim();
		} else if (line.startsWith('RRULE')) {
			rrule = line.replace(/^RRULE:/, '');
		} else if (line.startsWith('EXDATE')) {
			const val = line.replace(/^EXDATE[^:]*:/, '');
			for (const v of val.split(',')) {
				if (v.trim()) exdates.push(v.trim());
			}
		}
	}

	return events;
}

/**
 * Expand all-day events into individual date strings within [rangeStart, rangeEnd].
 * For multi-day events (dtstart != dtend), generates each intermediate day.
 * For recurring events, expands DAILY/WEEKLY/MONTHLY patterns.
 */
function expandAbsenceDates(
	event: AbsenceEvent,
	rangeStart: string,
	rangeEnd: string,
): { date: string; summary: string }[] {
	const results: { date: string; summary: string }[] = [];

	const startIso = parseIcsDate(event.dtstart);
	const endIso = parseIcsDate(event.dtend);
	if (!startIso) return results;

	// Build excluded dates set
	const exdateSet = new Set<string>();
	for (const exd of event.exdates) {
		const parsed = parseIcsDate(exd);
		if (parsed) exdateSet.add(parsed);
	}

	if (!event.rrule) {
		// Non-recurring: expand date range [startIso, endIso)
		// ICS all-day DTEND is exclusive (next day after last day)
		const effectiveEnd = endIso || startIso;
		const cursor = new Date(`${startIso}T00:00:00`);
		const endDate = new Date(`${effectiveEnd}T00:00:00`);

		while (cursor < endDate) {
			const iso = toLocalDateStr(cursor);
			if (iso >= rangeStart && iso <= rangeEnd && !exdateSet.has(iso)) {
				// Weekends are kept too — they have a zero target so they
				// don't change compliance %, but they remain visible on the
				// calendar/heatmap (e.g. sick day that spans Sat–Mon).
				results.push({ date: iso, summary: event.summary });
			}
			cursor.setDate(cursor.getDate() + 1);
		}
		return results;
	}

	// Recurring event expansion
	const rule = parseRRule(event.rrule);
	const freq = rule.FREQ;
	const interval = Number.parseInt(rule.INTERVAL || '1', 10);
	const count = rule.COUNT ? Number.parseInt(rule.COUNT, 10) : undefined;

	let until: Date | null = null;
	if (rule.UNTIL) {
		const parsed = parseIcsDate(rule.UNTIL);
		if (parsed) until = new Date(`${parsed}T23:59:59`);
	}

	const rangeStartDate = new Date(`${rangeStart}T00:00:00`);
	const rangeEndDate = new Date(`${rangeEnd}T23:59:59`);
	const hardLimit = new Date(rangeStartDate);
	hardLimit.setFullYear(hardLimit.getFullYear() + 1);

	const originDate = new Date(`${startIso}T00:00:00`);
	let generated = 0;
	const maxOccurrences = count || 500;

	const addIfInRange = (d: Date) => {
		const iso = toLocalDateStr(d);
		if (d >= rangeStartDate && d <= rangeEndDate && !exdateSet.has(iso)) {
			// Weekends kept (see expansion of non-recurring events above).
			results.push({ date: iso, summary: event.summary });
		}
	};

	if (freq === 'YEARLY') {
		const cursor = new Date(originDate);
		while (cursor <= rangeEndDate && cursor <= hardLimit) {
			if (until && cursor > until) break;
			if (generated >= maxOccurrences) break;
			generated++;
			addIfInRange(cursor);
			cursor.setFullYear(cursor.getFullYear() + interval);
		}
	} else if (freq === 'MONTHLY') {
		const cursor = new Date(originDate);
		while (cursor <= rangeEndDate && cursor <= hardLimit) {
			if (until && cursor > until) break;
			if (generated >= maxOccurrences) break;
			generated++;
			addIfInRange(cursor);
			cursor.setMonth(cursor.getMonth() + interval);
		}
	} else if (freq === 'WEEKLY') {
		const cursor = new Date(originDate);
		while (cursor <= rangeEndDate && cursor <= hardLimit) {
			if (until && cursor > until) break;
			if (generated >= maxOccurrences) break;
			generated++;
			addIfInRange(cursor);
			cursor.setDate(cursor.getDate() + 7 * interval);
		}
	} else if (freq === 'DAILY') {
		const cursor = new Date(originDate);
		while (cursor <= rangeEndDate && cursor <= hardLimit) {
			if (until && cursor > until) break;
			if (generated >= maxOccurrences) break;
			generated++;
			addIfInRange(cursor);
			cursor.setDate(cursor.getDate() + interval);
		}
	}

	return results;
}

export interface AbsenceDay {
	date: string;
	reasons: string[];
	kind: AbsenceKind;
}

export type UserAbsenceDays = Map<string, Map<string, AbsenceDay>>;

function addAbsenceReason(
	userAbsenceDays: UserAbsenceDays,
	userEmail: string,
	date: string,
	reason: string,
	kind: AbsenceKind,
) {
	const normalizedEmail = userEmail.trim().toLowerCase();
	if (!normalizedEmail) return;

	let userDates = userAbsenceDays.get(normalizedEmail);
	if (!userDates) {
		userDates = new Map();
		userAbsenceDays.set(normalizedEmail, userDates);
	}

	const existing = userDates.get(date);
	if (existing) {
		if (!existing.reasons.includes(reason)) {
			existing.reasons.push(reason);
		}
		existing.kind = resolveAbsenceKind(existing.kind, kind);
		return;
	}

	userDates.set(date, {
		date,
		reasons: [reason],
		kind,
	});
}

function findMatchedUsers(
	summary: string,
	assignments: NormalisedAssignment[],
): string[] {
	const matched = assignments.filter((assignment) =>
		summary.toLowerCase().includes(assignment.pattern.toLowerCase()),
	);
	const out = new Set<string>();
	for (const a of matched) {
		for (const email of a.userEmails) out.add(email);
	}
	return [...out];
}

interface NormalisedAssignment {
	pattern: string;
	userEmails: string[];
}

export async function fetchAbsenceDaysByUser(
	feeds: CalendarFeed[],
	assignments: AbsenceAssignment[],
	currentUserEmail: string,
	corsProxy: string,
	rangeStart: string,
	rangeEnd: string,
	signal?: AbortSignal,
): Promise<UserAbsenceDays> {
	const absenceFeeds = feeds.filter(
		(feed) => feed.type === 'absence' && feed.url.trim(),
	);
	const holidayFeeds = feeds.filter(
		(feed) => feed.type === 'holiday' && feed.url.trim(),
	);
	if (absenceFeeds.length === 0 && holidayFeeds.length === 0) return new Map();

	const normalizedAssignments: NormalisedAssignment[] = assignments
		.map((assignment) => ({
			pattern: assignment.pattern.trim(),
			userEmails: assignment.userEmails
				.map((email) => email.trim().toLowerCase())
				.filter((email) => email.length > 0),
		}))
		.filter((assignment) => assignment.pattern && assignment.userEmails.length > 0);
	const normalizedCurrentUser = currentUserEmail.trim().toLowerCase();

	type FeedResult = {
		feedType: 'absence' | 'holiday';
		label: string;
		absenceAttribution: 'self' | 'shared';
		titleFilter?: string;
		events: AbsenceEvent[];
	};

	const allFeeds: { feed: CalendarFeed; feedType: 'absence' | 'holiday' }[] = [
		...absenceFeeds.map((feed) => ({ feed, feedType: 'absence' as const })),
		...holidayFeeds.map((feed) => ({ feed, feedType: 'holiday' as const })),
	];

	const results = await Promise.allSettled(
		allFeeds.map<Promise<FeedResult>>(async ({ feed, feedType }) => {
			const url = corsProxy
				? `${corsProxy.replace(/\/$/, '')}/${feed.url}`
				: feed.url;
			const res = await fetch(url, { signal });
			if (!res.ok) throw fromHttpResponse('Absence feed', res.status);
			const text = await res.text();
			return {
				feedType,
				label: feed.label,
				absenceAttribution: getAbsenceAttributionMode(feed),
				titleFilter: feed.titleFilter,
				events: parseAbsenceEvents(text),
			};
		}),
	);

	const userAbsenceDays: UserAbsenceDays = new Map();
	// Holiday events whose summary doesn't match any assignment pattern apply
	// to *every* user (the nationwide default). We collect them here and merge
	// onto every known user after the per-user passes populate the recipient
	// set.
	const nationwideHolidays = new Map<string, { reason: string }>();

	for (const result of results) {
		if (result.status !== 'fulfilled') {
			if (!isAbortError(result.reason)) {
				logger.warn('[Absence] Feed failed:', result.reason);
			}
			continue;
		}

		const { feedType, label, absenceAttribution, titleFilter, events } =
			result.value;

		if (feedType === 'holiday') {
			for (const event of events) {
				if (!matchesTitleFilter(event.summary, titleFilter)) continue;
				// Regional holidays: assignments whose pattern matches the event
				// title scope the holiday to those users. No match → nationwide.
				const regionalUsers = findMatchedUsers(
					event.summary,
					normalizedAssignments,
				);
				const dates = expandAbsenceDates(event, rangeStart, rangeEnd);
				if (regionalUsers.length > 0) {
					for (const { date, summary } of dates) {
						const reason = label ? `[${label}] ${summary}` : summary;
						for (const userEmail of regionalUsers) {
							addAbsenceReason(
								userAbsenceDays,
								userEmail,
								date,
								reason,
								'holiday',
							);
						}
					}
				} else {
					for (const { date, summary } of dates) {
						if (!nationwideHolidays.has(date)) {
							const reason = label ? `[${label}] ${summary}` : summary;
							nationwideHolidays.set(date, { reason });
						}
					}
				}
			}
			continue;
		}

		for (const event of events) {
			const matchedUsers =
				absenceAttribution === 'shared'
					? new Set(findMatchedUsers(event.summary, normalizedAssignments))
					: new Set<string>();
			if (
				absenceAttribution === 'self' &&
				normalizedCurrentUser &&
				matchesTitleFilter(event.summary, titleFilter)
			) {
				matchedUsers.add(normalizedCurrentUser);
			}
			if (matchedUsers.size === 0) continue;

			const dates = expandAbsenceDates(event, rangeStart, rangeEnd);
			for (const { date, summary } of dates) {
				const reason = label ? `[${label}] ${summary}` : summary;
				const kind = classifyAbsenceKind(summary);
				for (const userEmail of matchedUsers) {
					addAbsenceReason(userAbsenceDays, userEmail, date, reason, kind);
				}
			}
		}
	}

	// Merge nationwide holiday dates into every known user, plus the current
	// user (so a workspace configured with only a holiday feed still has the
	// current user in the map).
	if (nationwideHolidays.size > 0) {
		const recipients = new Set<string>(userAbsenceDays.keys());
		if (normalizedCurrentUser) recipients.add(normalizedCurrentUser);
		// Include any user that received a regional holiday from the same
		// feed loop above so they pick up nationwide ones too.
		for (const email of userAbsenceDays.keys()) recipients.add(email);
		for (const [date, { reason }] of nationwideHolidays) {
			for (const userEmail of recipients) {
				addAbsenceReason(userAbsenceDays, userEmail, date, reason, 'holiday');
			}
		}
	}

	if (signal?.aborted) {
		return new Map();
	}

	logger.debug(
		`[Absence] ${absenceFeeds.length} absence + ${holidayFeeds.length} holiday feeds → ${userAbsenceDays.size} users with absences in range ${rangeStart}..${rangeEnd}`,
	);

	return userAbsenceDays;
}

/**
 * Fetch absence-type calendar feeds and extract all-day events as absence dates.
 * Returns a Map of date string → AbsenceDay with aggregated reasons.
 */
export async function fetchAbsenceDays(
	feeds: CalendarFeed[],
	assignments: AbsenceAssignment[],
	currentUserEmail: string,
	corsProxy: string,
	rangeStart: string,
	rangeEnd: string,
	signal?: AbortSignal,
): Promise<Map<string, AbsenceDay>> {
	const userAbsenceDays = await fetchAbsenceDaysByUser(
		feeds,
		assignments,
		currentUserEmail,
		corsProxy,
		rangeStart,
		rangeEnd,
		signal,
	);

	return (
		userAbsenceDays.get(currentUserEmail.trim().toLowerCase()) ?? new Map()
	);
}
