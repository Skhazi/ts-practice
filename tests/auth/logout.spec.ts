import { test, expect } from '../../src/fixtures/auth.fixture';
import { appPaths, loginUrlPattern } from '../../src/config/urls';

/**
 * End-to-end session lifecycle: launch -> login -> logout.
 *
 * The `authenticatedDashboard` fixture performs the launch and login, so this
 * spec asserts only the sign-out behaviour.
 */
test.describe('Insight logout', { tag: ['@smoke', '@auth'] }, () => {
  test('logs out and returns the user to an unauthenticated state', async ({
    authenticatedDashboard,
    page,
  }) => {
    await test.step('session starts authenticated', async () => {
      await expect(authenticatedDashboard.themeLogo).toBeVisible();
    });

    await test.step('open the account menu and click Logout', async () => {
      await authenticatedDashboard.openUserMenu();
      await expect(authenticatedDashboard.logoutMenuItem).toBeVisible();
      await authenticatedDashboard.logoutMenuItem.click();
    });

    await test.step('the app drops back to the login screen', async () => {
      await page.waitForURL(loginUrlPattern());
      await expect(page.getByRole('heading', { name: 'Account Log In' })).toBeVisible();
    });

    await test.step('the dashboard is no longer reachable without signing in', async () => {
      await page.goto(appPaths.dashboard);
      await expect(page).toHaveURL(loginUrlPattern());
    });
  });
});
