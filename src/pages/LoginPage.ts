import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { loginUrl } from '../config/urls';
import { getCredentials, type UserCredentials, type UserRole } from '../config/credentials';

/**
 * NETGEAR identity provider login page (auth-stg.netgear.com/login).
 *
 * Single-step form: email and password are on the same screen.
 */
export class LoginPage extends BasePage {
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly passwordToggle: Locator;
  readonly signInButton: Locator;
  readonly oneTimePasscodeButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly createAccountLink: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = page.getByRole('heading', { name: 'Account Log In' });

    /* The inputs carry stable ids (#email / #password) that the labels point at,
       so getByLabel resolves through the accessibility tree rather than CSS. */
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password', { exact: false }).first();

    /* The live DOM labels this button "Hide password" (and may swap the name
       as it toggles), so match either state. */
    this.passwordToggle = page.getByRole('button', { name: /(show|hide) password/i });
    this.signInButton = page.getByRole('button', { name: 'Sign In', exact: true });
    this.oneTimePasscodeButton = page.getByRole('button', {
      name: 'Log In With One-Time Passcode',
    });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password?' });
    this.createAccountLink = page.getByRole('link', { name: 'Create one' });
  }

  /** Opens the IdP login URL for the configured environment. */
  async goto(): Promise<void> {
    await this.page.goto(loginUrl(), { waitUntil: 'domcontentloaded' });
    await this.expectLoaded();
  }

  override async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.signInButton).toBeEnabled();
  }

  /** Fills the form and submits. Does not assert the outcome. */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  /**
   * Logs in as a role defined in `.env`. Preferred entry point — specs name a
   * role, never an account, so credentials stay out of the test code.
   */
  async loginAs(role: UserRole): Promise<UserCredentials> {
    const user = getCredentials(role);
    await this.login(user.email, user.password);
    return user;
  }

  /** Whether the password is currently rendered in clear text. */
  async isPasswordVisible(): Promise<boolean> {
    return (await this.passwordInput.getAttribute('type')) === 'text';
  }

  /** Field-level validation state, exposed via aria-invalid. */
  async hasFieldError(field: 'email' | 'password'): Promise<boolean> {
    const input = field === 'email' ? this.emailInput : this.passwordInput;
    return (await input.getAttribute('aria-invalid')) === 'true';
  }
}
