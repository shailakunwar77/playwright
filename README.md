# Playwright starter

A minimal TypeScript project for browser tests using Chromium.
Requires Node.js 20 or newer (Node.js 24 recommended).

## Setup

```sh
npm ci
npx playwright install --with-deps chromium
```

## Run tests

```sh
npm test
```

The included smoke test renders a local HTML page and checks a button interaction.
It requires no external website, credentials, or running application server.
Add application tests under `tests/` and configure a base URL and web server in
`playwright.config.ts` when needed.

Use `npm run test:headed` or `npm run test:ui` on a machine with a display.
Use `npm run report` to inspect the HTML report locally.

In Codex cloud, use the existing checkout at `/workspace/playwright`; each task
already has an isolated environment, so no additional Git worktree is needed.
Set `npm_config_cache=/workspace/.npm-cache` and
`PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright` before setup and tests
when the home directory is not writable.

If Chromium is already installed, skip the browser download and use:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
```

The cloud environment uses this installed Chromium option. For local development,
Playwright's downloaded Chromium is the default and provides its matched browser version.
