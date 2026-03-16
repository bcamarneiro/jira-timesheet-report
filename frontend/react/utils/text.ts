export function truncate(text: string, length = 20): string {
	if (!text) return '';
	return text.length > length ? `${text.substring(0, length)}…` : text;
}

export function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}
	return name.slice(0, 2).toUpperCase();
}
