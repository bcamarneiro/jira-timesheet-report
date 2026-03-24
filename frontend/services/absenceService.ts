import type { CalendarFeed } from '../stores/useConfigStore';
import { logger } from '../react/utils/logger';

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
			const iso = cursor.toISOString().slice(0, 10);
			if (iso >= rangeStart && iso <= rangeEnd && !exdateSet.has(iso)) {
				// Skip weekends
				const dow = cursor.getDay();
				if (dow !== 0 && dow !== 6) {
					results.push({ date: iso, summary: event.summary });
				}
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
		const iso = d.toISOString().slice(0, 10);
		if (d >= rangeStartDate && d <= rangeEndDate && !exdateSet.has(iso)) {
			const dow = d.getDay();
			if (dow !== 0 && dow !== 6) {
				results.push({ date: iso, summary: event.summary });
			}
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
}

/**
 * Fetch absence-type calendar feeds and extract all-day events as absence dates.
 * Returns a Map of date string → AbsenceDay with aggregated reasons.
 */
export async function fetchAbsenceDays(
	feeds: CalendarFeed[],
	corsProxy: string,
	rangeStart: string,
	rangeEnd: string,
	signal?: AbortSignal,
): Promise<Map<string, AbsenceDay>> {
	const absenceFeeds = feeds.filter(
		(f) => f.type === 'absence' && f.url.trim(),
	);
	if (absenceFeeds.length === 0) return new Map();

	const results = await Promise.allSettled(
		absenceFeeds.map(async (feed) => {
			const url = corsProxy
				? `${corsProxy.replace(/\/$/, '')}/${feed.url}`
				: feed.url;
			const res = await fetch(url, { signal });
			if (!res.ok) throw new Error(`Feed error: ${res.status}`);
			const text = await res.text();
			return { label: feed.label, events: parseAbsenceEvents(text) };
		}),
	);

	const absenceMap = new Map<string, AbsenceDay>();

	for (const result of results) {
		if (result.status !== 'fulfilled') {
			logger.warn('[Absence] Feed failed:', result.reason);
			continue;
		}

		const { label, events } = result.value;
		for (const event of events) {
			const dates = expandAbsenceDates(event, rangeStart, rangeEnd);
			for (const { date, summary } of dates) {
				const existing = absenceMap.get(date);
				const reason = label ? `[${label}] ${summary}` : summary;
				if (existing) {
					existing.reasons.push(reason);
				} else {
					absenceMap.set(date, { date, reasons: [reason] });
				}
			}
		}
	}

	logger.debug(
		`[Absence] ${absenceFeeds.length} feeds → ${absenceMap.size} absence days in range ${rangeStart}..${rangeEnd}`,
	);

	return absenceMap;
}
