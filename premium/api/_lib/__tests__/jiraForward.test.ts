import { describe, expect, it } from 'vitest';
import { validateJiraBase } from '../jiraForward';

describe('validateJiraBase — SSRF allowlist (ADA-296)', () => {
	it('accepts a *.atlassian.net Jira Cloud site', () => {
		const r = validateJiraBase('https://example.atlassian.net');
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.url.hostname).toBe('example.atlassian.net');
	});

	it('accepts a site with a path and query', () => {
		const r = validateJiraBase(
			'https://team.atlassian.net/rest/api/2/myself?x=1',
		);
		expect(r.ok).toBe(true);
	});

	it.each([
		['loopback hostname', 'http://localhost'],
		['AWS metadata IP', 'http://169.254.169.254/latest/meta-data/'],
		['RFC-1918 private IP', 'http://10.0.0.5'],
		['link-local IPv6', 'http://[fe80::1]'],
		['bare apex (no subdomain)', 'https://atlassian.net'],
		['look-alike suffix', 'https://evil-atlassian.net'],
		['suffix as a label, not the host', 'https://atlassian.net.evil.com'],
		[
			'real host is non-Atlassian (userinfo trick)',
			'https://x.atlassian.net@evil.com',
		],
		['arbitrary external host', 'https://example.com'],
	])('rejects %s', (_label, base) => {
		const r = validateJiraBase(base);
		expect(r.ok).toBe(false);
	});

	it('rejects a missing header', () => {
		expect(validateJiraBase(undefined).ok).toBe(false);
		expect(validateJiraBase('').ok).toBe(false);
	});

	it('rejects a non-URL value', () => {
		expect(validateJiraBase('not a url').ok).toBe(false);
	});

	it('rejects non-http(s) protocols', () => {
		expect(validateJiraBase('ftp://example.atlassian.net').ok).toBe(false);
	});
});
