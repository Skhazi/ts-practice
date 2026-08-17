import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

/**
 * Playwright configuration.
 * Docs: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',

  /* Run files in parallel; tests inside one file run serially by default. */
  fullyParallel: true,

  /* A stray `test.only` must fail the build, never silently skip the suite. */
  forbidOnly: env.isCI,

  retries: env.isCI ? 2 : 0,
  workers: env.isCI ? 2 : '50%',

  timeout: 60_000,
  expect: { timeout: 10_000 },

  reporter: env.isCI
    ? [['github'], ['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']]
    : [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],

  use: {
    baseURL: env.appBaseUrl,
    headless: env.headless,

    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    /* Diagnostics: cheap on green runs, full detail on red ones. */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
    testIdAttribute: 'data-testid',

    launchOptions: {
      slowMo: env.slowMo,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    /* Enable once the suite is stable on Chromium.
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',  use: { ...devices['Desktop Safari'] } },
    */
  ],
});
