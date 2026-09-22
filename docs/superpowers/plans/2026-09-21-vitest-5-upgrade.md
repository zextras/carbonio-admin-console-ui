# CO-4288: Upgrade Admin Console test toolchain to Vitest 5 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the monorepo from Vitest 4.1.11 to Vitest 5.0.1 (all `@vitest/*` packages in lockstep), adopt the new strict browser-locator default, and fix all test fallout — no behavior change to shipped code.

**Architecture:** Single shared test config (`vitest.config.base.ts`) with two inline projects (`unit` jsdom, `browser` Playwright), merged per-app via `vitest.config.mjs`. Dependency bumps across 15 workspace `package.json` files; config adjustments centralized; test fixes distributed per app.

**Tech Stack:** Vitest 5.0.1, @vitest/browser 5.0.1, @vitest/browser-playwright 5.0.1, @vitest/browser-preview 5.0.1, @vitest/coverage-istanbul 5.0.1, @vitest/ui 5.0.1, vitest-browser-react 2.3.0, Vite 8.2.2 (peer), Playwright 1.61, Node 24 (`.nvmrc`), pnpm 11 + Turbo.

**Ticket:** https://zextras.atlassian.net/browse/CO-4288

## Decisions (confirmed with user)

1. **Locator strictness:** adopt v5 strict `exact: true` default and fix every failing call site (no compat flag).
2. **CI:** `jenkins-lib-common` `uiPipeline` is external and out of scope; repo-side baselines (Node 24 `.nvmrc`, engines >=24.15.0, Vite 8.2.2) already satisfy Vitest 5 prerequisites.

## Verified-safe (no action needed — from exploration)

Zero exposure to: `.sequential` removal, benchmark API rewrite, removed `vitest/*` entrypoints (only `vitest/browser`, `vitest/config` used), `@vitest/expect`/`@vitest/runner`/`@vitest/ws-client` direct imports, custom matchers / `Assertion<>` augmentation, coverage thresholds, `toThrow('')`, `Temporal`, `VITEST_WORKER_ID`/`POOL_ID`, `toMatchScreenshot`/`__screenshots__` refs, nested `vi.mock` (indent scan), `test.for`/snapshot titles, `vi.fn(Class)`, factory-less `vi.mock` in browser tests, `browser.api` config, `testNamePattern` in CI/scripts. `clearMocks: true` already explicit in both projects.

**Real exposure:** (1) strict locator default — ~4,000 call sites without explicit `exact` (1,046 pass `exact: true`, 4 pass `exact: false`); (2) `toHaveTextContent` strict equality — 11 sites; (3) inline-project inheritance (`extends: true` default) — likely benign, verify; (4) `expect.poll` timeout strictness — 46 sites; (5) `vite` becomes required peer — only `admin-ui-bootstrap` declares it; (6) failure screenshots move to `.vitest/attachments/failure-screenshots/`.

---

### Task 1: Bump dependencies in all 15 workspace package.json files

**Files (Modify):** `package.json`, `apps/{admin-ui-backup,admin-ui-bootstrap,admin-ui-cos,admin-ui-dashboard,admin-ui-domains,admin-ui-legalhold,admin-ui-mta,admin-ui-notifications,admin-ui-operations,admin-ui-privacy,admin-ui-storage,admin-ui-subscription}/package.json`, `packages/{test-utils,ui-shared}/package.json`

- [ ] **Step 1: Apply exact string replacements** in every file listed (only where the entry exists). Use Edit with `replaceAll` per mapping; full key+value strings so nothing else is touched:

| Old | New |
|---|---|
| `"vitest": "^4.1.0"` | `"vitest": "^5.0.1"` |
| `"@vitest/browser": "^4.1.0"` | `"@vitest/browser": "^5.0.1"` |
| `"@vitest/browser-playwright": "^4.1.0"` | `"@vitest/browser-playwright": "^5.0.1"` |
| `"@vitest/browser-preview": "^4.1.0"` | `"@vitest/browser-preview": "^5.0.1"` |
| `"@vitest/coverage-istanbul": "^4.1.0"` | `"@vitest/coverage-istanbul": "^5.0.1"` |
| `"@vitest/ui": "^4.1.0"` | `"@vitest/ui": "^5.0.1"` |
| `"vitest-browser-react": "^2.2.0"` | `"vitest-browser-react": "^2.3.0"` |

Entry inventory per file (verified):
- **root**: all 6 `@vitest/*` + `vitest` + `vitest-browser-react`
- **admin-ui-backup, cos, domains, legalhold, mta, notifications, operations, privacy, storage, subscription**: `@vitest/browser`, `@vitest/browser-preview`, `@vitest/coverage-istanbul`, `@vitest/ui`, `vitest`, `vitest-browser-react`
- **admin-ui-bootstrap**: same minus `@vitest/ui`
- **admin-ui-dashboard**: `@vitest/browser`, `@vitest/coverage-istanbul`, `@vitest/ui`, `vitest`, `vitest-browser-react` (no browser-preview)
- **packages/test-utils**: `@vitest/browser`, `vitest`, `vitest-browser-react`
- **packages/ui-shared**: `@vitest/browser`, `@vitest/browser-preview`, `@vitest/coverage-istanbul`, `vitest`, `vitest-browser-react` (no `@vitest/ui`)

- [ ] **Step 2: Add `vite` as explicit root peer** — vitest 5 no longer bundles Vite. In root `package.json` devDependencies add (sorted after `"@typescript/native"`):
```json
    "vite": "^8.2.2",
```

- [ ] **Step 3: Install and verify resolution**

Run: `pnpm install`
Expected: lockfile updated, no unmet-peer warnings.

Run: `rg -o "'(vitest|@vitest/[a-z-]+|vitest-browser-react)@[^']*'" pnpm-lock.yaml | sort -u`
Expected: all `vitest`/`@vitest/*` at `5.0.1`; `vitest-browser-react@2.3.x`; zero `4.1.11` remnants.

### Task 2: Update `.gitignore` for the `.vitest` artifact directory

**Files (Modify):** `.gitignore:65,77`

- [ ] **Step 1:** Replace the two stale entries:
```
**/__screenshots__/**
**/.vitest-attachments
```
with:
```
**/.vitest/
```
(v5 consolidates failure screenshots, blob reports, HTML/JSON/JUnit output under `.vitest/`; coverage stays under `/coverage`, already ignored.)

- [ ] **Step 2: Commit dependency + config groundwork**
```bash
git add -A
git commit -m "chore(deps): upgrade vitest to v5 across all workspaces"
```

### Task 3: Type-check and lint the upgraded toolchain

- [ ] **Step 1:** Run `pnpm type-check` — Expected: PASS (validates `vitest.config.base.ts` and `admin-ui-bootstrap` post-merge projects mutation against v5 types).
- [ ] **Step 2:** Run `pnpm lint` — Expected: PASS.
- [ ] **Step 3:** If inline-project type errors appear (v5 excludes `projects` from inline `ProjectConfig` type), keep `projects` only at root-config level in `vitest.config.base.ts` (already the case) — no change anticipated.

### Task 4: Smoke test one app on v5

- [ ] **Step 1:** Ensure Playwright chromium is installed locally: `pnpm exec playwright install chromium` (skip if present).
- [ ] **Step 2:** Run the smallest app: `pnpm vitest run apps/admin-ui-notifications --reporter=verbose`
Expected: `unit` and `browser` projects start on v5 (banner `v5.0.1`); note any startup-level config errors (see Task 5 contingency).

### Task 5: Full suite run and systematic triage (strict locators adopted)

- [ ] **Step 1:** Run everything: `pnpm test` (turbo). Capture the failure list. Local runs have `retry: 0` and `screenshotFailures: true` — failures land in `.vitest/attachments/failure-screenshots/`; `HEADED=true pnpm test:headed -- <file>` for interactive debugging.
- [ ] **Step 2: Fix failures by category**, app by app (re-run per app after fixes: `pnpm vitest run apps/<app>`):
  - **Strict locators** (expected bulk): for each failing `getByText` / `getByRole({ name })` / `getByLabelText` / `getByPlaceholderText` / `getByTitle`:
    1. Preferred: use the element's full exact string (suite already leans exact — 1,046 sites pass `exact: true` explicitly).
    2. If partial/case-insensitive match is intentional: pass `{ exact: false }` on that locator (existing precedent: 4 call sites) or a regex (`getByText(/partial/i)`).
    3. Never blanket-disable strictness — the decision is to adopt it.
  - **`toHaveTextContent` partial/regex matches** (11 known sites: `notifications-list-panel.browser.test.tsx:159,197`; `app-view-container.browser.test.tsx:87`; `shell-primary-bar.browser.test.tsx:59`; dashboard `app-view.browser.test.tsx:197,209`; `breadcrumb-menu.browser.test.tsx:41`; `LicenseBanner.browser.test.tsx:118`; `cos-quotas-new.browser.test.tsx:277,280,284`): switch to `toMatchTextContent(...)` keeping the same argument; keep `toHaveTextContent` only for full-string matches.
  - **Unawaited async assertions** (`expect(...).resolves/.rejects` without `await` — now hard failures): add `await`.
  - **`expect.poll` timeouts** (46 sites): raise `timeout` option or make the polled work settle; never swallow with try/catch.
  - **Any "defined outside of the module's top level scope" hoisting errors**: move the offending `vi.mock`/`vi.hoisted` to module top level.
- [ ] **Step 3 (contingency — config-level fallout only):** if inline-project inheritance (`extends: true` default) causes duplicated `setupFiles`, unexpected include/exclude merging, or the `admin-ui-bootstrap` projects mutation misbehaves, add `extends: false` to the affected inline project in `vitest.config.base.ts`. If a plugin misbehaves from single instantiation (`sharedViteServer` default), set `sharedViteServer: false` in those project configs. Both restore exact v4 resolution semantics.
- [ ] **Step 4: Commit test fixes**, split per app, e.g.:
```bash
git commit -m "test(domains): adapt browser tests to vitest 5 strict locator matching"
```

### Task 6: CI-equivalent verification

- [ ] **Step 1:** Run `pnpm test:ci` — Expected: PASS; `coverage/lcov.info` still generated (istanbul provider) and `scripts/strip-lcov-branches.ts` succeeds.
- [ ] **Step 2:** Run `pnpm type-lint` — Expected: PASS.
- [ ] **Step 3:** Spot-check `pnpm build` — Expected: PASS (toolchain-only change).

### Task 7: Final report / PR notes

- [ ] **Step 1:** PR description must call out (no doc files exist to update; AGENTS.md has no version-specific content):
  - Vitest 4.1.11 → 5.0.1 (all `@vitest/*` lockstep; `vitest-browser-react` → 2.3.0; explicit root `vite` peer).
  - Strict locator default adopted (per decision); `toHaveTextContent` → `toMatchTextContent` where partial matching was intended.
  - `vitest --ui` now requires the token-authenticated URL printed at startup (DX note for `test:watch`).
  - Failure screenshots now under `.vitest/attachments/failure-screenshots/`.
  - CI: `jenkins-lib-common` `uiPipeline` verified compatible from the repo side (Node 24, Vite 8) — CI-internal changes out of scope.
