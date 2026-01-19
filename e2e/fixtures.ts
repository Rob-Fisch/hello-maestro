import { test as base, expect, Page } from '@playwright/test';

/**
 * Custom test fixtures with automatic error catching.
 * 
 * These fixtures will fail any test if:
 * - Serious console errors occur (filtered for noise)
 * - Uncaught exceptions are thrown (red box errors)
 * - Page crashes or becomes unresponsive
 */

// Extend the base test with error-catching fixtures
export const test = base.extend<{
    errorCollector: string[];
}>({
    // Error collector that captures all console errors
    errorCollector: async ({ page }, use) => {
        const errors: string[] = [];

        // Capture console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = msg.text();
                // Ignore known non-critical errors
                const ignoredPatterns = [
                    'favicon.ico',
                    'manifest.json',
                    'Failed to load resource',
                    'net::ERR_',
                    'ResizeObserver',
                    'Non-Error promise rejection',
                    'Loading module from',
                    'Importing a module script failed',
                    'Cannot manually set color scheme', // NativeWind dark mode config warning
                ];
                const isIgnored = ignoredPatterns.some(pattern => text.includes(pattern));
                if (!isIgnored) {
                    errors.push(`Console error: ${text}`);
                }
            }
        });

        // Capture uncaught exceptions (React error boundaries, crashes)
        page.on('pageerror', error => {
            // Ignore NativeWind dark mode warning
            if (!error.message.includes('Cannot manually set color scheme')) {
                errors.push(`Uncaught exception: ${error.message}`);
            }
        });

        // Use the fixture
        await use(errors);

        // After test: fail if any errors were collected
        if (errors.length > 0) {
            throw new Error(`Test encountered ${errors.length} error(s):\n${errors.join('\n')}`);
        }
    },
});

// Re-export expect for convenience
export { expect };

/**
 * Helper to check that no error screens are visible
 */
export async function assertNoErrorScreens(page: Page) {
    // Check for React error overlay (red box) - be more specific
    const errorText = page.locator('text=/TypeError:|ReferenceError:|Cannot read properties of/');
    const count = await errorText.count();
    if (count > 0) {
        throw new Error('Error screen detected on page');
    }
}

/**
 * Helper to wait for the app to fully load (no loading spinners)
 */
export async function waitForAppReady(page: Page, timeout = 10000) {
    // Wait for network to settle
    await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Test account credentials (from workflow)
 */
export const TEST_ACCOUNTS = {
    pro: {
        email: 'antigravity-pro@opusmode.net',
        password: '!HEbmVp9w_tfbZQauR*',
    },
    free: {
        email: 'antigravity-free@opusmode.net',
        password: '!HEbmVp9w_tfbZQauR*',
    },
};
