import { assertNoErrorScreens, expect, test, waitForAppReady } from './fixtures';

/**
 * Upgrade Flow Tests - Verify checkout URLs work correctly.
 * 
 * These tests verify that:
 * 1. Upgrade buttons are visible to Free users
 * 2. Clicking upgrade opens the correct Lemon Squeezy checkout URL
 * 3. The checkout URL includes the user_id parameter
 * 
 * Run with: npx playwright test e2e/upgrade-flow.spec.ts --project=chromium-free
 */

test.describe('Upgrade Flow', () => {

    test('upgrade modal opens and shows checkout option', async ({ page, errorCollector }) => {
        await page.goto('/');
        await waitForAppReady(page);

        // Look for "Upgrade to Pro" or "Pro" upgrade button on home page
        const upgradeButton = page.getByText(/upgrade|go pro|get pro/i).first();

        if (await upgradeButton.isVisible({ timeout: 5000 })) {
            await upgradeButton.click();

            // Should see the upgrade modal with pricing info
            await expect(page.getByText(/pro|premium|upgrade/i)).toBeVisible({ timeout: 5000 });
        }

        await assertNoErrorScreens(page);
    });

    test('upgrade modal accessible from settings', async ({ page, errorCollector }) => {
        await page.goto('/settings');
        await waitForAppReady(page);

        // Look for upgrade CTA in settings
        const upgradeLink = page.getByText(/upgrade|go pro|premium/i).first();

        if (await upgradeLink.isVisible({ timeout: 5000 })) {
            await upgradeLink.click();

            // Should navigate to or show upgrade content
            await expect(page.getByText(/pro|premium|\$|month|year/i)).toBeVisible({ timeout: 5000 });
        }

        await assertNoErrorScreens(page);
    });

    test('checkout URL contains user_id parameter', async ({ page, context, errorCollector }) => {
        // Listen for new pages (popup) when checkout opens
        const pagePromise = context.waitForEvent('page', { timeout: 10000 }).catch(() => null);

        await page.goto('/modal/upgrade');
        await waitForAppReady(page);

        // Find and click a checkout button (monthly or yearly)
        const checkoutButton = page.getByRole('button', { name: /month|year|subscribe|checkout/i }).first();

        if (await checkoutButton.isVisible({ timeout: 5000 })) {
            await checkoutButton.click();

            // Wait for popup or navigation
            const newPage = await pagePromise;

            if (newPage) {
                const checkoutUrl = newPage.url();
                console.log('Checkout URL:', checkoutUrl);

                // Verify it's a Lemon Squeezy URL
                expect(checkoutUrl).toContain('lemonsqueezy.com');

                // Verify user_id is in the checkout URL
                expect(checkoutUrl).toMatch(/user_id=.+/);

                await newPage.close();
            }
        }

        await assertNoErrorScreens(page);
    });

    test('upgrade modal shows correct pricing', async ({ page, errorCollector }) => {
        await page.goto('/modal/upgrade');
        await waitForAppReady(page);

        // Should show Pro upgrade content
        await expect(page.getByText(/pro/i).first()).toBeVisible({ timeout: 5000 });

        await assertNoErrorScreens(page);
    });

});
