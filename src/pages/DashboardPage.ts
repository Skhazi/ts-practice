import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { appPaths } from '../config/urls';

/**
 * NETGEAR Insight dashboard — the landing page after a successful login.
 */
export class DashboardPage extends BasePage {
  /** Insight logo in the top bar. Only rendered for an authenticated session. */
  readonly themeLogo: Locator;

  /** Profile avatar in the header. Opens the account menu. */
  readonly userMenuTrigger: Locator;

  /** "Logout" row inside the account menu. */
  readonly logoutMenuItem: Locator;

  constructor(page: Page) {
    super(page);

    /* Both the header and the (collapsed) side nav carry aria-label="theme-logo",
       so the locator is scoped to the banner to stay strict-mode safe. */
    this.themeLogo = page.getByRole('banner').getByLabel('theme-logo');

    /* The app ships stable, semantic ids on these controls, so they are used
       directly rather than matching on the "User Profile" alt text or the
       "Logout" label — both of which are translatable. */
    this.userMenuTrigger = page.locator('#profile-section-avatar-image');
    this.logoutMenuItem = page.locator('#profile-section-menu-item-logout');
  }

  async goto(): Promise<void> {
    await this.open(appPaths.dashboard);
    await this.expectLoaded();
  }

  override async expectLoaded(): Promise<void> {
    /* After login the app shows a spinner on "/" for a while before
       client-routing to /dashboard, so this needs the navigation timeout
       (30s), not the 10s expect timeout. */
    await this.page.waitForURL(`**${appPaths.dashboard}**`);
    await expect(this.themeLogo).toBeVisible();
  }

  /** True when the authenticated shell has rendered. */
  async isLoggedIn(): Promise<boolean> {
    return this.themeLogo.isVisible();
  }

  /** Opens the header account menu. */
  async openUserMenu(): Promise<void> {
    await this.userMenuTrigger.click();
    await expect(this.logoutMenuItem).toBeVisible();
  }

  /** Opens the header account menu and clicks Logout. */
  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.logoutMenuItem.click();
  }
}
