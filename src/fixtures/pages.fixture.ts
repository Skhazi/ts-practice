import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import type { UserRole } from '../config/credentials';

interface PageFixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
}

interface WorkerOptions {
  /** Role used by the `dashboardAsUser` fixture. Override per project or per test. */
  userRole: UserRole;
}

/**
 * Extended `test` with page objects injected.
 *
 * Import this instead of `@playwright/test` in specs:
 *   import { test, expect } from '@fixtures/pages.fixture';
 */
export const test = base.extend<PageFixtures & WorkerOptions>({
  userRole: ['standard', { option: true }],

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect };
