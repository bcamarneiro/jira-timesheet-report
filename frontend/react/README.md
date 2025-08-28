# Frontend Architecture

This document describes the optimized frontend architecture for the Jira Timesheet Report application.

## Architecture Overview

The frontend has been refactored to improve maintainability and comprehension by separating concerns into focused components and services.

## Component Structure

### Layout Components
- **CalendarLayout**: Handles the overall page structure and layout
- **CalendarGrid**: Manages the calendar grid layout and weekday headers

### Control Components
- **CalendarControls**: Handles user selection and action buttons
- **MonthNavigator**: Navigation between months
- **UserSelector**: User selection dropdown
- **TimeOffSelector**: Time-off hours selection

### Display Components
- **TimesheetGrid**: Main grid container for user timesheet data
- **DayCell**: Individual day cell with worklogs and time-off
- **WorklogDisplay**: Individual worklog item display
- **UserStats**: User statistics and download actions

### State Components
- **EmptyState**: Displayed when no user is selected
- **ErrorState**: Displayed when there's an error loading data
- **NoDataDialog**: Dialog shown when no data is available for a user
- **LoadingSkeleton**: Loading state component

## Services

### CSV Service
- **CsvService**: Handles all CSV download operations
  - `downloadUserCsv()`: Download CSV for a single user
  - `downloadMultipleUsers()`: Download CSV for multiple users

## Hooks

### Data Hooks
- **useTimesheetApi**: Handles API data fetching with loading and error states
- **useTimesheetData**: Processes API data and provides computed values
- **useTimesheetQueryParams**: Manages URL query parameters and navigation
- **useProjectConfig**: Manages project configuration
- **usePersonalConfig**: Manages personal configuration
- **useTimeOff**: Manages time-off data

## Utilities

### Business Logic
- **karmaCalculator**: Calculates user karma and statistics
  - `calculateUserKarma()`: Computes total and net karma hours

### Data Processing
- **csv**: CSV generation utilities
- **date**: Date manipulation utilities
- **format**: Formatting utilities
- **text**: Text processing utilities
- **emojiMatcher**: Emoji matching logic

## Benefits of This Architecture

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be easily reused across the application
3. **Testability**: Smaller, focused components are easier to test
4. **Maintainability**: Changes to one concern don't affect others
5. **Comprehension**: Clear component names and structure make the code easier to understand

## Component Hierarchy

```
Calendar
├── CalendarLayout
│   ├── CalendarControls
│   │   ├── UserSelector
│   │   └── Download Button
│   ├── MonthNavigator
│   └── TimesheetGrid
│       ├── UserStats
│       ├── CalendarGrid
│       │   └── DayCell
│       │       ├── WorklogDisplay
│       │       └── TimeOffSelector
│       └── NoDataDialog (conditional)
├── EmptyState (conditional)
└── ErrorState (conditional)
```

## Data Flow

1. **API Layer**: `useTimesheetApi` fetches raw data from the server
2. **Processing Layer**: `useTimesheetData` processes and groups the data
3. **UI Layer**: Components consume processed data and handle user interactions
4. **Services**: Business operations like CSV downloads are handled by services
5. **Utilities**: Pure functions handle calculations and data transformations
