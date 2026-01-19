import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for OpusMode E2E testing.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './e2e',

    /* Run tests in files in parallel */
    fullyParallel: true,

    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,

    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,

    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,

    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html', { open: 'never' }],
        ['list']
    ],

    /* Shared settings for all the projects below. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://localhost:8081',

        /* Collect trace when retrying the failed test. */
        trace: 'on-first-retry',

        /* Take screenshot on failure */
        screenshot: 'only-on-failure',

        /* Record video on failure */
        video: 'retain-on-failure',
    },

    /* Configure projects for major browsers */
    projects: [
        // Setup project - runs first to authenticate
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },

        // Main test project - depends on setup
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Use saved auth state
                storageState: '.auth/pro-user.json',
            },
            dependencies: ['setup'],
        },

        // Free tier testing project
        {
            name: 'chromium-free',
            use: {
                ...devices['Desktop Chrome'],
                storageState: '.auth/free-user.json',
            },
            dependencies: ['setup'],
            testMatch: /tier-features\.spec\.ts/,
        },
    ],

    /* Run local dev server before starting the tests */
    webServer: {
        command: 'npm run web',
        url: 'http://localhost:8081',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000, // 2 minutes for initial bundle
    },
});
