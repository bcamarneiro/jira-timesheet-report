# Jira Timesheet Report - Client-Side Configuration Migration

## What This App Does
A web application that generates timesheet reports from Jira worklogs. Users can view their work hours, track time off, and export data to CSV. Currently requires manual setup with environment variables and a backend server.

## Why We're Migrating
**Current Problems:**
- Manual `.env` file setup required
- Backend server needed for CORS handling
- Single-user configuration only
- No team collaboration features
- Complex deployment process

**Target Benefits:**
- Zero setup required - users just visit a URL
- Client-side configuration stored in browser
- Team collaboration with shared project settings
- No backend server needed
- Simple static hosting deployment

## Current Architecture
```
Frontend (React) → Backend (Express) → Jira API
                 ↑
            .env file (JIRA_DOMAIN, JIRA_PAT, etc.)
```

## Target Architecture
```
Frontend (React + Zustand) → CORS Proxy (optional) → Jira API
                          ↑
                    localStorage (user config)
```

## Key Technical Decisions

### 1. State Management: Zustand + Persist
**Decision:** Use Zustand with localStorage persistence
**Why:** Simple API, perfect for solo development, built-in persistence, small bundle size
**What it handles:** Configuration storage, UI state, API data caching

### 2. Jira API Client: @narthia/jira-client
**Decision:** Use @narthia/jira-client for direct Jira API communication
**Why:** Browser-optimized, zero dependencies, PAT support, comprehensive TypeScript types
**What it replaces:** All backend API calls

### 3. CORS Handling: Optional Proxy Configuration
**Decision:** Make CORS proxy optional in user settings
**Why:** Different Jira instances have different CORS policies, gives users flexibility
**Options:** No proxy, public proxy, self-hosted proxy, custom proxy

### 4. Settings UI: Separate Page
**Decision:** Settings as a dedicated page, not a modal
**Why:** More space for configuration options, better UX for complex settings
**What it includes:** Project settings tab, personal settings tab, connection status panel

## Data Structure

### Project Settings (Shareable)
- Jira domain
- Component filters
- Team developers list
- JQL filters for locating team tasks and worklogs
- CORS proxy configuration
- Project name and metadata

### Personal Settings (Private)
- Personal Access Token
- User preferences (theme, time format, etc.)
- Last used project

### UI State (Temporary)
- Selected user
- Current month/year
- Loading states
- Error messages

## Implementation Steps

### Phase 1: Foundation Setup
1. **Install dependencies**
   - `npm install zustand @narthia/jira-client`
   - Remove backend dependencies

2. **Create Zustand store**
   - Define state structure (projects, personal config, UI state)
   - Add persistence configuration
   - Create actions for state updates

3. **Replace backend API calls**
   - Remove all `/api/timesheet` calls
   - Replace with direct Jira client calls
   - Update data fetching logic

4. **Basic settings page**
   - Create dedicated settings page
   - Add project configuration form
   - Add personal settings form

### Phase 2: Enhanced Configuration
1. **CORS proxy support**
   - Add proxy configuration UI
   - Implement proxy testing
   - Update API calls to use proxy when configured

2. **Connection validation**
   - Add connection testing functionality
   - Show connection status indicators
   - Implement error handling and retry logic

3. **Import/Export features**
   - Add project configuration JSON export
   - Add project configuration JSON import
   - Create file-based sharing functionality

### Phase 3: Team Collaboration
1. **Project sharing**
   - JSON file-based project configuration sharing
   - Project templates for common setups
   - Team onboarding flows

2. **Advanced features**
   - Multiple project support
   - Advanced connection monitoring

## Settings Page Structure

### Project Settings Tab
- Project selection/dropdown
- Jira domain configuration
- CORS proxy configuration (optional)
- Component filters
- JQL filters for team tasks and worklogs
- Team developers management
- Export/import project config (JSON)
- Test connection button

### Personal Settings Tab
- Personal Access Token
- User preferences
- Theme selection
- Personal time tracking settings

### Connection Status Panel
- Current project status
- Last connection test
- Error details (if any)
- Connection history

## CORS Proxy Options

### No Proxy
- Direct connection to Jira API
- Works if Jira instance allows CORS
- Fastest option when available

### Public Proxy
- Use services like cors-anywhere, allorigins
- Quick setup, no maintenance
- May have rate limits

### Self-Hosted Proxy
- User's own CORS proxy instance
- Full control and reliability
- Requires deployment

### Custom Proxy
- Any CORS proxy service
- Maximum flexibility
- User provides URL

## Connection Validation Flow

**Trigger:** On-demand at time of request (when user tries to fetch data)
1. **Basic Validation** - Check required fields are filled
2. **Format Validation** - Validate domain format, PAT length, proxy URL
3. **Proxy Test** - Test CORS proxy connection (if configured)
4. **API Test** - Test actual connection to Jira API
5. **Permission Test** - Verify PAT has required permissions

## Security Considerations

### Data Protection
- PAT stored in localStorage (encrypted by browser)
- No server-side storage of sensitive data
- Clear data when clearing browser data

### Sharing Security
- Project configs don't include PATs (only domain, filters, team members)
- Only share project settings, not personal tokens
- User consent for data sharing

## Deployment Strategy

### Deployment Options
- **Primary:** Vercel (recommended for easy deployment)
- **Self-hosting:** Users can download and run locally
- **Static hosting:** Deploy as static files to any hosting service
- **No server required** - completely client-side

### Environment Variables
- Remove all `.env` dependencies
- Everything configured client-side
- No server-side configuration needed

## Migration Benefits

### For Users
- **Zero setup** - just visit the URL
- **Team collaboration** - share project settings
- **Multiple projects** - switch between different Jira instances
- **Better UX** - settings persist across sessions

### For Development
- **Simpler architecture** - no backend to maintain
- **Faster development** - focus on frontend features
- **Easier deployment** - just static files
- **Better testing** - no server dependencies

## CORS Proxy Explanation

### Why CORS Proxy is Needed
Browsers block direct API calls to different domains (CORS policy). Jira instances may not allow direct browser access, so a proxy is needed to:
- Add proper CORS headers to Jira API responses
- Handle authentication headers
- Provide a bridge between browser and Jira API

### CORS Proxy Options (No Default Provided)
- **No Proxy**: Direct connection (if Jira allows CORS)
- **Public Proxy**: Use services like cors-anywhere, allorigins
- **Self-Hosted Proxy**: User's own CORS proxy instance
- **Custom Proxy**: Any CORS proxy service

### Implementation
- Users configure their preferred proxy option in settings
- App tests connection with chosen proxy
- Falls back gracefully if proxy fails

## Future Considerations (Second Iteration)

### Configuration Versioning
- Handle schema changes when adding new features
- Migration paths for existing configurations
- Backward compatibility

### Offline Support
- Cache worklog data for offline viewing
- Queue actions when offline
- Sync when connection restored

## Decisions Made

1. **Settings page location**: ✅ Separate page (not modal)
2. **Project sharing method**: ✅ File-based JSON export/import
3. **Connection validation frequency**: ✅ On-demand at time of request
4. **Team collaboration features**: ✅ Share project configs (domain, team members, JQL filters)
5. **Configuration versioning**: ⏳ Second iteration
6. **Offline support**: ⏳ Second iteration
7. **CORS proxy default**: ⏳ No default provided, explain options to users
8. **Deployment target**: ✅ Vercel + self-hosting option

## Next Steps

1. **Start with Phase 1** - Foundation setup
2. **Create Zustand store** - Define state structure
3. **Replace API calls** - Use Jira client directly
4. **Add basic settings** - Project and personal configuration
5. **Test with real data** - Ensure everything works
6. **Iterate and improve** - Add features based on usage

## Success Criteria

- [ ] Users can configure Jira settings without .env file
- [ ] App works without backend server
- [ ] Settings persist across browser sessions
- [ ] Team members can share project configurations
- [ ] CORS issues are handled gracefully
- [ ] App can be deployed as static files