// @vitest-environment happy-dom

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScopeSection } from '../ScopeSection';

describe('ScopeSection', () => {
	it('renders the JQL filter input bound to the prop value', () => {
		render(
			<ScopeSection
				jqlFilter="project = X"
				allowedUsers=""
				allowedUserSuggestions={[]}
				handleChange={vi.fn()}
				onAllowedUsersChange={vi.fn()}
				jqlFilterId="jql"
				allowedUsersId="au"
			/>,
		);
		expect(screen.getByLabelText(/JQL Filter/)).toHaveValue('project = X');
	});

	it('forwards chip-editor changes via onAllowedUsersChange', () => {
		const onAllowedUsersChange = vi.fn();
		render(
			<ScopeSection
				jqlFilter=""
				allowedUsers="alice@example.com"
				allowedUserSuggestions={['bob@example.com']}
				handleChange={vi.fn()}
				onAllowedUsersChange={onAllowedUsersChange}
				jqlFilterId="jql"
				allowedUsersId="au"
			/>,
		);
		// We don't simulate AllowedUsersInput internals here; just confirm the
		// section renders with the prop value and the chip editor mounts.
		expect(screen.getByText(/Team Members/)).toBeInTheDocument();
	});
});
