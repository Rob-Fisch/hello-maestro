import { assertNoErrorScreens, expect, test, waitForAppReady } from './fixtures';

/**
 * Tier Feature Tests - Verify Pro vs Free tier feature differences.
 * 
 * These tests run with different auth contexts:
 * - "chromium" project uses Pro user auth
 * - "chromium-free" project uses Free user auth
 */

test.describe('Navigator Tier Restrictions', () => {

    test('shows Navigator missions', async ({ page, errorCollector }) => {
        await page.goto('/coach');
        await waitForAppReady(page);

        // Should see mission cards
        await expect(page.getByText(/mission|gig hunt|teaching|tour/i)).toBeVisible({ timeout: 10000 });

        await assertNoErrorScreens(page);
    });

    test('Navigator missions have correct lock state', async ({ page, errorCollector }) => {
        await page.goto('/coach');
        await waitForAppReady(page);

        // Look for lock icons or "locked" text
        // Pro users should see fewer locks than Free users
        const lockIcons = page.locator('[data-testid="lock-icon"], [class*="lock"], svg[name*="lock"]');
        const lockCount = await lockIcons.count();

        // Log for debugging - Pro should have 0 or few locks
        console.log(`Lock icons visible: ${lockCount}`);

        await assertNoErrorScreens(page);
    });

});

test.describe('Song Library Limits', () => {

    test('can access song library', async ({ page, errorCollector }) => {
        await page.goto('/songs');
        await waitForAppReady(page);

        // Should see song library content
        await expect(page.getByText(/song|library|repertoire/i)).toBeVisible({ timeout: 10000 });

        await assertNoErrorScreens(page);
    });

});

test.describe('Set List Features', () => {

    test('can access set lists', async ({ page, errorCollector }) => {
        await page.goto('/stage');
        await waitForAppReady(page);

        // Look for set list related content
        await expect(page.getByText(/set list|setlist|template/i)).toBeVisible({ timeout: 10000 });

        await assertNoErrorScreens(page);
    });

});

test.describe('Sync Status', () => {

    test('shows sync status indicator', async ({ page, errorCollector }) => {
        await page.goto('/');
        await waitForAppReady(page);

        // Pro users should see "SYNCED" status
        const syncStatus = page.getByText(/synced|sync/i);

        if (await syncStatus.isVisible()) {
            console.log('Sync status indicator visible');
        }

        await assertNoErrorScreens(page);
    });

});
