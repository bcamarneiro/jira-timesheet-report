import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PremiumWaitlistForm } from '../PremiumWaitlistForm';

describe('PremiumWaitlistForm', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	function fillEmail(value: string) {
		const input = screen.getByPlaceholderText(/you@work\.com/i);
		fireEvent.change(input, { target: { value } });
	}

	it('renders an input and submit button', () => {
		render(<PremiumWaitlistForm source="pricing" />);
		expect(screen.getByPlaceholderText(/you@work\.com/i)).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /notify me/i }),
		).toBeInTheDocument();
	});

	it('shows a validation error for an obviously invalid email and does not POST', () => {
		const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
		render(<PremiumWaitlistForm source="pricing" />);
		fillEmail('not-an-email');
		fireEvent.click(screen.getByRole('button', { name: /notify me/i }));
		expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('posts to /api/waitlist with email + source and shows success on 200', async () => {
		const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify({ saved: true }), { status: 200 }),
		);
		render(<PremiumWaitlistForm source="in-app-settings" />);
		fillEmail('a@b.co');
		fireEvent.click(screen.getByRole('button', { name: /notify me/i }));
		await waitFor(() => {
			expect(
				screen.getByText(/thanks\. we'll let you know/i),
			).toBeInTheDocument();
		});
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/waitlist',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ email: 'a@b.co', source: 'in-app-settings' }),
			}),
		);
	});

	it('shows the 4xx error message when the server rejects the email', async () => {
		const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify({ error: 'invalid_email' }), { status: 400 }),
		);
		render(<PremiumWaitlistForm source="pricing" />);
		fillEmail('a@b.co');
		fireEvent.click(screen.getByRole('button', { name: /notify me/i }));
		await waitFor(() => {
			expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i);
		});
	});

	it('shows a 5xx error message when the server is unavailable', async () => {
		const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
		fetchMock.mockResolvedValue(new Response('boom', { status: 500 }));
		render(<PremiumWaitlistForm source="pricing" />);
		fillEmail('a@b.co');
		fireEvent.click(screen.getByRole('button', { name: /notify me/i }));
		await waitFor(() => {
			expect(screen.getByRole('alert')).toHaveTextContent(/try again later/i);
		});
	});

	it('shows the 5xx error message when fetch itself throws', async () => {
		const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
		fetchMock.mockRejectedValue(new Error('offline'));
		render(<PremiumWaitlistForm source="pricing" />);
		fillEmail('a@b.co');
		fireEvent.click(screen.getByRole('button', { name: /notify me/i }));
		await waitFor(() => {
			expect(screen.getByRole('alert')).toHaveTextContent(/try again later/i);
		});
	});
});
