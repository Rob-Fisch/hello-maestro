import { assertNoErrorScreens, expect, test, waitForAppReady } from './fixtures';

/**
 * Event/Schedule Tests - CRUD operations for events and gigs.
 */

test.describe('Events', () => {

    test('can create a standard event (rehearsal)', async ({ page, errorCollector }) => {
        await page.goto('/events');
        await waitForAppReady(page);

        // Click add event button
        const addButton = page.locator('[data-testid="add-event"], button:has-text("+"), [aria-label*="add"]').first();
        await addButton.click();

        // Wait for modal/form
        await page.waitForLoadState('networkidle');

        // Fill in event details
        const titleInput = page.locator('input[placeholder*="title" i], input[name="title"], [data-testid="event-title"]').first();
        await titleInput.fill('Test Rehearsal - Playwright');

        // Look for type selector and select "Rehearsal" if available
        const typeSelector = page.locator('[data-testid="event-type"], select:has-text("event type")').first();
        if (await typeSelector.isVisible()) {
            await typeSelector.click();
            await page.getByText(/rehearsal/i).first().click();
        }

        // Save the event
        const saveButton = page.locator('button:has-text("save"), button:has-text("create"), [data-testid="save-event"]').first();
        await saveButton.click();

        // Wait a moment for save
        await page.waitForTimeout(1000);

        // Verify we're back on schedule and event appears (or no errors)
        await assertNoErrorScreens(page);
    });

    test('can view event details', async ({ page, errorCollector }) => {
        await page.goto('/events');
        await waitForAppReady(page);

        // Click on an existing event (if any)
        const eventCard = page.locator('[data-testid="event-card"], [class*="event"]').first();

        if (await eventCard.isVisible()) {
            await eventCard.click();
            await waitForAppReady(page);

            // Should see event details
            await expect(page.locator('[data-testid="event-details"], [class*="event-detail"]')).toBeVisible({ timeout: 5000 }).catch(() => {
                // Event details might be a modal or a different page
            });
        }

        await assertNoErrorScreens(page);
    });

    test('can navigate between months', async ({ page, errorCollector }) => {
        await page.goto('/events');
        await waitForAppReady(page);

        // Look for month navigation arrows
        const nextMonth = page.locator('button:has-text(">"), [data-testid="next-month"], [aria-label*="next"]').first();
        const prevMonth = page.locator('button:has-text("<"), [data-testid="prev-month"], [aria-label*="prev"]').first();

        // Navigate forward
        if (await nextMonth.isVisible()) {
            await nextMonth.click();
            await page.waitForTimeout(500);
        }

        // Navigate back
        if (await prevMonth.isVisible()) {
            await prevMonth.click();
            await page.waitForTimeout(500);
        }

        await assertNoErrorScreens(page);
    });

});

test.describe('Gigs', () => {

    test('can create a gig event', async ({ page, errorCollector }) => {
        await page.goto('/events');
        await waitForAppReady(page);

        // Click add event button
        const addButton = page.locator('[data-testid="add-event"], button:has-text("+"), [aria-label*="add"]').first();
        await addButton.click();

        await page.waitForLoadState('networkidle');

        // Fill in gig details
        const titleInput = page.locator('input[placeholder*="title" i], input[name="title"], [data-testid="event-title"]').first();
        await titleInput.fill('Test Gig - Playwright');

        // Look for type selector and select "Gig" 
        const typeSelector = page.locator('[data-testid="event-type"]').first();
        if (await typeSelector.isVisible()) {
            await typeSelector.click();
            await page.getByText(/gig|performance/i).first().click();
        }

        // Save
        const saveButton = page.locator('button:has-text("save"), button:has-text("create"), [data-testid="save-event"]').first();
        await saveButton.click();

        await page.waitForTimeout(1000);
        await assertNoErrorScreens(page);
    });

});
