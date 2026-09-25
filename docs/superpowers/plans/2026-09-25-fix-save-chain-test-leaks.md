# Fix Post-Test Save-Chain Leaks in Browser Tests — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the "Empty response from XRequest" unhandled-rejection flake class by (1) making MSW fallback handlers survive `resetMockWorker()`, (2) stopping per-file service-worker deregistration, (3) closing the async wait gaps in the 9 affected tests + 3 missing-interceptor tests.

**Architecture:** *(Tasks 1-2's key-shaped catch-all `Body: {XResponse: {}}` was SUPERSEDED by the addendum at the bottom of this file — the generic catch-all ships flat `Body: {}` resolving `undefined`.)* The root cause is a 4-part mechanism: save chains outlive tests → `afterEach(resetMockWorker())` wipes *all* runtime handlers including the SOAP catch-all → late requests passthrough to the dev server (empty body) → TanStack Form re-throws into a discarded promise (`onSave={() => form.handleSubmit()}`). We make late requests harmless (durable catch-alls answering `Body: {XResponse: {}}`), remove the shared-SW race, and make each affected test end on an ordered post-save signal (success snackbar / Save-button disappearance), following patterns already used in sibling tests.

**Tech Stack:** Vitest 5 browser mode (Playwright), MSW v2 (`^2.14.6`), TanStack Query/Form, React.

**Decision points (confirmed by user):**
1. **Durable catch-all vs enumerated mutation fallbacks** — catch-all (already exists in `vitest-browser-setup.ts`, just fragile); enumerated lists (58 actions!) rot.
2. **`stopMockWorker()` in per-file `afterAll`** — remove it; the browser teardown at run end handles it.
3. **Orphan fix (`form.handleSubmit().catch(...)` at `FormPageLayout` call sites)** — DEFERRED (production change, wide churn; invisible after fixes 1–3).

---

### Task 0: Save plan & branch

- [x] **Step 1:** Save this plan to `docs/superpowers/plans/2026-09-25-fix-save-chain-test-leaks.md`
- [x] **Step 2:** Branch: use existing `fix-more-flaky-tests` (already checked out, clean tree)

### Task 1: Failing regression test (catch-all must survive reset)

**Files:**
- Test: `apps/admin-ui-cos/tests/browser/soap-fallback.browser.test.tsx` (new — sits beside existing `apps/admin-ui-cos/tests/browser/` suite)

- [ ] **Step 1: Write the failing test**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/ui-shared';
import { expect, it } from 'vitest';

import { resetMockWorker } from 'admin-ui-test-utils';

it('answers SOAP requests with a valid empty envelope after resetMockWorker', async () => {
  resetMockWorker();
  // Simulates a request fired after test teardown wiped per-test handlers.
  // Must resolve with the standard empty response, not reject with
  // "Empty response from NoOpRequest" (passthrough to dev server).
  const response = await soapFetch('NoOp', {});
  expect(response).toEqual({});
});
```

- [ ] **Step 2: Run it — expect FAIL**

Run: `pnpm vitest run apps/admin-ui-cos/tests/browser/soap-fallback.browser.test.tsx`
Expected: FAIL — rejects with `Empty response from NoOpRequest` (unhandled by any handler after reset).

### Task 2: Make fallback handlers durable + return a proper envelope

**Files:**
- Modify: `packages/test-utils/src/browser/worker/index.ts:36-54` (defaultHandlers)

- [ ] **Step 1: Move the setup-file catch-alls into `defaultHandlers` with a response-key-aware SOAP catch-all**

Replace the `defaultHandlers` block with (keeps existing entries, adds the setup-file ones):

```ts
const soapCatchAllHandler = http.post('/service/admin/soap/:api', ({ params }) => {
  const action = String(params.api).replace(/Request$/, '');
  return HttpResponse.json({
    Body: {
      [`${action}Response`]: {},
    },
  });
});

const defaultHandlers = [
  http.get('/i18n/en.json', handleGetTranslations),
  http.get(/\[object%20Object\]/, () => new HttpResponse(null, { status: 200 })),
  http.post('/service/admin/soap/zextras', handleZextrasSoapAction),
  soapFallbackHandler('GetAccount'),
  soapFallbackHandler('GetInfo'),
  soapFallbackHandler('GetCos'),
  soapFallbackHandler('SearchDirectory'),
  http.get('/services/catalog/services', () => HttpResponse.json({ items: [] })),
  http.get(
    '/service/extension/zextras_admin/core/getAllServers',
    () => HttpResponse.json({ items: [] }),
  ),
  http.post('/service/admin/soap/GetAllServersRequest', () =>
    HttpResponse.json({ Body: { GetAllServersResponse: { server: [] } } }),
  ),
  http.post('/service/admin/soap/GetAllConfigRequest', () =>
    HttpResponse.json({ Body: { GetAllConfigResponse: {} } }),
  ),
  http.post('/service/admin/soap', zextrasSoapHandlerPassthrough),
  soapCatchAllHandler,
];
```

Where `zextrasSoapHandlerPassthrough` is a copy of the current `zextrasSoapHandler` from `vitest-browser-setup.ts:35-58` (the actions it handles: `listS3Connector`, `getHSMPolicy`, `listBuckets`, `getAllVolumes`, `get_global_config`). Note handler order matters: `zextras` and specific handlers **before** `soapCatchAllHandler` (MSW resolves first match). Keep `console.error` in `handleZextrasSoapAction` for unknown actions.

- [ ] **Step 2: Run the regression test — expect PASS**

Run: `pnpm vitest run apps/admin-ui-cos/tests/browser/soap-fallback.browser.test.tsx`
Expected: PASS

### Task 3: Clean up the browser setup file

**Files:**
- Modify: `vitest-browser-setup.ts:60-80,130-134`

- [ ] **Step 1:** Delete `setupBrowserCatchAllHandlers()` and its `beforeEach` call (now redundant — handlers live in defaults). `beforeEach` becomes just `resetMockWorker();`.
- [ ] **Step 2:** Remove `stopMockWorker();` from `afterAll` (worker/index.ts:78-80 — `worker.stop()` unregisters the origin-shared service worker while parallel files still run). Keep `clearQueryClients()`. Remove the now-unused `stopMockWorker` import.

- [ ] **Step 3: Sanity-run the cos app browser suite**

Run (from repo root): `pnpm vitest run apps/admin-ui-cos --project browser`
Expected: all pass, zero `Unhandled Errors`.

### Task 4: `cos-advanced.browser.test.tsx:475-490` (the hard race)

**Files:**
- Modify: `apps/admin-ui-cos/src/views/cos/tests/cos-advanced.browser.test.tsx:487-489`

- [ ] **Step 1:** After `await page.getByRole('button', { name: 'Save' }).click();` replace the sync-only assert with the sibling ordered wait (pattern at lines 362-364):

```tsx
      await page.getByRole('button', { name: 'Save' }).click();

      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
      expect(restoreToggleIcon()).toBe('ToggleLeftOutline');
```

- [ ] **Step 2: Run file** — `pnpm vitest run src/views/cos/tests/cos-advanced.browser.test.tsx` (workdir `apps/admin-ui-cos`). Expected: PASS.

### Task 5: `domain-disclaimer.browser.test.tsx` — 3 tests, missing `GetDomain`

**Files:**
- Modify: `apps/admin-ui-domains/src/views/details/domain-disclaimer/tests/domain-disclaimer.browser.test.tsx:126,152,173`

- [ ] **Step 1:** First read sibling test at lines 182-208 (the reference pattern).
- [ ] **Step 2:** In each of the 3 tests, register `const getDomainInterceptor = createBrowserSoapAPIInterceptor('GetDomain', <same mock as setup>);` alongside `FlushCache`, and after the body asserts add:

```tsx
      await expect.element(page.getByText('The change has been saved successfully')).toBeVisible();
```

- [ ] **Step 3: Run file** — `pnpm vitest run src/views/details/domain-disclaimer/tests/domain-disclaimer.browser.test.tsx` (workdir `apps/admin-ui-domains`). Expected: PASS.

### Task 6: `edit-distribution-list` (2) + `domain-virtual-host` (1)

**Files:**
- Modify: `apps/admin-ui-domains/src/views/manage/mailing-list/tests/edit-distribution-list.browser.test.tsx:259,272`
- Modify: `apps/admin-ui-domains/src/views/details/virtual-hosts-certificates/tests/domain-virtual-host.browser.test.tsx:128`

- [ ] **Step 1:** DL tests (259, 272): after the sync body assert add the sibling wait (pattern at 243-245): `await expect.element(page.getByText('The changes have been saved')).toBeVisible();`
- [ ] **Step 2:** Virtual-host test (128): after body asserts add (pattern at sibling 161-164): `await expect.element(page.getByText('The change has been saved successfully')).toBeVisible();`
- [ ] **Step 3: Run both files** (workdir `apps/admin-ui-domains`). Expected: PASS.

### Task 7: `domain-gal-settings.browser.test.tsx` — 2 tests, missing interceptors

**Files:**
- Modify: `apps/admin-ui-domains/src/views/details/domain-gal-settings/tests/domain-gal-settings.browser.test.tsx:381,498`

- [ ] **Step 1:** Read sibling reference (lines 298-336) first.
- [ ] **Step 2:** Test at 381: add `createBrowserSoapAPIInterceptor('FlushCache', {});`
- [ ] **Step 3:** Test at 498: add `createBrowserSoapAPIInterceptor('FlushCache', {});`, `createBrowserSoapAPIInterceptor('ModifyAccount', {});`, `createBrowserSoapAPIInterceptor('ModifyDataSource', {});`
- [ ] **Step 4:** Both tests: after body asserts add `await expect.element(page.getByText('The change has been saved successfully')).toBeVisible();`
- [ ] **Step 5: Run file.** Expected: PASS.

### Task 8: `global-white-label.browser.test.tsx:114`

**Files:**
- Modify: `apps/admin-ui-domains/src/views/global/global-white-label/tests/global-white-label.browser.test.tsx:114-123`

- [ ] **Step 1:** After body asserts add sibling wait (pattern 136-138): `await expect.element(page.getByText('The change has been saved successfully')).toBeVisible();`
- [ ] **Step 2: Run file.** Expected: PASS.

### Task 9: Document the conventions

**Files:**
- Modify: `AGENTS.md` (Avoiding Flaky Tests section)
- Modify: `docs/browser-test-conventions.md`

- [ ] **Step 1:** Add rule: "Every Save test must end on an ordered post-save signal (success snackbar or Save-button disappearance) — awaiting only the interceptor promise leaves FlushCache + invalidation refetch in flight past teardown."
- [ ] **Step 2:** Add: "SOAP catch-alls live in `defaultHandlers` (worker/index.ts) and survive `resetMockWorker()`. Never rely on requests being unhandled; per-test interceptors always take precedence."

### Task 10: Verification

- [ ] **Step 1:** Stress-loop the two affected apps:

```bash
for i in 1 2 3 4 5; do
  (cd apps/admin-ui-cos && pnpm test) 2>&1 | grep -E "Unhandled|Errors  [1-9]" && echo "COS RUN $i FAILED" || echo "COS RUN $i OK"
  (cd apps/admin-ui-domains && pnpm test) 2>&1 | grep -E "Unhandled|Errors  [1-9]" && echo "DOMAINS RUN $i FAILED" || echo "DOMAINS RUN $i OK"
done
```

Expected: all runs OK, zero unhandled errors (baseline was ~1 per run).

- [ ] **Step 2:** `pnpm type-check && pnpm lint` (root). Expected: clean.
- [ ] **Step 3:** Commit per task completed above (conventional commits, e.g. `test: make msw soap catch-all survive resetMockWorker`).

---

## Background (root cause analysis, for executors' context)

CI reported: `Error: Empty response from ModifyCosRequest` at `packages/ui-shared/src/network/fetch.ts:116`, attributed to `apps/admin-ui-cos/src/views/cos/tests/cos-features.browser.test.tsx` after test "should send ModifyCos with multiple toggled attributes". All 480 tests passed — this is a vitest-level unhandled rejection, not a test failure.

Mechanism (4 cooperating defects):

1. **Save chains outlive tests.** Tests await only the request-body promise (`await modifyCosPromise`), which resolves when MSW *receives* the request — the app then continues `ModifyCos` → `onSuccess: await flushCache(...)` → `invalidateQueries` → refetch → `form.reset()`. In `cos-advanced.browser.test.tsx:487` nothing async is awaited at all.
2. **afterEach wipes handlers mid-flight.** `vitest-browser-setup.ts` registers a SOAP catch-all via `worker.use()` in `beforeEach`, but each test file's `afterEach(() => resetMockWorker())` calls `worker.resetHandlers(...defaultHandlers)` — wiping the catch-all too. Late requests in the teardown gap hit only `defaultHandlers` (which cover no mutations) → passthrough to the vite dev server → empty body → `Error: Empty response from XRequest` (fetch.ts:112-117, added by PR #1389 which relabeled the old SyntaxError without fixing the leak).
3. **The rejection is orphaned.** TanStack Form `_handleSubmit` **re-throws** onSubmit errors (`node_modules/@tanstack/form-core/dist/esm/FormApi.js:599`) and `FormPageLayout` usage `onSave={() => form.handleSubmit()}` discards the promise → unhandled rejection.
4. **Attribution is misleading.** `fileParallelism: true, maxWorkers: 8, isolate: true` — files run as parallel iframes in one browser/origin sharing one MSW service worker; vitest attributes rejections to the file *running when caught*, not the source. Additionally root `afterAll` calls `stopMockWorker()` → `worker.stop()` unregisters the origin-shared service worker while parallel files still run.

Site survey (verified by explore agent): 1 HARD-RACE (cos-advanced:487), 8 SOFT-LEAKS (global-white-label:114, domain-disclaimer:126/152/173, edit-distribution-list:259/272, domain-gal-settings:381/498, domain-virtual-host:128), missing interceptors: GetDomain (domain-disclaimer ×3), FlushCache (domain-gal-settings ×2), ModifyAccount + ModifyDataSource (domain-gal-settings:498). The other 11 flagged sites were false positives.

---

# Addendum (2026-09-25, post-CI round 2): flat-body catch-all revert

CI round 2 on this branch surfaced `TypeError: Cannot read properties of undefined (reading '0')` at `create-new-cos-legacy.tsx:41` inside RQ onSuccess. Root cause: Task 2's key-derived catch-all (`Body:{XResponse:{}}`) changed late-request resolution from `undefined` (pre-branch flat `{Body:{}}`, which component code is written against — e.g. `data?.cos[0]`) to `{}` — `data?.cos[0]` then crashes. The leaking test (`create-new-cos-legacy.browser.test.tsx:255`) awaits only pre-existing elements (vacuous waits); under load its SW interception lands post-wipe on the catch-all.

## Task A+D: revert `soapCatchAllHandler` to flat `{Body: {}}`; regression test asserts resolution to `undefined`; docs updated (AGENTS.md rule 7 + conventions doc).
## Task B: network-error test awaits ordered error snackbar ('Failed to fetch').
## Task C: broadened survey — all mutation-triggering buttons (Create/Confirm/Delete/Add/OK/Update/Remove/…), vacuous awaits, HttpResponse.error()/Fault handlers; fix hard races.
## Task E: stress verification + final review.
