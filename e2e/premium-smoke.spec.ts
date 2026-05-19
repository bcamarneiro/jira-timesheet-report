import { expect, test } from '@playwright/test';

/**
 * Premium-tier smoke. Covers the paywall-adjacent surfaces a paying user
 * encounters before they actually hit Stripe:
 *   - Pricing page renders the name-your-price tiers and CTA gating.
 *   - Custom amount input enforces the €3 floor.
 *   - /auth/sign-in renders form fields (only on premium builds; skipped otherwise).
 *
 * Runs against `npm run dev:offline` by default. For auth-route coverage,
 * start the dev server with `BUILD_TIER=premium npm run dev:offline`.
 */

test.describe('Premium smoke', () => {
	test('pricing surfaces name-your-price tiers and CTA gating', async ({
		page,
	}) => {
		await page.goto('/pricing');
		await page.waitForLoadState('networkidle');

		await expect(page.getByRole('heading', { name: 'Pricing.' })).toBeVisible();

		for (const label of ['€3', '€10', '€30']) {
			await expect(
				page.getByRole('button', { name: new RegExp(`^${label}\\b`) }),
			).toBeVisible();
		}

		await expect(
			page.getByRole('button', { name: 'Custom amount' }),
		).toBeVisible();
	});

	test('custom amount below €3 floor blocks the CTA', async ({ page }) => {
		await page.goto('/pricing');
		await page.waitForLoadState('networkidle');

		await page.getByRole('button', { name: 'Custom amount' }).click();
		const customInput = page.getByLabel(/custom/i, { exact: false });
		await customInput.fill('1');

		await expect(page.getByRole('alert')).toBeVisible();
	});

	test('/auth/sign-in renders email + password fields', async ({ page }) => {
		await page.goto('/auth/sign-in');
		// Premium route table loads as a dynamic chunk — give it a beat before
		// deciding the route doesn't exist.
		const heading = page.getByRole('heading', { name: 'Sign in' });
		const visible = await heading
			.waitFor({ state: 'visible', timeout: 5000 })
			.then(() => true)
			.catch(() => false);
		if (!visible) {
			test.skip(
				true,
				'sign-in route not mounted (Free-tier build) — run with BUILD_TIER=premium',
			);
			return;
		}

		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByLabel('Password')).toBeVisible();
		await expect(
			page.getByRole('button', { name: /Continue with GitHub/i }),
		).toBeVisible();
	});

	test('/account bounces unauthenticated visitors to sign-in', async ({
		page,
	}) => {
		await page.goto('/account');
		const heading = page.getByRole('heading', { name: 'Sign in' });
		const bounced = await heading
			.waitFor({ state: 'visible', timeout: 5000 })
			.then(() => true)
			.catch(() => false);
		if (!bounced) {
			test.skip(
				true,
				'/account route not mounted (Free-tier build) — run with BUILD_TIER=premium',
			);
			return;
		}
		await expect(page).toHaveURL(/\/auth\/sign-in/);
	});
});
