export type FreshnessTone = 'idle' | 'fresh' | 'warning' | 'stale';

export type FreshnessState = {
	label: string;
	detail: string;
	tone: FreshnessTone;
};

type Options = {
	now?: Date;
	agingAfterMinutes?: number;
	staleAfterMinutes?: number;
};

function formatRelativeAge(minutes: number): string {
	if (minutes <= 0) return 'just now';
	if (minutes === 1) return '1 minute ago';
	if (minutes < 60) return `${minutes} minutes ago`;

	const hours = Math.floor(minutes / 60);
	if (hours === 1) return '1 hour ago';
	if (hours < 24) return `${hours} hours ago`;

	const days = Math.floor(hours / 24);
	return days === 1 ? '1 day ago' : `${days} days ago`;
}

function formatClockTime(date: Date): string {
	return date.toLocaleTimeString(undefined, {
		hour: '2-digit',
		minute: '2-digit',
	});
}

export function describeFreshness(
	value: string | number | Date | null | undefined,
	options?: Options,
): FreshnessState {
	if (!value) {
		return {
			label: 'No successful sync yet',
			detail: 'This view has not completed a successful sync yet.',
			tone: 'idle',
		};
	}

	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) {
		return {
			label: 'No successful sync yet',
			detail: 'The last sync timestamp could not be read.',
			tone: 'idle',
		};
	}

	const now = options?.now ?? new Date();
	const agingAfterMinutes = options?.agingAfterMinutes ?? 15;
	const staleAfterMinutes = options?.staleAfterMinutes ?? 60;
	const diffMinutes = Math.max(
		0,
		Math.floor((now.getTime() - date.getTime()) / 60_000),
	);
	const relativeAge = formatRelativeAge(diffMinutes);
	const label = `Synced ${formatClockTime(date)}`;

	if (diffMinutes >= staleAfterMinutes) {
		return {
			label: `${label} · stale`,
			detail: `Last successful sync was ${relativeAge}.`,
			tone: 'stale',
		};
	}

	if (diffMinutes >= agingAfterMinutes) {
		return {
			label,
			detail: `Last successful sync was ${relativeAge}.`,
			tone: 'warning',
		};
	}

	return {
		label,
		detail: `Last successful sync was ${relativeAge}.`,
		tone: 'fresh',
	};
}
