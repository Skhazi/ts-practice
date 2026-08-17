import { expect, type Page } from '@playwright/test';

/**
 * Shared behaviour for every page object.
 *
 * Rules for subclasses:
 *  - Expose locators as `readonly` fields built in the constructor. Never
 *    return a raw `Page` or a selector string to a test.
 *  - Prefer user-facing locators (`getByRole`, `getByLabel`) over CSS.
 *  - Assert nothing here except readiness; behavioural assertions live in specs.
 */
export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  /** Resolves once the page is recognisably itself. */
  abstract expectLoaded(): Promise<void>;

  /** Navigate to a path relative to `baseURL`. */
  async open(path = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  currentUrl(): string {
    return this.page.url();
  }

  async expectUrlToContain(fragment: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(escapeRegExp(fragment)));
  }

  /** Waits for the network to settle — use sparingly, prefer locator waits. */
  async waitForIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
