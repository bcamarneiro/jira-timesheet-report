# Jira Timesheet Report - Roadmap

This document outlines planned features and improvements for the Jira Timesheet Report application.

## Phase 1: Essential Features

### 1. Worklog Management
- **Create worklogs** from the calendar
  - Click "+" button on any day to open a modal
  - Fields: Issue key (with validation), time spent, description (optional), start date/time
  - Validate that the issue exists before allowing creation
  - Auto-refresh after successful creation
- **Edit existing worklogs**
  - Click on any worklog to open edit modal
  - Modify time spent or description
  - Save changes back to Jira
- **Delete worklogs**
  - Delete button with confirmation dialog
  - Remove from both Jira and local state

### 2. Basic Filters
- **Toggle weekends** visibility
  - Show/hide weekend columns in calendar
  - Preference saved in localStorage
- **Filter by project**
  - Dropdown to filter worklogs by Jira project
  - Works alongside existing JQL filter
- **Filter by component**
  - Quick filter for specific components
  - Complements the global JQL filter setting

### 3. User Experience Improvements
- Improved loading states for all operations
- Clear error messages with recovery suggestions
- Success notifications for create/edit/delete operations

---

## Phase 2: Nice to Have

### 1. Quick Actions
- **Duplicate worklog**
  - One-click duplicate to same or different day
  - Modify time/description before saving
- **Worklog templates**
  - Save frequently used worklogs (e.g., "Daily standup - 15min")
  - Quick-add from template library
  - Manage templates in settings
- **Copy day to another day**
  - Copy all worklogs from one day to another
  - Useful for repetitive work patterns

### 2. Statistics & Insights
- **Time distribution charts**
  - Pie chart: hours by project
  - Bar chart: hours by day/week
  - Issue breakdown: which issues consumed most time
- **Summary metrics**
  - Average hours per day/week
  - Total hours by project this month
  - Comparison: current month vs. previous month
- **Top issues**
  - List of issues where most time was spent
  - Time tracking trends over weeks

### 3. Keyboard Shortcuts
- `←` / `→` - Navigate between months
- `N` - Create new worklog
- `Esc` - Close modals
- `/` - Focus search/filter
- `?` - Show keyboard shortcuts help

---

## Phase 3: Advanced Features

### 1. Alternative Views
- **Weekly view**
  - See one week at a time instead of full month
  - More compact for detailed review
- **Issue-grouped view**
  - Group all worklogs by issue instead of by day
  - See total time per issue across the month
- **List view**
  - Flat list of all worklogs with sorting/filtering
  - Better for searching specific entries

### 2. Advanced Export
- **Excel export (.xlsx)**
  - Formatted spreadsheet with totals and formulas
  - Multiple sheets: summary + detailed breakdown
- **PDF export**
  - Print-friendly format for reports
  - Include charts and statistics
- **Custom date ranges**
  - Export specific date range, not just full month
  - Multi-month exports
- **Customizable templates**
  - Define custom CSV/Excel column layouts
  - Save export templates for reuse

### 3. Theme & Personalization
- **Dark mode**
  - Toggle between light/dark themes
  - Respect system preference option
  - Saved in user preferences
- **Color customization**
  - Custom colors for different work states
  - Personalize project/component colors
- **Layout options**
  - Compact vs. comfortable view density
  - Configurable calendar start day (Sunday/Monday)

### 4. Enhanced Jira Integration
- **Issue status inline**
  - Show status badge on each worklog (To Do, In Progress, Done)
  - Color-coded by status
- **Epic/Parent visibility**
  - Display epic or parent issue for each worklog
  - Group by epic option
- **Smart filtering**
  - "My issues only" filter (assigned to current user)
  - "Recent issues" quick filter
  - Issue type filters (Bug, Story, Task, etc.)

---

## Features to Avoid (For Now)

### External Calendar Integration
- **Reason**: Too complex for current scope
- **Alternative**: Manual time-off tracking works well enough
- **Future consideration**: Could revisit if highly requested

### Real-time Collaboration
- **Reason**: Requires backend infrastructure
- **Alternative**: Read-only sharing of exported reports
- **Future consideration**: Needs architectural changes

### Mobile App
- **Reason**: Web-first approach is sufficient
- **Alternative**: Responsive design works on mobile browsers
- **Future consideration**: PWA (Progressive Web App) could be middle ground

---

## Implementation Notes

- All features should maintain the current architecture (client-side, no backend)
- Preferences and settings stored in localStorage
- All Jira operations use Version2Client with Bearer token authentication
- Maintain backward compatibility with existing saved configurations
- Follow existing styling patterns and component structure

---

## Feedback & Contributions

This roadmap is a living document. Features may be re-prioritized based on:
- User feedback and requests
- Technical constraints or opportunities
- Time and resource availability

Last updated: 2025-01-28
