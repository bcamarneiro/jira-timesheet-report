# Client-Side Configuration Migration Plan

## Overview
Migrate from environment variable-based configuration to a client-side configuration system that allows users to manage their own Jira settings and share project configurations with their team.

## Current State
- Configuration stored in `.env` file
- Server-side environment variables (`JIRA_DOMAIN`, `JIRA_PAT`, `JIRA_COMPONENT`, `TEAM_DEVELOPERS`)
- Single-user setup requiring manual configuration
- Backend server required for CORS handling

## Target State
- **Pure frontend application** with client-side configuration
- Configuration stored in IndexedDB
- Settings page for configuration management
- Split between project settings (shareable) and personal settings (private)
- Optional CORS proxy configuration
- Connection validation and status indicators
- Export/import functionality for team collaboration
- **No backend server required**

## 1. Data Storage Strategy

### IndexedDB Schema
```typescript
interface ProjectConfig {
  id: string;
  name: string;
  jiraDomain: string;
  componentFilter?: string;
  teamDevelopers: string[];
  corsProxy?: string; // Optional CORS proxy URL
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface PersonalConfig {
  pat: string;
  preferences: UserPreferences;
  lastUsedProject: string;
  theme: 'light' | 'dark' | 'auto';
}

interface ConnectionStatus {
  projectId: string;
  lastTested: Date;
  status: 'success' | 'error' | 'unknown' | 'testing';
  error?: string;
  responseTime?: number;
}

interface UserPreferences {
  defaultView: 'calendar' | 'list';
  timeFormat: '12h' | '24h';
  autoRefresh: boolean;
  notifications: boolean;
}
```

### Storage Benefits
- **IndexedDB over localStorage**: Better for structured data, larger storage capacity, better performance
- **Structured data**: Easy to query and manage
- **Versioning**: Can handle schema migrations
- **Offline support**: Works without network connection

## 2. Settings Page Architecture

### Page Structure
```
Settings Page
├── Project Settings Tab
│   ├── Project Selection/Dropdown
│   ├── Jira Domain Configuration
│   ├── CORS Proxy Configuration (Optional)
│   ├── Component Filters
│   ├── Team Developers Management
│   ├── Export/Import Project Config
│   └── Test Connection Button
├── Personal Settings Tab
│   ├── Personal Access Token
│   ├── User Preferences
│   ├── Theme Selection
│   └── Personal Time Tracking Settings
└── Connection Status Panel
    ├── Current Project Status
    ├── Last Connection Test
    ├── Error Details (if any)
    └── Connection History
```

### Features
- **Project Management**: Create, edit, delete, duplicate projects
- **Import/Export**: JSON-based project configuration sharing
- **Connection Testing**: Real-time validation of Jira credentials
- **Status Indicators**: Visual feedback on connection health
- **Validation**: Form validation with helpful error messages

## 3. Connection Validation System

### Validation Levels
1. **Basic Validation**: Check if required fields are filled
2. **Format Validation**: Validate domain format, PAT length, proxy URL format
3. **Proxy Validation**: Test CORS proxy connection (if configured)
4. **API Validation**: Test actual connection to Jira API
5. **Permission Validation**: Verify PAT has required permissions

### CORS Proxy Options
- **No Proxy**: Direct connection (if Jira allows CORS)
- **Public Proxy**: Use services like cors-anywhere, allorigins
- **Self-Hosted Proxy**: User's own CORS proxy instance
- **Custom Proxy**: Any CORS proxy service

### UI Components
- **Connection Status Badge**: Shows current connection state
- **Test Connection Button**: Manual connection testing
- **Error Messages**: Clear, actionable error descriptions
- **Retry Mechanisms**: Easy retry for failed connections
- **Connection History**: Track connection attempts and results

### Validation Flow
```
User Input → Basic Validation → Format Validation → Proxy Test (if configured) → API Test → Permission Check → Status Update
```

### CORS Proxy Configuration UI
```
CORS Proxy Settings:
├── [ ] No Proxy (Direct Connection)
├── [ ] Use Public Proxy
│   └── Dropdown: cors-anywhere, allorigins, etc.
├── [ ] Use Custom Proxy
│   └── URL Input Field
└── [ ] Use Self-Hosted Proxy
    └── URL Input Field + Test Button
```

## 4. Implementation Phases

### Phase 1: Foundation
- [ ] Set up IndexedDB storage system
- [ ] Install and configure `@narthia/jira-client`
- [ ] Create basic settings page structure
- [ ] Implement project configuration management
- [ ] Basic connection validation
- [ ] Replace backend API calls with client library

### Phase 2: Enhanced UX
- [ ] Advanced settings page with tabs
- [ ] Import/export functionality
- [ ] Connection status indicators
- [ ] Form validation and error handling

### Phase 3: Team Collaboration
- [ ] Project sharing features
- [ ] Configuration versioning
- [ ] Team onboarding flows
- [ ] Advanced connection monitoring

## 5. Technical Considerations

### Backend Changes
- **Remove backend entirely** - no server needed
- All API calls go directly to Jira (via CORS proxy if needed)
- Configuration validation happens client-side

### Frontend Changes
- Replace all environment variable usage with IndexedDB
- Create comprehensive settings management system
- **Integrate `@narthia/jira-client`** for direct Jira API communication
- Add CORS proxy configuration and testing
- Create configuration import/export functionality
- Build connection validation and status monitoring
- **Remove all backend API calls** - replace with client library calls

### Architecture Simplification
- **Pure SPA** - Single Page Application
- **Static hosting** - Deploy to Vercel, Netlify, GitHub Pages, etc.
- **No server costs** - Completely free to host
- **Better performance** - No server round-trips for configuration

### Jira API Client Library
**Selected: `@narthia/jira-client`**

**Why this library:**
- ✅ **Browser-optimized** - designed for frontend use
- ✅ **Zero runtime dependencies** - smaller bundle size
- ✅ **Personal Access Token support** - exactly what we need
- ✅ **Comprehensive TypeScript types** - auto-generated from OpenAPI
- ✅ **ESM/CJS dual support** - modern module system
- ✅ **Active maintenance** - regular updates

**Installation:**
```bash
npm install @narthia/jira-client
```

**Usage Example:**
```typescript
import { JiraClient } from '@narthia/jira-client';

const client = new JiraClient({
  type: 'default',
  auth: {
    email: 'user@example.com', // Not used with PAT
    apiToken: config.pat,
    baseUrl: `https://${config.domain}`,
  },
});

// Search issues with JQL
const issues = await client.issues.searchIssues({
  jql: 'worklogDate >= "2024-01-01" AND worklogDate <= "2024-01-31"',
  fields: ['key', 'summary'],
});

// Get worklogs for an issue
const worklogs = await client.worklogs.getWorklogsForIssue({
  issueIdOrKey: 'PROJ-123',
  startedAfter: startMillis,
  startedBefore: endMillis,
});
```

**API Methods We'll Use:**
- `client.issues.searchIssues()` - JQL search for issues
- `client.worklogs.getWorklogsForIssue()` - Get worklogs for specific issues
- `client.issues.getIssue()` - Get issue details (summaries)
- `client.myself.getMyself()` - Get current user information

**Migration from Backend:**
```typescript
// Old backend approach:
const response = await fetch(`https://${domain}/rest/api/2/search?${params}`);

// New frontend approach:
const issues = await client.issues.searchIssues({
  jql: jqlQuery,
  fields: ['key', 'summary'],
});
```

## 6. User Experience Improvements

### Onboarding
- Guided setup wizard for new users
- Import existing .env configuration
- Team project sharing links

### Daily Usage
- Quick project switching
- Connection status awareness
- Easy settings updates
- Clear error resolution

### Team Collaboration
- Share project configurations via URL/JSON
- Version control for project settings
- Team member onboarding assistance

## 7. Security Considerations

### Data Protection
- PAT stored securely in IndexedDB
- No server-side storage of sensitive data
- Clear data when clearing browser data

### Sharing Security
- Project configs don't include PATs
- Secure sharing mechanisms
- User consent for data sharing

## 8. Future Enhancements

### Advanced Features
- Multiple Jira instance support
- Configuration templates
- Automated connection monitoring
- Integration with other tools

### Analytics
- Connection success rates
- Most used configurations
- Performance metrics

## Questions & Decisions Pending

1. **IndexedDB vs localStorage**: Confirmed IndexedDB for better structure and performance
2. **Settings page location**: Separate page vs modal vs sidebar
3. **Project sharing method**: URL-based vs file-based vs both
4. **Connection validation frequency**: On-demand vs periodic vs real-time
5. **Team collaboration features**: What level of sharing is needed
6. **Configuration versioning**: How to handle schema changes
7. **Offline support**: How much functionality should work offline
8. **CORS proxy default**: Should we provide a default public proxy or require user configuration?
9. **Proxy validation**: How to test if a CORS proxy is working correctly?
10. **Deployment target**: Vercel, Netlify, GitHub Pages, or other?

## Next Steps

1. Finalize technical architecture decisions
2. Create detailed implementation plan
3. Set up development environment
4. Begin Phase 1 implementation
5. User testing and feedback collection
