import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useUserDataStore } from '../useUserDataStore';

describe('useUserDataStore', () => {
	beforeEach(() => {
		act(() => {
			useUserDataStore.setState({
				favorites: [],
				templates: [],
				commentPresets: [],
				dayNotes: {},
				calendarMappings: [],
			});
		});
	});

	it('normalizes favorite issue keys and prevents duplicates', () => {
		act(() => {
			useUserDataStore.getState().addFavorite({
				issueKey: ' proj-123 ',
				issueSummary: ' Test issue ',
				defaultTimeSpent: ' 1h ',
				defaultSeconds: 3600,
			});
			useUserDataStore.getState().addFavorite({
				issueKey: 'PROJ-123',
				issueSummary: 'Duplicate',
				defaultTimeSpent: '2h',
				defaultSeconds: 7200,
			});
		});

		expect(useUserDataStore.getState().favorites).toEqual([
			{
				issueKey: 'PROJ-123',
				issueSummary: 'Test issue',
				defaultTimeSpent: '1h',
				defaultSeconds: 3600,
			},
		]);
	});

	it('deduplicates comment presets case-insensitively', () => {
		act(() => {
			useUserDataStore.getState().addCommentPreset(' Standup ');
			useUserDataStore.getState().addCommentPreset('standup');
			useUserDataStore.getState().addCommentPreset('Review');
		});

		expect(useUserDataStore.getState().commentPresets).toEqual([
			'Standup',
			'Review',
		]);
	});

	it('normalizes calendar mappings and updates them safely', () => {
		act(() => {
			useUserDataStore.getState().addCalendarMapping({
				pattern: ' Team Sync ',
				issueKey: 'proj-9',
			});
			useUserDataStore.getState().updateCalendarMapping('team sync', {
				pattern: ' Delivery Sync ',
				issueKey: 'proj-10',
			});
		});

		expect(useUserDataStore.getState().calendarMappings).toEqual([
			{
				pattern: 'Delivery Sync',
				issueKey: 'PROJ-10',
				issueSummary: undefined,
			},
		]);
	});

	it('sorts and deduplicates template weekdays on insert', () => {
		act(() => {
			useUserDataStore.getState().addTemplate({
				id: 'template-1',
				issueKey: 'proj-1',
				issueSummary: 'Template',
				timeSpent: ' 30m ',
				seconds: 1800,
				comment: ' recurring ',
				daysOfWeek: [5, 1, 1, 3],
				enabled: true,
			});
		});

		expect(useUserDataStore.getState().templates).toEqual([
			{
				id: 'template-1',
				issueKey: 'PROJ-1',
				issueSummary: 'Template',
				timeSpent: '30m',
				seconds: 1800,
				comment: 'recurring',
				daysOfWeek: [1, 3, 5],
				enabled: true,
			},
		]);
	});

	it('replaces calendar mappings with normalized values', () => {
		act(() => {
			useUserDataStore.getState().replaceCalendarMappings([
				{ pattern: ' Planning ', issueKey: 'proj-3' },
				{ pattern: 'planning', issueKey: 'proj-4' },
				{ pattern: 'Retro', issueKey: ' proj-5 ' },
			]);
		});

		expect(useUserDataStore.getState().calendarMappings).toEqual([
			{ pattern: 'Planning', issueKey: 'PROJ-3', issueSummary: undefined },
			{ pattern: 'Retro', issueKey: 'PROJ-5', issueSummary: undefined },
		]);
	});
});
