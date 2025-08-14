import { http, HttpResponse } from 'msw';
import type { JiraWorklog } from '../../types/JiraWorklog';
import MockTeamDevelopers from './MockTeamDevelopers';
import MockWorklogs from './MockWorklogs';
import MockIssueSummaries from './MockIssueSummaries';

// Simple mock data that matches the JiraWorklog type
const mockWorklogs: JiraWorklog[] = [
  {
    self: 'https://ticket.rsint.net/rest/api/2/issue/12345/worklog/67890',
    author: {
      self: 'https://ticket.rsint.net/rest/api/2/user?accountId=user1',
      accountId: 'user1',
      displayName: 'Adriano Ferreira',
      active: true
    },
    updateAuthor: {
      self: 'https://ticket.rsint.net/rest/api/2/user?accountId=user1',
      accountId: 'user1',
      displayName: 'Adriano Ferreira',
      active: true
    },
    comment: 'Implemented user authentication feature',
    created: '2024-01-15T09:00:00.000Z',
    updated: '2024-01-15T09:00:00.000Z',
    started: '2024-01-15T09:00:00.000Z',
    timeSpent: '2h',
    timeSpentSeconds: 7200,
    id: '67890',
    issueId: '12345',
    issueKey: 'COM-64140'
  },
  {
    self: 'https://ticket.rsint.net/rest/api/2/issue/12346/worklog/67891',
    author: {
      self: 'https://ticket.rsint.net/rest/api/2/user?accountId=user2',
      accountId: 'user2',
      displayName: 'Igor Domingues',
      active: true
    },
    updateAuthor: {
      self: 'https://ticket.rsint.net/rest/api/2/user?accountId=user2',
      accountId: 'user2',
      displayName: 'Igor Domingues',
      active: true
    },
    comment: 'Fixed bug in login form validation',
    created: '2024-01-15T14:30:00.000Z',
    updated: '2024-01-15T14:30:00.000Z',
    started: '2024-01-15T14:30:00.000Z',
    timeSpent: '1h 30m',
    timeSpentSeconds: 5400,
    id: '67891',
    issueId: '12346',
    issueKey: 'COM-64141'
  },
  {
    self: 'https://ticket.rsint.net/rest/api/2/issue/12347/worklog/67892',
    author: {
      self: 'https://ticket.rsint.net/rest/api/2/user?accountId=user3',
      accountId: 'user3',
      displayName: 'Jeremias Jalil',
      active: true
    },
    updateAuthor: {
      self: 'https://ticket.rsint.net/rest/api/2/user?accountId=user3',
      accountId: 'user3',
      displayName: 'Jeremias Jalil',
      active: true
    },
    comment: 'Code review for authentication feature',
    created: '2024-01-15T16:00:00.000Z',
    updated: '2024-01-15T16:00:00.000Z',
    started: '2024-01-15T16:00:00.000Z',
    timeSpent: '45m',
    timeSpentSeconds: 2700,
    id: '67892',
    issueId: '12347',
    issueKey: 'COM-64142'
  }
];

const mockIssueSummaries: Record<string, string> = {
  'COM-64140': 'Implement user authentication system',
  'COM-64141': 'Fix login form validation bug',
  'COM-64142': 'Code review: authentication feature'
};

const mockTeamDevelopers = ['Adriano Ferreira', 'Igor Domingues', 'Jeremias Jalil'];

export const handlers = [
  http.get('/api/timesheet', () => {
    return HttpResponse.json({
      jiraDomain: 'ticket.rsint.net',
      worklogs: MockWorklogs,
      issueSummaries: MockIssueSummaries,
      teamDevelopers: MockTeamDevelopers
    });
  })
];
