const SIMPLE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function splitWhitespaceJoinedSegment(segment: string): string[] {
	const trimmed = segment.trim();
	if (!trimmed) return [];

	const parts = trimmed.split(/\s+/).filter(Boolean);
	if (parts.length > 1 && parts.every((part) => part.includes('@'))) {
		return parts;
	}

	return [trimmed];
}

export function normalizeEmailEntry(value: string): string {
	return value.trim().toLowerCase();
}

export function isValidEmailEntry(value: string): boolean {
	return SIMPLE_EMAIL_REGEX.test(normalizeEmailEntry(value));
}

export function splitEmailEntries(value: string): string[] {
	return value
		.split(/[\n,;\t]+/)
		.flatMap(splitWhitespaceJoinedSegment)
		.map(normalizeEmailEntry)
		.filter(Boolean);
}

export function formatEmailEntries(entries: string[]): string {
	return entries.join(', ');
}

export function uniqueEmailEntries(entries: string[]): string[] {
	const seen = new Set<string>();
	const result: string[] = [];

	for (const entry of entries) {
		const normalized = normalizeEmailEntry(entry);
		if (!normalized || seen.has(normalized)) continue;
		seen.add(normalized);
		result.push(normalized);
	}

	return result;
}

export function splitCsvEmailList(value: string): string[] {
	return uniqueEmailEntries(splitEmailEntries(value));
}
