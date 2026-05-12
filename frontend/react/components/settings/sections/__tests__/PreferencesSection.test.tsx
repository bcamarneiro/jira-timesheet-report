// @vitest-environment happy-dom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PreferencesSection } from '../PreferencesSection';

describe('PreferencesSection', () => {
	it('renders Theme and Time Rounding selects with the supplied values', () => {
		render(
			<PreferencesSection
				theme="dark"
				timeRounding="15m"
				handleSelectChange={vi.fn()}
				themeId="theme"
				timeRoundingId="round"
			/>,
		);
		expect(screen.getByLabelText('Theme')).toHaveValue('dark');
		expect(screen.getByLabelText('Time Rounding')).toHaveValue('15m');
	});

	it('forwards select changes via handleSelectChange', () => {
		const handleSelectChange = vi.fn();
		render(
			<PreferencesSection
				theme="system"
				timeRounding="off"
				handleSelectChange={handleSelectChange}
				themeId="theme"
				timeRoundingId="round"
			/>,
		);
		fireEvent.change(screen.getByLabelText('Theme'), {
			target: { value: 'light' },
		});
		expect(handleSelectChange).toHaveBeenCalled();
	});
});
