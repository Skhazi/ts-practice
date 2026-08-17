import { env } from './env';

/**
 * URL builders. Tests and page objects ask for a URL by name; they never
 * assemble query strings themselves, and no literal URL appears in a spec.
 */

/** Application routes, relative to `env.appBaseUrl`. */
export const appPaths = {
  root: '/',
  dashboard: '/dashboard',
} as const;

/** Absolute URL for an application route. */
export function appUrl(path: string = appPaths.root): string {
  return new URL(path, env.appBaseUrl).toString();
}

/**
 * The login URL, including the theme and the encoded redirect back into the
 * application, e.g.
 * https://auth-stg.netgear.com/login?theme=insight&redirectUrl=https%3A%2F%2Fpri-qa.insight.netgear.com%2F
 */
export function loginUrl(redirectTo: string = appUrl(appPaths.root)): string {
  const url = new URL('/login', env.authBaseUrl);
  url.searchParams.set('theme', env.authTheme);
  url.searchParams.set('redirectUrl', redirectTo);
  return url.toString();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Matches any URL on the identity provider's login screen, ignoring query
 * string. Use for redirect assertions instead of hard-coding the host.
 */
export function loginUrlPattern(): RegExp {
  const host = new URL(env.authBaseUrl).host;
  return new RegExp(`${escapeRegExp(host)}/login`);
}

/** Matches the dashboard route on the application host. */
export function dashboardUrlPattern(): RegExp {
  return new RegExp(escapeRegExp(appPaths.dashboard));
}
