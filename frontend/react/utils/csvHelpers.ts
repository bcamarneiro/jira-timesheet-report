/**
 * Shared CSV-export helpers used by `csv.ts`, `weekCsvExport.ts`, and
 * `teamCsvExport.ts`. These are byte-for-byte exporter primitives; do
 * not change their output without coordinating with the consumers.
 */

export const CSV_SEP = ';';

/**
 * Escape a string for inclusion in a CSV cell:
 *  - normalise newlines to spaces and collapse whitespace,
 *  - trim,
 *  - quote when the value would otherwise split on `;`/`,` or contain
 *    a literal `"`.
 */
export function csvEscape(value: string): string {
	const safe = (value ?? '')
		.replace(/\r?\n|\r/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	if (safe.includes('"') || safe.includes(',') || safe.includes(';')) {
		return `"${safe.replace(/"/g, '""')}"`;
	}
	return safe;
}

export interface CsvProvenance {
	jiraHost?: string;
	sourceVersion?: string;
	generatedAt?: string;
}

export interface ProvenanceFooterOptions {
	policy: 'logged' | 'intended';
	period: string;
	provenance?: CsvProvenance;
	/**
	 * Fallback for missing `jiraHost`. `csv.ts` uses `'unknown'`,
	 * `weekCsvExport` and `teamCsvExport` use `''`.
	 */
	jiraHostFallback?: string;
	/**
	 * Fallback for missing `sourceVersion`. `csv.ts` uses `'dev'`;
	 * the others omit the `version=` field entirely when missing.
	 */
	versionFallback?: string;
	/**
	 * When true and no `sourceVersion` is provided, omit the
	 * `version=...` field rather than emit it with a fallback.
	 */
	omitMissingVersion?: boolean;
}

/**
 * Canonical provenance footer used by all CSV exporters:
 *   # generated=<iso> jira=<host> policy=<policy> period=<period> [version=<v>]
 *
 * Differences between exporters are absorbed via the options:
 * - `csv.ts` passes `jiraHostFallback='unknown'`, `versionFallback='dev'`.
 * - `weekCsvExport`/`teamCsvExport` omit `versionFallback` and instead
 *   set `omitMissingVersion: true` so the field disappears when absent.
 */
export function buildProvenanceFooter(opts: ProvenanceFooterOptions): string {
	const generatedAt = opts.provenance?.generatedAt ?? new Date().toISOString();
	const jiraHost = opts.provenance?.jiraHost ?? opts.jiraHostFallback ?? '';
	const version = opts.provenance?.sourceVersion ?? opts.versionFallback ?? '';
	const parts = [
		`# generated=${generatedAt}`,
		`jira=${jiraHost}`,
		`policy=${opts.policy}`,
		`period=${opts.period}`,
	];
	if (version || !opts.omitMissingVersion) {
		parts.push(`version=${version}`);
	}
	return parts.join(' ');
}
