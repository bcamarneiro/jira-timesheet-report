import { useEffect } from 'react';

/**
 * Sets `document.title` for the lifetime of the calling component, formatted
 * as `"<title> — Hoursmith"`. Restores the previous title on unmount so
 * navigating away doesn't leave a stale tab label.
 *
 * Used by every routed page. The base index.html title is the fallback for
 * routes that forget to set their own.
 */
export function usePageTitle(title: string): void {
	useEffect(() => {
		const previous = document.title;
		document.title = `${title} — Hoursmith`;
		return () => {
			document.title = previous;
		};
	}, [title]);
}
