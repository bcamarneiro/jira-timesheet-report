#!/usr/bin/env node

/**
 * CORS Proxy Server for Jira Timesheet Report
 *
 * This proxy server adds CORS headers to allow the browser-based
 * Jira Timesheet application to make requests to Jira's API.
 *
 * Usage:
 *   node cors-proxy.js
 *   or
 *   npm run cors-proxy
 *
 * The proxy will run on http://localhost:8081
 * Configure this URL in the app's Settings page under "CORS Proxy"
 */

const corsAnywhere = require('cors-anywhere');

const host = process.env.CORS_PROXY_HOST || 'localhost';
const port = process.env.CORS_PROXY_PORT || 8081;

const proxy = corsAnywhere.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: [], // Don't require any special headers
    // Remove browser-specific headers that trigger SAML/SSO
    removeHeaders: [
        'cookie',
        'cookie2',
        'origin',
        'referer',
        'user-agent',
        'sec-fetch-dest',
        'sec-fetch-mode',
        'sec-fetch-site',
        'sec-ch-ua',
        'sec-ch-ua-mobile',
        'sec-ch-ua-platform'
    ],
    httpProxyOptions: {
        // Increase timeout for large responses
        timeout: 30000,
        // Ignore SSL certificate errors for self-signed certificates
        secure: false
    }
});

// Add request logging
proxy.on('request', (req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
});

// Add error logging
proxy.on('proxyError', (err, req, res) => {
    console.error(`[${new Date().toISOString()}] Proxy Error:`, err.message);
    console.error('Request URL:', req.url);
});

proxy.listen(port, host, () => {
    console.log('\n========================================');
    console.log('🚀 CORS Proxy Server Started');
    console.log('========================================');
    console.log(`\n✓ Running on: http://${host}:${port}`);
    console.log('\n📝 Configuration:');
    console.log(`   - Set CORS Proxy in app settings to: http://${host}:${port}`);
    console.log(`   - Press Ctrl+C to stop the server\n`);
    console.log('========================================\n');
});
