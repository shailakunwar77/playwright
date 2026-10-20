# Playwright TypeScript E2E framework

A runnable browser automation framework with a local workspace demo. It includes
saved login state, typed fixtures, page objects, test data, HTML reports, screenshots
and traces on failure, and a GitHub Actions workflow.

## Quick start

Use Node.js 24 (the version used by CI).

```sh
npm ci
npx playwright install --with-deps chromium
npm run typecheck
npm test
```

Playwright starts the demo server, logs in once, saves browser storage, runs the
specs with two workers, and stops the server. You do not need to start it yourself.
The suite includes **18 feature tests plus one authentication setup test**.

For the existing Codex cloud environment:

```sh
export npm_config_cache=/workspace/.npm-cache
export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
cd /workspace/playwright
npm ci
npm run typecheck
npm test
```

Cloud browser downloads are blocked by the current network policy. Installed
Chromium 154 was tested with Playwright 1.64.1. Local and CI installations use
Playwright's matching browser by default. Do not assume every browser version
is compatible; rerun the suite after upgrading either dependency.
Each cloud task already has an isolated checkout; do not create a Git worktree
unless explicitly requested.

## Project layout

```text
demo/
  server.cjs                 Local HTTP server, session auth, uploads and email outbox
  public/                   Accessible demo UI
fixtures/test.fixture.ts    Typed, test-scoped page objects and test data
pages/                      Login, workspace, directory, preferences, files, invitations
utils/
  environment.ts            Local target, auth storage path and public demo credentials
  test-data.ts              Unique test email generator and expected directory data
  mailbox.ts                Authenticated test outbox client with polling
tests/
  auth/auth.setup.ts        UI login and storageState generation
  data/attachment.txt       Upload fixture
  specs/                    Feature specifications
playwright.config.ts        Project dependencies, reports and managed server
.github/workflows/          CI install, type check, tests and report artifact
```

## Coverage

| Feature | Checks |
| --- | --- |
| Authentication | Protected page/API access, invalid credentials, login, reload, logout |
| Saved login | Setup project writes ignored storage state; fresh contexts reuse it |
| Data table | Exact displayed records and cross-page completeness |
| Search | Name, email, department, case-insensitivity, empty results, reset |
| Sorting | Ascending/descending across all pages and sorting with search |
| Pagination | First/last boundaries, partial last page, previous/next, search reset |
| Modal dialogs | Open, cancel, reset, validation errors and successful submit |
| Radio button | Select and verify exclusive contact method |
| Single/multiple select | Submit values, replace selections and clear selections |
| Download | Wait for download, save per test, verify filename and CSV contents |
| Upload | Submit actual file bytes to the server; verify stored bytes and UI preview |
| Email | Generate a unique address, submit invitation, poll outbox, verify message |

## Authentication and fixtures

`setup` runs `tests/auth/auth.setup.ts` before the Chromium specs. The setup logs
in through the UI and writes cookies/local storage to `playwright/.auth/user.json`.
That folder is ignored by Git. Each feature test receives a fresh browser context
seeded with that storage, rather than sharing pages between tests.

Authentication specs override storage with an empty state to test login and logout
without invalidating the shared session. A fresh server and fresh authentication
setup are created for each run, so stale sessions are not reused. Do not skip project
dependencies when running specs against a newly started demo server.

Import `test` and `expect` from `fixtures/test.fixture.ts` in feature specs:

```ts
import { test, expect } from '../../fixtures/test.fixture';

test('search for a teammate', async ({ workspace, directory }) => {
  await workspace.goto();
  await directory.search('Aisha');
  await expect(directory.rows).toHaveCount(1);
  await expect(directory.rows.first()).toContainText('Aisha Khan');
});
```

Page objects own locators and actions; specs own business assertions. Locators use
roles and labels, with scoped CSS for table cells and file preview. Playwright's
assertions and action auto-waiting replace fixed sleeps. Mailbox checks use polling.
Downloads and generated files use `testInfo.outputPath()` to avoid worker collisions.

## Demo application

For manual exploration, run `npm run demo` and open the local application in your
browser. Stop it before running tests: the test runner deliberately refuses to reuse
an existing server to avoid stale state or a different application.

Public demo credentials: `tester@example.test` / `DemoPassword123!`.
These credentials belong only to this local test fixture.

The table has 12 deterministic records and a page size of five. Search matches
name, email or department; sorting applies to all filtered records before pagination.
CSV export includes all filtered rows in the current sort order.
Preferences are page-local and reset on reload. Uploads accept `.txt` and `.csv`
files up to 1 MB and are stored in server memory, scoped to the authenticated session.
This demo is a test target, not a production authentication or file-storage service.

### Generated email and local outbox

`generateEmail()` produces UUID-based addresses under the reserved `example.test`
domain. The invitation modal posts to the server, which creates a message in its
in-memory outbox. Tests read the authenticated outbox API and assert the recipient,
subject and body. **No SMTP service is used and no real email is delivered.**
For a real application, replace `Mailbox` with an adapter for its test email provider.
Session state, uploaded files and email messages are discarded when the demo stops.
Unique recipients keep parallel tests isolated; mutating account data in a real app
should use dedicated accounts per worker and explicit cleanup fixtures.

## Commands and configuration

| Command | Purpose |
| --- | --- |
| `npm test` | Run authentication setup and all feature specs |
| `npm run typecheck` | Strict TypeScript check |
| `npm run test:auth` | Authentication specs, including setup dependency |
| `npm run test:directory` | Directory specs, including setup dependency |
| `npm run test:ci` | Full suite with two workers; CI also enables retries |
| `npm run test:headed` | Headed browser; requires a graphical display |
| `npm run test:ui` | Playwright UI mode; requires a graphical display |
| `npm run report` | Inspect the generated HTML report locally |

`DEMO_PORT` changes the local port (default `3000`). Set it for both manual server
and test commands if needed: `DEMO_PORT=3100 npm test`. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`
optionally selects an installed Chromium executable. Otherwise Playwright uses its
own downloaded browser. To change the target to a real website, adapt the page
objects, authentication setup, configuration and test data; changing a URL alone
will not make these demo-specific specs apply to a different UI.

Failures produce screenshots and traces in `test-results/`; reports are in
`playwright-report/`. Use `npx playwright show-trace <trace.zip>` locally to inspect
a failed run. Storage state and traces can contain authentication data; do not
commit them. CI retains the HTML report for seven days. The workflow is supplied
in the repository; running the local suite does not establish a passing GitHub run.
