// @vitest-environment happy-dom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PermissionsSection } from '../PermissionsSection';

describe('PermissionsSection', () => {
	it('renders all four permission checkboxes', () => {
		render(
			<PermissionsSection
				canAddWorklogs={true}
				canEditWorklogs={false}
				canDeleteWorklogs={true}
				complianceReminderEnabled={false}
				handleChange={vi.fn()}
			/>,
		);
		const checkboxes = screen.getAllByRole('checkbox');
		expect(checkboxes).toHaveLength(4);
		expect(checkboxes[0]).toBeChecked(); // canAddWorklogs
		expect(checkboxes[1]).not.toBeChecked(); // canEditWorklogs
		expect(checkboxes[2]).toBeChecked(); // canDeleteWorklogs
		expect(checkboxes[3]).not.toBeChecked(); // complianceReminderEnabled
	});

	it('calls handleChange when a permission is toggled', () => {
		const handleChange = vi.fn();
		render(
			<PermissionsSection
				canAddWorklogs={false}
				canEditWorklogs={false}
				canDeleteWorklogs={false}
				complianceReminderEnabled={false}
				handleChange={handleChange}
			/>,
		);
		fireEvent.click(screen.getAllByRole('checkbox')[0]);
		expect(handleChange).toHaveBeenCalled();
	});
});
