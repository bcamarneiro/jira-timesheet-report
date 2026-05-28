import { useEffect, useState } from 'react';
import * as styles from './BuildInfoFooter.module.css';

/**
 * Tiny build-info chip in the bottom-right corner.
 *
 * Lets a paying customer (or future-Bruno) match what they're seeing on screen
 * to an exact deploy: `v1.0.0 · abc1234 · prod`. Fetches `/api/version` once
 * on mount; silently hides if the endpoint isn't available (free-tier builds
 * deployed to static hosts have no `/api`).
 *
 * Non-production envs (`preview` / `development`) are colour-tagged so it's
 * obvious you're not looking at the live site.
 */

interface VersionInfo {
	version: string;
	shaShort: string;
	branch: string;
	env: string;
}

export function BuildInfoFooter(): JSX.Element | null {
	const [info, setInfo] = useState<VersionInfo | null>(null);

	useEffect(() => {
		let cancelled = false;
		fetch('/api/version', { cache: 'no-store' })
			.then((res) => (res.ok ? res.json() : null))
			.then((data: VersionInfo | null) => {
				if (!cancelled && data) setInfo(data);
			})
			.catch(() => {
				/* free-tier / no /api — hide silently */
			});
		return () => {
			cancelled = true;
		};
	}, []);

	if (!info) return null;

	const envClass =
		info.env === 'production'
			? styles.envProd
			: info.env === 'preview'
				? styles.envPreview
				: styles.envDev;

	return (
		<div className={styles.footer}>
			<span className={styles.version}>v{info.version}</span>
			<span className={styles.sep}>·</span>
			<span className={styles.sha} title={info.branch}>
				{info.shaShort}
			</span>
			<span className={styles.sep}>·</span>
			<span className={`${styles.env} ${envClass}`}>{info.env}</span>
		</div>
	);
}
