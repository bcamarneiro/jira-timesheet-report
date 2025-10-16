export function truncate(text: string, length = 20): string {
	if (!text) return "";
	return text.length > length ? `${text.substring(0, length)}…` : text;
}
