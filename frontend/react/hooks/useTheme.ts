import { useEffect } from 'react';
import { useConfigStore } from '../../stores/useConfigStore';

export function useTheme(): void {
	const theme = useConfigStore((s) => s.config.theme);

	useEffect(() => {
		if (theme === 'light') {
			document.documentElement.setAttribute('data-theme', 'light');
		} else if (theme === 'dark') {
			document.documentElement.setAttribute('data-theme', 'dark');
		} else {
			document.documentElement.removeAttribute('data-theme');
		}
	}, [theme]);
}
