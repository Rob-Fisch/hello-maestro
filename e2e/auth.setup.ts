import { expect, test as setup } from '@playwright/test';
import { TEST_ACCOUNTS } from './fixtures';

/**
 * Authentication setup - runs once before all tests.
 * Saves session state so tests don't need to log in every time.
 */

setup('authenticate as Pro user', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for landing page to load
    await page.waitForLoadState('networkidle');

    // Click Log In link/button (it's a text element, not a button role)
    await page.getByText('Log In', { exact: true }).click();

    // Wait for login form to appear
    await page.waitForLoadState('networkidle');

    // Fill in credentials - look for input fields
    await page.locator('input[type="email"], input[placeholder*="email" i]').first().fill(TEST_ACCOUNTS.pro.email);
    await page.locator('input[type="password"], input[placeholder*="password" i]').first().fill(TEST_ACCOUNTS.pro.password);

    // Submit login - look for "Enter Studio" or similar
    await page.getByText(/enter studio|sign in|submit/i).click();

    // Wait for redirect to dashboard - look for greeting (use .first() for multiple matches)
    await expect(page.getByText(/Hello.*Maestro/).first()).toBeVisible({ timeout: 15000 });

    // Save storage state (cookies, localStorage)
    await page.context().storageState({ path: '.auth/pro-user.json' });
});

setup('authenticate as Free user', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for landing page to load
    await page.waitForLoadState('networkidle');

    // Click Log In link/button
    await page.getByText('Log In', { exact: true }).click();

    // Wait for login form to appear
    await page.waitForLoadState('networkidle');

    // Fill in credentials
    await page.locator('input[type="email"], input[placeholder*="email" i]').first().fill(TEST_ACCOUNTS.free.email);
    await page.locator('input[type="password"], input[placeholder*="password" i]').first().fill(TEST_ACCOUNTS.free.password);

    // Submit login
    await page.getByText(/enter studio|sign in|submit/i).click();

    // Wait for redirect to dashboard - look for greeting (use .first() for multiple matches)
    await expect(page.getByText(/Hello.*Maestro/).first()).toBeVisible({ timeout: 15000 });

    // Save storage state (cookies, localStorage)
    await page.context().storageState({ path: '.auth/free-user.json' });
});
