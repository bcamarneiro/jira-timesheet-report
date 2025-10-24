# CORS Proxy Guide

This guide explains how to test and configure CORS proxy functionality for the Jira Timesheet Report application.

## Quick Reference

**To get started immediately:**

```bash
bun install           # Install dependencies
bun run cors-proxy    # Start CORS proxy on http://localhost:8081
```

Then in the app settings, set **CORS Proxy** to: `http://localhost:8081`

**Alternative methods:**

- Docker: `bun run cors-proxy:docker`
- Docker Compose: `bun run cors-proxy:compose`

---

## Table of Contents
1. [Understanding CORS and Why a Proxy is Needed](#understanding-cors-and-why-a-proxy-is-needed)
2. [How CORS Proxy Works in This App](#how-cors-proxy-works-in-this-app)
3. [Testing the CORS Functionality](#testing-the-cors-functionality)
4. [Running a Local CORS Proxy](#running-a-local-cors-proxy)
5. [Public CORS Proxy Options](#public-cors-proxy-options)
6. [Troubleshooting](#troubleshooting)

---

## Understanding CORS and Why a Proxy is Needed

**What is CORS?**
Cross-Origin Resource Sharing (CORS) is a browser security feature that blocks web pages from making requests to a different domain than the one serving the page.

**Why does this app need a CORS proxy?**
- This is a **client-side only** application that runs entirely in your browser
- It needs to make API calls directly to Jira's servers from the browser
- Most Jira instances don't allow direct browser access due to CORS policies
- A CORS proxy acts as an intermediary that adds the necessary CORS headers

**When do you need a CORS proxy?**
- ✅ **Need proxy**: If you see CORS errors in the browser console when testing the connection
- ❌ **Don't need proxy**: If your Jira instance allows direct browser access (rare)
- ✅ **Need proxy**: For production use of this client-side app

---

## How CORS Proxy Works in This App

### Implementation Details

The CORS proxy is implemented in two key files:

1. **[frontend/stores/useJiraClientStore.ts](frontend/stores/useJiraClientStore.ts)** - Lines 25-27
   ```typescript
   const host = config.corsProxy
       ? `${config.corsProxy.replace(/\/$/, '')}/https://${config.jiraHost}`
       : `https://${config.jiraHost}`;
   ```

2. **[frontend/stores/useSettingsFormStore.ts](frontend/stores/useSettingsFormStore.ts)** - Lines 61-63
   ```typescript
   const host = formData.corsProxy
       ? `${formData.corsProxy.replace(/\/$/, '')}/https://${formData.jiraHost}`
       : `https://${formData.jiraHost}`;
   ```

### URL Format

When a CORS proxy is configured, requests are formatted as:
```
{corsProxyUrl}/https://{jiraHost}
```

**Example:**
- Jira Host: `yourcompany.atlassian.net`
- CORS Proxy: `http://localhost:8080`
- Final URL: `http://localhost:8080/https://yourcompany.atlassian.net`

---

## Testing the CORS Functionality

### Test 1: Without CORS Proxy (Expected to Fail)

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app at `http://localhost:8080` (or your configured port)

3. Navigate to **Settings**

4. Fill in your Jira credentials:
   - **Jira Host**: `yourcompany.atlassian.net`
   - **Email**: `your-email@example.com`
   - **API Token**: Your Jira API token
   - **CORS Proxy**: Leave this **empty**

5. Click **Test Connection**

6. Open browser DevTools (F12) → Console tab

7. **Expected Result**: You should see a CORS error like:
   ```
   Access to fetch at 'https://yourcompany.atlassian.net/rest/api/3/myself'
   from origin 'http://localhost:8080' has been blocked by CORS policy
   ```

### Test 2: With Local CORS Proxy (Should Succeed)

1. Start a local CORS proxy (see [Running a Local CORS Proxy](#running-a-local-cors-proxy))

2. In the Settings page, update:
   - **CORS Proxy**: `http://localhost:8081` (or your proxy's URL)

3. Click **Test Connection**

4. **Expected Result**: You should see:
   - Success message: `Connection successful! Hello, [Your Name].`
   - Green checkmark in the UI
   - No CORS errors in the console

### Test 3: Full Workflow Test

1. With CORS proxy configured, save the settings

2. Navigate to the main **Timesheet** page

3. Select a date range

4. **Expected Result**:
   - Timesheet data loads successfully
   - No CORS errors in console
   - Worklog entries appear in the grid

---

## Running a Local CORS Proxy

### Option 1: Using bun Scripts (Recommended - Easiest)

This project includes built-in scripts to run a CORS proxy server.

#### Quick Start

```bash
# Install dependencies (if not already done)
bun install

# Run the CORS proxy server
bun run cors-proxy
```

The proxy will start on `http://localhost:8081`

#### Available Scripts

| Command | Description |
|---------|-------------|
| `bun run cors-proxy` | Run Node.js CORS proxy locally |
| `bun run cors-proxy:docker` | Start CORS proxy in Docker container |
| `bun run cors-proxy:docker:stop` | Stop Docker container |
| `bun run cors-proxy:compose` | Start CORS proxy with Docker Compose |
| `bun run cors-proxy:compose:stop` | Stop Docker Compose services |

#### What's included

- **[cors-proxy.js](cors-proxy.js)** - Standalone Node.js CORS proxy server
- **[docker-compose.cors.yml](docker-compose.cors.yml)** - Docker Compose configuration
- **[package.json](package.json)** - bun scripts for easy execution

#### Configure in the app

1. Start the proxy: `bun run cors-proxy`
2. In your Jira Timesheet settings:
   - **CORS Proxy**: `http://localhost:8081`

That's it! The proxy is now forwarding requests with CORS headers.

---

### Option 2: Docker Container

If you prefer Docker, you can run cors-anywhere in a container.

#### Using Docker Run

```bash
docker run -d \
  --name cors-proxy \
  -p 8081:8080 \
  redocly/cors-anywhere
```

Or use the included bun script:
```bash
bun run cors-proxy:docker
```

To stop the container:
```bash
bun run cors-proxy:docker:stop
```

#### Using Docker Compose

Create a `docker-compose.cors.yml` file (included in this project):

```yaml
version: '3.8'
services:
  cors-proxy:
    image: redocly/cors-anywhere
    ports:
      - "8081:8080"
    environment:
      - CORSANYWHERE_WHITELIST=
    restart: unless-stopped
```

Run it:
```bash
docker-compose -f docker-compose.cors.yml up -d
```

Or use the bun script:
```bash
bun run cors-proxy:compose
```

To stop:
```bash
bun run cors-proxy:compose:stop
```

#### Configure in the app

In your Jira Timesheet settings:
- **CORS Proxy**: `http://localhost:8081`

---

## Public CORS Proxy Options

### ⚠️ Warning: Security Considerations

Public CORS proxies should **NEVER** be used for production or with sensitive data. Your API credentials and data will pass through third-party servers.

### Options (for testing only)

1. **cors-anywhere (Heroku)** - Often rate-limited or down
   ```
   https://cors-anywhere.herokuapp.com/
   ```

2. **allOrigins**
   ```
   https://api.allorigins.win/raw?url=
   ```
   Note: This has a different URL format than the app expects

3. **CORS Proxy**
   ```
   https://corsproxy.io/?
   ```
   Note: This has a different URL format than the app expects

### Why you should avoid public proxies:

- ❌ Your Jira API tokens pass through their servers
- ❌ All your timesheet data is visible to the proxy operator
- ❌ Rate limits and reliability issues
- ❌ Privacy and compliance concerns
- ❌ Service may shut down or change at any time

### Recommendation

**Always use a self-hosted CORS proxy** for:
- ✅ Production environments
- ✅ Handling real company data
- ✅ Ensuring privacy and security
- ✅ Reliable performance

---

## Troubleshooting

### Problem: CORS errors even with proxy configured

**Check:**
1. Is the CORS proxy actually running?
   ```bash
   curl http://localhost:8081/https://yourcompany.atlassian.net
   ```

2. Is the proxy URL correct in settings?
   - Should NOT have trailing slash (app removes it, but best to omit)
   - Should include the protocol (`http://` or `https://`)

3. Check browser console for the actual request URL being made

### Problem: "Connection failed" after clicking Test Connection

**Check:**
1. Are your Jira credentials correct?
   - Jira Host should NOT include `https://` (just `yourcompany.atlassian.net`)
   - API token should be valid and not expired

2. Is your CORS proxy able to reach the Jira instance?
   ```bash
   curl -v http://localhost:8081/https://yourcompany.atlassian.net/rest/api/3/myself \
     -H "Authorization: Basic $(echo -n 'your-email@example.com:your-api-token' | base64)"
   ```

### Problem: Proxy works for test connection but not for loading timesheet data

**Check:**
1. Is the Jira client being properly reinitialized after saving settings?
2. Check the Network tab in DevTools to see which URLs are being called
3. Look for errors in the Console tab

### Problem: Authentication errors (401 Unauthorized)

**Check:**
1. Is your API token correct?
2. Is your email correct?
3. Does your Jira user have permission to access the API?
4. Generate a new API token at: https://id.atlassian.com/manage-profile/security/api-tokens

---

## Testing Checklist

Use this checklist to verify CORS proxy functionality:

- [ ] Start local CORS proxy server
- [ ] Verify proxy is running (`curl http://localhost:8081`)
- [ ] Open app in browser
- [ ] Navigate to Settings
- [ ] Fill in Jira credentials
- [ ] Leave CORS Proxy empty and test (should fail with CORS error)
- [ ] Add CORS proxy URL and test (should succeed)
- [ ] Save settings
- [ ] Navigate to Timesheet page
- [ ] Select date range
- [ ] Verify timesheet data loads successfully
- [ ] Check browser console for errors
- [ ] Test with different date ranges
- [ ] Verify worklog entries display correctly

---

## Additional Resources

- [Jira API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)
- [CORS Explained (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [cors-anywhere GitHub](https://github.com/Rob--W/cors-anywhere)
- [Generating Jira API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)

---

## Summary

The CORS proxy functionality in this app:

1. ✅ **Is properly implemented** in both the client store and settings form
2. ✅ **Has built-in testing** via the "Test Connection" button
3. ✅ **Is optional** - users can configure it only if needed
4. ✅ **Supports any CORS proxy** that follows the standard URL format
5. ✅ **Is user-configurable** - stored in localStorage and persisted across sessions

**Recommended workflow:**
1. Run a local CORS proxy using cors-anywhere (Option 1 above)
2. Configure the proxy URL in app settings
3. Test the connection before saving
4. Use the app normally with the proxy in place

For production deployments, consider deploying cors-anywhere on a server you control, or using a reverse proxy like nginx.
