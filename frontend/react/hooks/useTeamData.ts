import { useMemo } from 'react';
import type { WorklogItem } from '../../services/monthWorklogService';
import type { TeamMemberSummary } from '../../services/teamService';
import { useConfigStore } from '../../stores/useConfigStore';
import { useMonthWorklogs } from './useMonthWorklogs';

const SECONDS_PER_DAY = 28800; // 8h

function toDateStr(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function isWeekday(dateStr: string): boolean {
	const d = new Date(dateStr);
	const day = d.getDay();
	return day !== 0 && day !== 6;
}

function getWeekdaysBetween(start: string, end: string): string[] {
	const days: string[] = [];
	const current = new Date(start);
	const last = new Date(end);
	while (current <= last) {
		const dateStr = toDateStr(current);
		if (isWeekday(dateStr)) {
			days.push(dateStr);
		}
		current.setDate(current.getDate() + 1);
	}
	return days;
}

function deriveTeamSummaries(
	worklogs: WorklogItem[],
	weekStart: string,
	weekEnd: string,
	allowedUsers: string,
): TeamMemberSummary[] {
	// Parse allowed users filter
	const allowedSet = allowedUsers
		? new Set(
				allowedUsers
					.split(',')
					.map((e) => e.trim().toLowerCase())
					.filter(Boolean),
			)
		: null;

	// Group worklogs by author email
	const memberMap = new Map<
		string,
		{ displayName: string; dailySeconds: Map<string, number> }
	>();

	for (const wl of worklogs) {
		const email = wl.author?.emailAddress?.toLowerCase();
		if (!email) continue;
		if (allowedSet && !allowedSet.has(email)) continue;

		const day = (wl.started ?? '').slice(0, 10);
		if (day < weekStart || day > weekEnd) continue;

		let member = memberMap.get(email);
		if (!member) {
			member = {
				displayName: wl.author?.displayName || email,
				dailySeconds: new Map(),
			};
			memberMap.set(email, member);
		}

		const existing = member.dailySeconds.get(day) || 0;
		member.dailySeconds.set(day, existing + (wl.timeSpentSeconds ?? 0));
	}

	// Ensure all allowed users appear even with zero hours
	if (allowedSet) {
		for (const email of allowedSet) {
			if (!memberMap.has(email)) {
				memberMap.set(email, {
					displayName: email,
					dailySeconds: new Map(),
				});
			}
		}
	}

	// Cap target at today for current/future weeks
	const today = toDateStr(new Date());
	const effectiveEnd = weekEnd > today ? today : weekEnd;
	const weekdays = getWeekdaysBetween(weekStart, weekEnd);
	const targetWeekdays = getWeekdaysBetween(weekStart, effectiveEnd);
	const targetSeconds = targetWeekdays.length * SECONDS_PER_DAY;

	const summaries: TeamMemberSummary[] = [];

	for (const [email, member] of memberMap) {
		const dailyHours = new Map<string, number>();
		let totalSeconds = 0;

		for (const day of weekdays) {
			const seconds = member.dailySeconds.get(day) || 0;
			dailyHours.set(day, seconds / 3600);
			totalSeconds += seconds;
		}

		summaries.push({
			email,
			displayName: member.displayName,
			dailyHours,
			totalSeconds,
			targetSeconds,
			gapSeconds: Math.max(0, targetSeconds - totalSeconds),
		});
	}

	summaries.sort((a, b) => a.displayName.localeCompare(b.displayName));
	return summaries;
}

export function useTeamData(weekStart: string, weekEnd: string) {
	const config = useConfigStore((s) => s.config);

	// Determine which month(s) the week spans
	const [startYear, startMonthStr] = weekStart.split('-').map(Number);
	const [endYear, endMonthStr] = weekEnd.split('-').map(Number);
	const startMonth = startMonthStr - 1;
	const endMonth = endMonthStr - 1;
	const spansMonths = startYear !== endYear || startMonth !== endMonth;

	// Primary month query (no prefetch — team page navigates by week, not month)
	const month1 = useMonthWorklogs(startYear, startMonth);

	// Second month query (only when week spans two months)
	const month2 = useMonthWorklogs(endYear, endMonth, {
		enabled: spansMonths,
	});

	const isLoading = month1.isLoading || (spansMonths && month2.isLoading);
	const error = month1.error || month2.error;

	const teamMembers = useMemo(() => {
		const allWorklogs = [
			...(month1.data ?? []),
			...(spansMonths ? (month2.data ?? []) : []),
		];
		if (allWorklogs.length === 0 && !isLoading) return [];
		if (allWorklogs.length === 0) return [];

		return deriveTeamSummaries(
			allWorklogs,
			weekStart,
			weekEnd,
			config.allowedUsers,
		);
	}, [
		month1.data,
		month2.data,
		spansMonths,
		weekStart,
		weekEnd,
		config.allowedUsers,
		isLoading,
	]);

	return { data: teamMembers, isLoading, error };
}
