import { requireEnv } from './env';

/**
 * Roles a test can ask for. Add a role here plus its two env vars in
 * `.env.example` — tests never name an account directly.
 */
export type UserRole = 'standard' | 'admin';

export interface UserCredentials {
  readonly role: UserRole;
  readonly email: string;
  readonly password: string;
}

const ENV_VAR_BY_ROLE: Record<UserRole, { email: string; password: string }> = {
  standard: { email: 'STANDARD_USER_EMAIL', password: 'STANDARD_USER_PASSWORD' },
  admin: { email: 'ADMIN_USER_EMAIL', password: 'ADMIN_USER_PASSWORD' },
};

/**
 * Resolves credentials lazily, at the moment a test asks for them.
 *
 * Lazy on purpose: an unused role with blank env vars must not stop the whole
 * suite from loading. Only the role a test actually requests is validated.
 */
export function getCredentials(role: UserRole): UserCredentials {
  const vars = ENV_VAR_BY_ROLE[role];
  return {
    role,
    email: requireEnv(vars.email),
    password: requireEnv(vars.password),
  };
}

/**
 * Masks a secret for safe use in test titles, logs and trace annotations.
 * `maskSecret('Password1@123456')` -> 'Pa************56'
 */
export function maskSecret(value: string): string {
  if (value.length <= 4) return '*'.repeat(value.length);
  return `${value.slice(0, 2)}${'*'.repeat(value.length - 4)}${value.slice(-2)}`;
}
