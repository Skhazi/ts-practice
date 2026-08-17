import { test, expect } from '../../src/fixtures/pages.fixture';
import { appPaths, dashboardUrlPattern } from '../../src/config/urls';
import { getCredentials } from '../../src/config/credentials';

test.describe('Insight login', { tag: ['@smoke', '@auth'] }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('signs in with valid credentials and lands on the dashboard', async ({
    loginPage,
    dashboardPage,
    page,
  }) => {
    await test.step('submit the login form', async () => {
      await loginPage.loginAs('standard');
    });

    await test.step('the app redirects to the dashboard', async () => {
      await page.waitForURL(`**${appPaths.dashboard}**`);
      await dashboardPage.expectLoaded();
    });

    await test.step('the authenticated shell is rendered', async () => {
      await expect(dashboardPage.themeLogo).toBeVisible();
    });
  });

  test('renders the sign-in form with both credential fields', async ({ loginPage }) => {
    await expect(loginPage.emailInput).toHaveAttribute('type', 'email');
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    await expect(loginPage.signInButton).toBeEnabled();
    await expect(loginPage.oneTimePasscodeButton).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });

  test('the password toggle reveals and re-hides the password', async ({ loginPage }) => {
    await loginPage.passwordInput.fill('not-a-real-password');

    await loginPage.passwordToggle.click();
    expect(await loginPage.isPasswordVisible()).toBe(true);

    await loginPage.passwordToggle.click();
    expect(await loginPage.isPasswordVisible()).toBe(false);
  });

  test('stays on the login page when the password is wrong', async ({ loginPage, page }) => {
    /* Reuse the real account so the failure is genuinely a bad password rather
       than an unknown user, but never restate the password literal. */
    const user = getCredentials('standard');
    await loginPage.login(user.email, 'deliberately-wrong-password');

    /* Negative path: the IdP must not redirect. Asserting the absence of the
       dashboard is deliberate — the exact error copy is not pinned down yet. */
    await expect(page).not.toHaveURL(dashboardUrlPattern());
    await expect(loginPage.signInButton).toBeVisible();
  });
});
