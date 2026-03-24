export function sanitizeFilename(filename: string): string {
	return filename
		.trim()
		.replace(/[/\\?%*:|"<>]/g, '-')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

export function downloadAsFile(
	content: string,
	filename: string,
	mimeType: string,
): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = sanitizeFilename(filename);
	anchor.style.display = 'none';
	document.body.appendChild(anchor);
	try {
		anchor.click();
	} finally {
		document.body.removeChild(anchor);
		URL.revokeObjectURL(url);
	}
}
