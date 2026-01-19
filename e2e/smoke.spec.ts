import { assertNoErrorScreens, expect, test, waitForAppReady } from './fixtures';

/**
 * Smoke Tests - Quick sanity checks that run on every deploy.
 * These verify the app loads without crashing and all main pages are accessible.
 */

test.describe('Smoke Tests', () => {

    test('home page loads without errors', async ({ page, errorCollector }) => {
        await page.goto('/');
        await waitForAppReady(page);

        // Should see the greeting (flexible match for different formats)
        await expect(page.getByText(/Hello.*Maestro/).first()).toBeVisible();

        // No error screens
        await assertNoErrorScreens(page);
    });

    test('schedule page loads', async ({ page, errorCollector }) => {
        await page.goto('/events');
        await waitForAppReady(page);

        // Should see Schedule title (use .first() for multiple matches)
        await expect(page.getByText('Schedule').first()).toBeVisible({ timeout: 10000 });

        await assertNoErrorScreens(page);
    });

    test('stage page loads', async ({ page, errorCollector }) => {
        await page.goto('/stage');
        await waitForAppReady(page);

        // Should see "The Stage" title (use .first() for multiple matches)
        await expect(page.getByText('The Stage').first()).toBeVisible({ timeout: 10000 });

        await assertNoErrorScreens(page);
    });

    test('studio/routines page loads', async ({ page, errorCollector }) => {
        await page.goto('/routines');
        await waitForAppReady(page);

        // Should see studio/practice content
        await expect(page.getByText(/studio|practice|routine|collection/i).first()).toBeVisible({ timeout: 10000 });

        await assertNoErrorScreens(page);
    });

    test('contacts page loads', async ({ page, errorCollector }) => {
        await page.goto('/people');
        await waitForAppReady(page);

        // Should see contacts content
        await expect(page.getByText(/contact|people|roster/i).first()).toBeVisible({ timeout: 10000 });

        await assertNoErrorScreens(page);
    });

    test('navigator page loads', async ({ page, errorCollector }) => {
        await page.goto('/coach');
        await waitForAppReady(page);

        // Should see navigator/coach content
        await expect(page.getByText(/navigator|mission|coach/i).first()).toBeVisible({ timeout: 10000 });

        await assertNoErrorScreens(page);
    });

});
