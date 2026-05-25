import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { buildTeamCsv } from '../../utils/teamCsvExport';
import { DemoPage } from '../DemoPage';
import { buildDemoTeam, DEMO_WEEKDAYS } from '../demoFixture';

describe('demoFixture', () => {
	it('builds a five-person team', () => {
		expect(buildDemoTeam()).toHaveLength(5);
	});

	it('keeps totalSeconds consistent with dailyHours', () => {
		for (const member of buildDemoTeam()) {
			const summed = [...member.dailyHours.values()].reduce(
				(sum, hours) => sum + Math.round(hours * 3600),
				0,
			);
			expect(member.totalSeconds).toBe(summed);
		}
	});

	it('includes both a fully-compliant member and a behind member (the value moment)', () => {
		const team = buildDemoTeam();
		expect(team.some((m) => m.gapSeconds === 0)).toBe(true);
		expect(team.some((m) => m.gapSeconds > 0)).toBe(true);
	});

	it('exports a CSV containing member names and a team-average row', () => {
		const csv = buildTeamCsv(buildDemoTeam(), DEMO_WEEKDAYS, {
			provenance: { jiraHost: 'demo.hoursmith.io' },
		});
		expect(csv).toContain('Team Member');
		expect(csv).toContain('Alex Turner');
		expect(csv).toContain('Team Average');
	});
});

describe('DemoPage', () => {
	const renderPage = () =>
		render(
			<MemoryRouter>
				<DemoPage />
			</MemoryRouter>,
		);

	it('shows the read-only demo banner with a link to pricing', () => {
		renderPage();
		expect(screen.getByText(/Demo data — read-only/)).toBeTruthy();
		expect(screen.getByRole('link', { name: /Get Hoursmith/ })).toBeTruthy();
	});

	it('renders every demo teammate in the rollup', () => {
		renderPage();
		for (const name of [
			'Alex Turner',
			'Maria Kovač',
			'Sam Patel',
			'Jordan Lee',
			'Priya Nair',
		]) {
			expect(
				screen.getByRole('button', { name: new RegExp(name) }),
			).toBeTruthy();
		}
	});

	it('offers a CSV export button', () => {
		renderPage();
		expect(screen.getByRole('button', { name: 'Export CSV' })).toBeTruthy();
	});
});
