import { describe, expect, it } from 'vitest';
import {
	classifyHttpStatus,
	fromHttpResponse,
	fromNetworkError,
	fromRichMessage,
	ServiceError,
} from '../serviceErrors';

describe('classifyHttpStatus', () => {
	it('maps known statuses to the canonical kind', () => {
		expect(classifyHttpStatus(401)).toBe('unauthorized');
		expect(classifyHttpStatus(403)).toBe('forbidden');
		expect(classifyHttpStatus(404)).toBe('not-found');
		expect(classifyHttpStatus(429)).toBe('rate-limited');
		expect(classifyHttpStatus(500)).toBe('server-error');
		expect(classifyHttpStatus(502)).toBe('server-error');
	});

	it('returns "unknown" for unrecognised statuses', () => {
		expect(classifyHttpStatus(418)).toBe('unknown');
		expect(classifyHttpStatus(0)).toBe('unknown');
	});
});

describe('fromHttpResponse', () => {
	it('wraps a status in a ServiceError with kind/status/source', () => {
		const err = fromHttpResponse('Jira search', 401);
		expect(err).toBeInstanceOf(ServiceError);
		expect(err.kind).toBe('unauthorized');
		expect(err.status).toBe(401);
		expect(err.source).toBe('Jira search');
		expect(err.message).toContain('Jira search');
		expect(err.message).toContain('HTTP 401');
	});

	it('appends optional context when supplied', () => {
		const err = fromHttpResponse('Calendar feed', 503, 'host=cal.example.com');
		expect(err.message).toContain('host=cal.example.com');
	});
});

describe('fromRichMessage', () => {
	it('derives kind from status and preserves the message verbatim', () => {
		const err = fromRichMessage('GitLab', 401, 'Token expired — sign in again');
		expect(err).toBeInstanceOf(ServiceError);
		expect(err.kind).toBe('unauthorized');
		expect(err.status).toBe(401);
		expect(err.source).toBe('GitLab');
		expect(err.message).toBe('Token expired — sign in again');
	});

	it('falls back to "unknown" kind when status is missing', () => {
		const err = fromRichMessage('GitLab', undefined, 'TLS handshake failed');
		expect(err.kind).toBe('unknown');
		expect(err.status).toBeUndefined();
		expect(err.message).toBe('TLS handshake failed');
	});
});

describe('fromNetworkError', () => {
	it('wraps a thrown Error with the source label', () => {
		const err = fromNetworkError('GitLab', new Error('TLS handshake failed'));
		expect(err.kind).toBe('network');
		expect(err.message).toContain('GitLab');
		expect(err.message).toContain('TLS handshake failed');
	});

	it('coerces non-Error inputs to a string', () => {
		const err = fromNetworkError('Anywhere', 'plain string');
		expect(err.message).toContain('plain string');
	});
});
