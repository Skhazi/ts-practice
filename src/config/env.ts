import path from 'node:path';
import dotenv from 'dotenv';

/**
 * Loads `.env` from the project root once, at import time.
 *
 * `override: false` is deliberate: real environment variables (CI secrets,
 * shell exports) win over the local file, so the same code runs unchanged
 * on a laptop and in a pipeline.
 */
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: false });

export class MissingEnvVarError extends Error {
  constructor(name: string) {
    super(
      `Missing required environment variable "${name}". ` +
        `Copy .env.example to .env and fill it in, or export it in your shell/CI.`,
    );
    this.name = 'MissingEnvVarError';
  }
}

/** Reads a variable that the framework cannot run without. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new MissingEnvVarError(name);
  }
  return value.trim();
}

/** Reads an optional variable, falling back to a default. */
export function optionalEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value.trim() === '' ? fallback : value.trim();
}

function boolEnv(name: string, fallback: boolean): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1' || value === 'yes';
}

function intEnv(name: string, fallback: number): number {
  const parsed = Number.parseInt(optionalEnv(name, String(fallback)), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export type TestEnvName = 'stg' | 'qa';

/**
 * Non-secret run configuration. Safe to log.
 *
 * Note there are no URL defaults on purpose — an accidentally empty .env should
 * fail loudly at start-up rather than silently point tests at the wrong tier.
 */
export const env = {
  name: optionalEnv('TEST_ENV', 'stg') as TestEnvName,

  /* Origin only. The full login URL is composed in `urls.ts` so the theme and
     redirect target stay parameterised rather than baked into a string. */
  authBaseUrl: requireEnv('AUTH_BASE_URL'),
  authTheme: optionalEnv('AUTH_THEME', 'insight'),

  appBaseUrl: requireEnv('APP_BASE_URL'),
  headless: boolEnv('HEADLESS', true),
  slowMo: intEnv('SLOW_MO', 0),
  isCI: boolEnv('CI', false),
} as const;
