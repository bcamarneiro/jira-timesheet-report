import type { JiraWorklog } from '../../../types/jira';

export type BackdateSource = 'none' | 'comment' | 'jira-native';

export interface ClassifiedWorklog {
	loggedOn: string;
	intendedFor: string;
	daysLate: number;
	isBackdated: boolean;
	source: BackdateSource;
	originalComment: string;
}

export interface ClassifierOptions {
	commentPatterns?: RegExp[];
	thresholdDays?: number;
}

export const DEFAULT_BACKDATE_PATTERNS: RegExp[] = [
	/Original Worklog Date was:\s*(\d{4})[/-](\d{2})[/-](\d{2})/i,
	/Originally\s+(?:logged|worked)\s+on:?\s*(\d{4})[/-](\d{2})[/-](\d{2})/i,
];

export const DEFAULT_THRESHOLD_DAYS = 1;

const MS_PER_DAY = 86_400_000;

function extractCommentText(
	comment: string | Record<string, unknown> | undefined,
): string {
	if (!comment) return '';
	if (typeof comment === 'string') return comment;
	if (typeof comment === 'object') {
		try {
			return JSON.stringify(comment);
		} catch {
			return '';
		}
	}
	return '';
}

function toIsoDay(input: string | undefined): string {
	if (!input) return '';
	const slice = input.slice(0, 10);
	if (/^\d{4}-\d{2}-\d{2}$/.test(slice)) return slice;
	const parsed = new Date(input);
	if (Number.isNaN(parsed.getTime())) return '';
	return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
}

function parseCommentMarker(
	commentText: string,
	patterns: RegExp[],
): string | null {
	for (const pattern of patterns) {
		const match = commentText.match(pattern);
		if (match && match[1] && match[2] && match[3]) {
			const iso = `${match[1]}-${match[2]}-${match[3]}`;
			if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
		}
	}
	return null;
}

function calendarDaysBetween(fromIso: string, toIso: string): number {
	if (!fromIso || !toIso) return 0;
	const from = Date.parse(`${fromIso}T00:00:00Z`);
	const to = Date.parse(`${toIso}T00:00:00Z`);
	if (Number.isNaN(from) || Number.isNaN(to)) return 0;
	return Math.round((to - from) / MS_PER_DAY);
}

export function classifyWorklog(
	worklog: Pick<JiraWorklog, 'started' | 'created' | 'comment'>,
	options: ClassifierOptions = {},
): ClassifiedWorklog {
	const patterns = options.commentPatterns ?? DEFAULT_BACKDATE_PATTERNS;
	const threshold = options.thresholdDays ?? DEFAULT_THRESHOLD_DAYS;

	const commentText = extractCommentText(worklog.comment);
	const startedIso = toIsoDay(worklog.started);
	const createdIso = toIsoDay(worklog.created);

	const commentIntended = parseCommentMarker(commentText, patterns);

	let source: BackdateSource = 'none';
	let loggedOn = startedIso || createdIso;
	let intendedFor = startedIso || createdIso;

	if (commentIntended) {
		source = 'comment';
		intendedFor = commentIntended;
		loggedOn = startedIso || createdIso || commentIntended;
	} else if (
		startedIso &&
		createdIso &&
		createdIso > startedIso &&
		createdIso.slice(0, 7) !== startedIso.slice(0, 7)
	) {
		source = 'jira-native';
		intendedFor = startedIso;
		loggedOn = createdIso;
	}

	const daysLate = Math.max(0, calendarDaysBetween(intendedFor, loggedOn));
	const isBackdated = source !== 'none' && daysLate >= threshold;

	return {
		loggedOn,
		intendedFor,
		daysLate,
		isBackdated,
		source,
		originalComment: commentText,
	};
}
