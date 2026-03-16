#!/usr/bin/env node

/**
 * CORS Proxy Server for Jira Timesheet Report
 *
 * Simple CORS proxy that forwards requests to Jira's API with proper
 * CORS headers. Optionally routes through a SOCKS5 proxy for internal hosts.
 *
 * Usage:
 *   node cors-proxy.js                     # Direct connection
 *   npm run cors-proxy                     # Direct connection
 *   npm run cors-proxy:socks               # Via SOCKS5 proxy
 *
 * The proxy runs on http://localhost:8081
 * Configure this URL in the app's Settings page under "CORS Proxy"
 *
 * Request format:
 *   GET http://localhost:8081/https://jira.example.com/rest/api/2/myself
 *   → proxied to https://jira.example.com/rest/api/2/myself
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const host = process.env.CORS_PROXY_HOST || 'localhost';
const port = process.env.CORS_PROXY_PORT || 8081;
const socksProxy = process.env.SOCKS_PROXY || '';

let socksAgent = null;
if (socksProxy) {
	const { SocksProxyAgent } = require('socks-proxy-agent');
	socksAgent = new SocksProxyAgent(socksProxy);
}

// Headers to strip from browser requests (trigger SAML/SSO)
const REMOVE_HEADERS = new Set([
	'cookie',
	'cookie2',
	'origin',
	'referer',
	'host',
	'sec-fetch-dest',
	'sec-fetch-mode',
	'sec-fetch-site',
	'sec-ch-ua',
	'sec-ch-ua-mobile',
	'sec-ch-ua-platform',
]);

let requestCounter = 0;

function timestamp() {
	return new Date().toISOString();
}

function formatDuration(ms) {
	if (ms < 1000) return `${ms}ms`;
	return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Add CORS headers to a response.
 */
function setCorsHeaders(res, req) {
	res.setHeader('access-control-allow-origin', req.headers.origin || '*');
	res.setHeader(
		'access-control-allow-methods',
		'GET, POST, PUT, DELETE, PATCH, OPTIONS',
	);
	res.setHeader(
		'access-control-allow-headers',
		'Authorization, Content-Type, X-Atlassian-Token, PRIVATE-TOKEN, Accept',
	);
	res.setHeader(
		'access-control-expose-headers',
		'Content-Type, Content-Length',
	);
	res.setHeader('access-control-max-age', '86400');
}

/**
 * Extract the target URL from the proxy request path.
 * e.g. /https://jira.example.com/rest/api/2/myself
 *    → https://jira.example.com/rest/api/2/myself
 */
function extractTargetUrl(reqUrl) {
	// Strip leading slash
	const raw = reqUrl.replace(/^\//, '');
	// Must start with http:// or https://
	if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
		return null;
	}
	return raw;
}

// Known Jira/Atlassian host patterns — get special headers.
// Self-hosted Jira instances are also detected by the x-atlassian-token
// header being present in the original request from the browser.
function isJiraHost(hostname) {
	return (
		hostname.endsWith('.atlassian.net') ||
		hostname.endsWith('.atlassian.com') ||
		hostname.endsWith('.jira.com')
	);
}

function isJiraRequest(targetHost, incomingHeaders) {
	// Atlassian cloud
	if (isJiraHost(targetHost)) return true;
	// Self-hosted: browser sends x-atlassian-token or Authorization for Jira
	if (incomingHeaders['x-atlassian-token']) return true;
	// GitLab: browser sends PRIVATE-TOKEN
	if (incomingHeaders['private-token']) return true;
	return false;
}

/**
 * Build outbound headers: forward from browser but strip problematic ones.
 * Only add Jira-specific headers for Jira/Atlassian/GitLab hosts.
 */
function buildOutboundHeaders(incomingHeaders, targetHost) {
	const headers = {};
	for (const [key, value] of Object.entries(incomingHeaders)) {
		if (!REMOVE_HEADERS.has(key.toLowerCase())) {
			headers[key] = value;
		}
	}
	headers.host = targetHost;

	if (isJiraRequest(targetHost, incomingHeaders)) {
		headers['user-agent'] = 'JiraTimesheetApp/1.0';
		headers['x-atlassian-token'] = 'no-check';
	} else {
		// Generic user-agent for external hosts (Google Drive, calendar feeds, etc.)
		headers['user-agent'] = 'Mozilla/5.0 (compatible; JiraTimesheetApp/1.0)';
		// Remove authorization header — don't leak Jira/GitLab tokens to third parties
		delete headers.authorization;
		delete headers.Authorization;
		delete headers['private-token'];
		delete headers['PRIVATE-TOKEN'];
	}
	return headers;
}

const server = http.createServer((req, res) => {
	const reqId = ++requestCounter;
	const start = Date.now();

	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		setCorsHeaders(res, req);
		res.writeHead(204);
		res.end();
		console.log(
			`[${timestamp()}] #${reqId} OPTIONS preflight → 204 (${formatDuration(Date.now() - start)})`,
		);
		return;
	}

	// Extract target URL
	const targetUrlStr = extractTargetUrl(req.url);
	if (!targetUrlStr) {
		setCorsHeaders(res, req);
		res.writeHead(400, { 'content-type': 'text/plain' });
		res.end('Bad request: URL must start with http:// or https://');
		console.log(`[${timestamp()}] #${reqId} BAD REQUEST: ${req.url}`);
		return;
	}

	let targetUrl;
	try {
		targetUrl = new URL(targetUrlStr);
	} catch {
		setCorsHeaders(res, req);
		res.writeHead(400, { 'content-type': 'text/plain' });
		res.end(`Bad request: Invalid URL: ${targetUrlStr}`);
		console.log(`[${timestamp()}] #${reqId} INVALID URL: ${targetUrlStr}`);
		return;
	}

	const outboundHeaders = buildOutboundHeaders(req.headers, targetUrl.host);

	const authHeader =
		outboundHeaders.authorization || outboundHeaders.Authorization || '';
	const authPreview = authHeader
		? `${String(authHeader).substring(0, 15)}...`
		: 'none';

	console.log(`[${timestamp()}] #${reqId} --> ${req.method} ${targetUrlStr}`);
	console.log(
		`  Auth: ${authPreview} | Agent: ${socksAgent ? 'SocksProxyAgent' : 'default'}`,
	);

	const isHttps = targetUrl.protocol === 'https:';
	const transport = isHttps ? https : http;

	const proxyOpts = {
		hostname: targetUrl.hostname,
		port: targetUrl.port || (isHttps ? 443 : 80),
		path: targetUrl.pathname + targetUrl.search,
		method: req.method,
		headers: outboundHeaders,
		rejectUnauthorized: false, // Allow self-signed certs on internal Jira
	};

	if (socksAgent) {
		proxyOpts.agent = socksAgent;
	}

	/**
	 * Handle a proxy response. Follows redirects for non-Jira hosts (up to 5).
	 */
	function handleProxyResponse(proxyRes, redirectCount) {
		const duration = formatDuration(Date.now() - start);
		const status = proxyRes.statusCode;
		const statusTag = status >= 400 ? 'ERR' : 'OK';

		console.log(
			`[${timestamp()}] #${reqId} <-- ${status} ${statusTag} (${duration})`,
		);

		const logHeaders = {};
		for (const key of [
			'content-type',
			'server',
			'x-seraph-loginreason',
			'www-authenticate',
			'location',
		]) {
			if (proxyRes.headers[key]) logHeaders[key] = proxyRes.headers[key];
		}
		if (Object.keys(logHeaders).length > 0) {
			console.log(`  Response headers: ${JSON.stringify(logHeaders)}`);
		}

		// Follow redirects for non-Jira hosts (Google Drive, calendar feeds, etc.)
		if (
			[301, 302, 303, 307, 308].includes(status) &&
			proxyRes.headers.location &&
			redirectCount < 5 &&
			!isJiraHost(targetUrl.hostname)
		) {
			const redirectUrl = new URL(proxyRes.headers.location, targetUrl.href);
			console.log(
				`[${timestamp()}] #${reqId}  -> Following redirect to ${redirectUrl.href}`,
			);
			// Drain the current response
			proxyRes.resume();

			const redirectTransport =
				redirectUrl.protocol === 'https:' ? https : http;
			const redirectOpts = {
				hostname: redirectUrl.hostname,
				port:
					redirectUrl.port || (redirectUrl.protocol === 'https:' ? 443 : 80),
				path: redirectUrl.pathname + redirectUrl.search,
				method: status === 303 ? 'GET' : req.method,
				headers: buildOutboundHeaders(req.headers, redirectUrl.host),
				rejectUnauthorized: false,
			};
			if (socksAgent) redirectOpts.agent = socksAgent;

			const redirectReq = redirectTransport.request(
				redirectOpts,
				(redirectRes) => handleProxyResponse(redirectRes, redirectCount + 1),
			);
			redirectReq.on('error', (err) => {
				console.error(
					`[${timestamp()}] #${reqId} <-- REDIRECT ERROR: ${err.message}`,
				);
				if (!res.headersSent) {
					setCorsHeaders(res, req);
					res.writeHead(502, { 'content-type': 'text/plain' });
				}
				if (!res.writableEnded) {
					res.end(`Proxy redirect error: ${err.message}`);
				}
			});
			redirectReq.end();
			return;
		}

		// Forward status + headers with CORS
		setCorsHeaders(res, req);
		// Forward content-type and other relevant response headers
		for (const [key, value] of Object.entries(proxyRes.headers)) {
			// Don't forward hop-by-hop headers
			if (
				!['connection', 'keep-alive', 'transfer-encoding'].includes(
					key.toLowerCase(),
				)
			) {
				try {
					res.setHeader(key, value);
				} catch (_) {
					// Skip headers that conflict with CORS headers we already set
				}
			}
		}
		res.writeHead(proxyRes.statusCode);

		// Pipe response body
		proxyRes.pipe(res);
	}

	const proxyReq = transport.request(proxyOpts, (proxyRes) =>
		handleProxyResponse(proxyRes, 0),
	);

	proxyReq.on('error', (err) => {
		const duration = formatDuration(Date.now() - start);
		console.error(`[${timestamp()}] #${reqId} <-- ERROR (${duration})`);
		console.error(`  Message: ${err.message}`);
		console.error(`  Code: ${err.code || 'none'}`);

		if (!res.headersSent) {
			setCorsHeaders(res, req);
			res.writeHead(502, { 'content-type': 'text/plain' });
		}
		if (!res.writableEnded) {
			res.end(`Proxy error: ${err.message}`);
		}
	});

	proxyReq.setTimeout(30000, () => {
		console.error(`[${timestamp()}] #${reqId} <-- TIMEOUT (30s)`);
		proxyReq.destroy();

		if (!res.headersSent) {
			setCorsHeaders(res, req);
			res.writeHead(504, { 'content-type': 'text/plain' });
		}
		if (!res.writableEnded) {
			res.end('Proxy timeout after 30s');
		}
	});

	// Pipe request body (for POST/PUT)
	req.pipe(proxyReq);
});

server.listen(port, host, () => {
	console.log('\n========================================');
	console.log('  CORS Proxy Server Started');
	console.log('========================================');
	console.log(`\n  Running on: http://${host}:${port}`);
	console.log(`  SOCKS proxy: ${socksProxy || 'none (direct)'}`);
	console.log('\n  Configuration:');
	console.log(`   - Set CORS Proxy in app settings to: http://${host}:${port}`);
	if (!socksProxy) {
		console.log(
			'   - Set SOCKS_PROXY=socks5h://127.0.0.1:8080 to route through SOCKS5',
		);
	}
	console.log(`   - Press Ctrl+C to stop the server\n`);
	console.log('========================================\n');
});
