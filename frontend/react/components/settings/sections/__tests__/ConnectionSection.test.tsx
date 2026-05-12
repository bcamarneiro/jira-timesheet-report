// @vitest-environment happy-dom

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConnectionSection } from '../ConnectionSection';

describe('ConnectionSection', () => {
	it('renders the four connection inputs and the Test button', () => {
		render(
			<ConnectionSection
				formData={{
					jiraHost: 'example.atlassian.net',
					email: 'me@example.com',
					apiToken: 'tok',
					corsProxy: '',
				}}
				handleChange={vi.fn()}
				testJira={vi.fn()}
				canTestJira={true}
				integrationTest={{ loading: false, result: null }}
				jiraHostId="jh"
				emailId="em"
				apiTokenId="at"
				corsProxyId="cp"
			/>,
		);
		expect(screen.getByLabelText('Jira Host')).toHaveValue(
			'example.atlassian.net',
		);
		expect(screen.getByLabelText('Email')).toHaveValue('me@example.com');
		expect(screen.getByLabelText('API Token')).toHaveValue('tok');
		expect(screen.getByRole('button', { name: 'Test' })).toBeEnabled();
	});

	it('disables the Test button when canTestJira is false', () => {
		render(
			<ConnectionSection
				formData={{
					jiraHost: '',
					email: '',
					apiToken: '',
					corsProxy: '',
				}}
				handleChange={vi.fn()}
				testJira={vi.fn()}
				canTestJira={false}
				integrationTest={{ loading: false, result: null }}
				jiraHostId="jh"
				emailId="em"
				apiTokenId="at"
				corsProxyId="cp"
			/>,
		);
		expect(screen.getByRole('button', { name: 'Test' })).toBeDisabled();
	});

	it('shows the integration test result message when present', () => {
		render(
			<ConnectionSection
				formData={{
					jiraHost: 'h',
					email: 'e',
					apiToken: 't',
					corsProxy: '',
				}}
				handleChange={vi.fn()}
				testJira={vi.fn()}
				canTestJira={true}
				integrationTest={{
					loading: false,
					result: { success: true, message: 'All good' },
				}}
				jiraHostId="jh"
				emailId="em"
				apiTokenId="at"
				corsProxyId="cp"
			/>,
		);
		expect(screen.getByText('All good')).toBeInTheDocument();
	});
});
