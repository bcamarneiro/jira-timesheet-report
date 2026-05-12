// @vitest-environment happy-dom

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HoursProgressLine } from '../HoursProgressLine';

describe('HoursProgressLine', () => {
	it('renders total / target / percent when targetSeconds is provided', () => {
		const { container } = render(
			<HoursProgressLine totalSeconds={184 * 3600} targetSeconds={184 * 3600} />,
		);
		expect(container.textContent).toBe('184.0h / 184h (100%)');
	});

	it('rounds the target to integer hours and the percent to nearest integer', () => {
		const { container } = render(
			<HoursProgressLine
				totalSeconds={160 * 3600}
				targetSeconds={176 * 3600}
			/>,
		);
		expect(container.textContent).toBe('160.0h / 176h (91%)');
	});

	it('renders 0% when targetSeconds is zero', () => {
		const { container } = render(
			<HoursProgressLine totalSeconds={10 * 3600} targetSeconds={0} />,
		);
		expect(container.textContent).toBe('10.0h / 0h (0%)');
	});

	it('renders only the total when targetSeconds is undefined', () => {
		const { container } = render(
			<HoursProgressLine totalSeconds={37.5 * 3600} />,
		);
		expect(container.textContent).toBe('37.5h');
	});

	it('forwards className to the rendered span', () => {
		const { container } = render(
			<HoursProgressLine
				totalSeconds={3600}
				targetSeconds={3600}
				className="myClass"
			/>,
		);
		expect(container.querySelector('span')?.className).toBe('myClass');
	});
});
