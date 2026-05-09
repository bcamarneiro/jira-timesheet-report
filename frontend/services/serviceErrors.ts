/**
 * Canonical error format for HTTP-backed services.
 *
 * Today each service throws its own ad-hoc string ("Jira search error: 401",
 * "Jira API error: 401", "Calendar feed error: 503"). UI error mappers
 * have to special-case all of them. This helper produces a stable shape
 * so callers can `instanceof ServiceError` and read `.code` / `.status`
 * directly.
 *
 * Existing throw sites are migrated incrementally — old string-only errors
 * still work because `ServiceError` extends `Error` with the same
 * `message` field, and `parseServiceError(unknown)` extracts the status
 * from legacy strings as a fallback.
 */
export type ServiceErrorKind =
	| 'unauthorized'
	| 'forbidden'
	| 'not-found'
	| 'rate-limited'
	| 'server-error'
	| 'network'
	| 'invalid-token'
	| 'unknown';

export class ServiceError extends Error {
	readonly kind: ServiceErrorKind;
	readonly status?: number;
	readonly source: string;

	constructor(opts: {
		kind: ServiceErrorKind;
		status?: number;
		source: string;
		message: string;
	}) {
		super(opts.message);
		this.name = 'ServiceError';
		this.kind = opts.kind;
		this.status = opts.status;
		this.source = opts.source;
	}
}

export function classifyHttpStatus(status: number): ServiceErrorKind {
	if (status === 401) return 'unauthorized';
	if (status === 403) return 'forbidden';
	if (status === 404) return 'not-found';
	if (status === 429) return 'rate-limited';
	if (status >= 500) return 'server-error';
	return 'unknown';
}

export function fromHttpResponse(
	source: string,
	status: number,
	context = '',
): ServiceError {
	const kind = classifyHttpStatus(status);
	const tail = context ? ` — ${context}` : '';
	return new ServiceError({
		kind,
		status,
		source,
		message: `${source} ${kind} (HTTP ${status})${tail}`,
	});
}

export function fromNetworkError(source: string, error: unknown): ServiceError {
	const inner = error instanceof Error ? error.message : String(error);
	return new ServiceError({
		kind: 'network',
		source,
		message: `${source} network error: ${inner}`,
	});
}
