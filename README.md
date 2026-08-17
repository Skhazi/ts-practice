# ts-practice — Playwright + TypeScript UI automation

Automation framework for NETGEAR Insight, targeting the staging identity provider
(`auth-stg.netgear.com`) and the QA app (`pri-qa.insight.netgear.com`).

## Prerequisites

- Node.js 18 or later
- Corporate VPN (required to reach `pri-qa`)

## Setup

```bash
npm install          # installs deps and the Chromium browser
cp .env.example .env # then fill in the account values
```

`.env` is gitignored. Credentials never appear in source — tests ask for a
**role** (`standard`, `admin`) and the loader resolves it from the environment.
In CI, skip the file entirely and inject the same variables as masked secrets.

## Running

```bash
npm test                  # full suite, headless
npm run test:headed       # watch it drive a real browser
npm run test:ui           # Playwright UI mode, best for debugging
npm run test:auth         # just the auth specs
npm test -- --grep @smoke # by tag
npm run report            # open the last HTML report
```

Quality gates:

```bash
npm run typecheck
npm run lint
npm run format
```

## Structure

```
ts-practice/
├── playwright.config.ts        # timeouts, reporters, projects, trace policy
├── .env / .env.example         # secrets (gitignored) and their template
├── src/
│   ├── config/
│   │   ├── env.ts              # typed, validated non-secret settings
│   │   ├── urls.ts             # URL builders — no literal URL in a spec
│   │   └── credentials.ts      # lazy role -> account resolution + masking
│   ├── pages/                  # page objects — the only place selectors live
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   └── DashboardPage.ts
│   └── fixtures/
│       ├── pages.fixture.ts    # injects page objects into tests
│       └── auth.fixture.ts     # gives a pre-authenticated dashboard
└── tests/
    └── auth/
        ├── login.spec.ts
        └── logout.spec.ts
```

## Conventions

- **Selectors live in page objects only.** A spec that contains a CSS string is a
  bug. When the UI changes, exactly one file changes.
- **User-facing locators first** — `getByRole`, `getByLabel`, `getByTestId` —
  before CSS or XPath. They survive restyling and assert accessibility for free.
- **No hard waits.** `waitForTimeout` is banned by lint; use web-first
  assertions and `waitForURL`, which auto-retry.
- **No credentials in test code.** Specs name roles; `.env` holds values.
- **Steps over comments.** `test.step` blocks show up in the HTML report and
  trace viewer as a readable narrative.
- **Failures are debuggable.** Trace, screenshot and video are all retained on
  failure and discarded on success.

## Current state

| Spec | Status |
| --- | --- |
| `login.spec.ts` — valid login lands on `/dashboard` | passing |
| `login.spec.ts` — form rendering, password toggle, wrong password | passing |
| `logout.spec.ts` — login, log out, dashboard no longer reachable | passing |

Full suite green against the live environment (5 passed). Confirmed live
behaviours worth remembering:

- after login the app spins on `/` for several seconds before client-routing
  to `/dashboard` — dashboard readiness must use the navigation timeout
- both the header and side nav carry `aria-label="theme-logo"`; locators
  must scope to the banner
- the password toggle is named "Hide password" in the DOM
- logout redirects to the IdP login screen, and an unauthenticated visit to
  `/dashboard` bounces there too

## Next steps

- Reuse a signed-in `storageState` via a setup project so only the auth specs
  pay the login cost
- Add a GitHub Actions workflow (`npm ci` → `npx playwright test` → upload report)
- Add `@smoke` / `@regression` tagging as the suite grows
