import 'dotenv/config';

import { defineConfig, devices } from '@playwright/test';

// Use process.env.PORT by default and fallback to 3000
const PORT = process.env.PORT || 3000;

// Set webServer.url and use.baseURL with the location of the WebServer respecting the PORT defined above
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e', // Directory where E2E tests will live
  fullyParallel: true, // Run tests in parallel
  forbidOnly: !!process.env.CI, // Fail the build on CI if you accidentally left test.only in the source code.
  retries: process.env.CI ? 2 : 0, // Retry on CI only
  workers: process.env.CI ? 1 : undefined, // Opt out of parallel tests on CI.
  reporter: 'html', // Reporter to use. See https://playwright.dev/docs/test-reporters
  use: {
    baseURL, // Base URL to use in actions like `await page.goto('/')`
    trace: 'on-first-retry', // Record trace only when retrying a failed test.
  },
  // Configure projects for major browsers.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Optionally configure other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  // Run your local dev server before starting the tests
  webServer: {
    command: 'pnpm dev', // Command to start your dev server
    url: baseURL,
    timeout: 120 * 1000, // Timeout for server start
    reuseExistingServer: !process.env.CI, // Reuse dev server if already running locally
  },
}); 