import { test as pagesTest, expect } from './pages.fixture';
import type { DashboardPage } from '../pages/DashboardPage';

interface AuthFixtures {
  /**
   * A dashboard that is already logged in as `userRole`.
   *
   * Use in specs that test something *behind* the login wall, so they do not
   * re-implement the sign-in steps. Specs that test authentication itself
   * should drive `loginPage` directly instead.
   */
  authenticatedDashboard: DashboardPage;
}

export const test = pagesTest.extend<AuthFixtures>({
  authenticatedDashboard: async ({ loginPage, dashboardPage, userRole }, use) => {
    await loginPage.goto();
    await loginPage.loginAs(userRole);
    await dashboardPage.expectLoaded();

    await use(dashboardPage);
  },
});

export { expect };
