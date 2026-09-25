# Browser Test Conventions

Quick reference for writing browser tests (`.browser.test.tsx`) in this repo's admin apps.
Applies to all apps that use `admin-ui-test-utils` (cos, domains, storage, backup, …).

## Imports

```tsx
import {
  createBrowserSoapAPIInterceptor,
  resetMockWorker,
  setupBrowserTest,
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
```

- `describe` / `it` / `expect` / `vi` come from `vitest` (globals are also enabled, but explicit imports are the norm).
- `page` and `userEvent` come from **`vitest/browser`** (Vitest's browser-context page, backed by Playwright locators).
- `setupBrowserTest` and helpers come from **`admin-ui-test-utils`**.

## Rendering

Browser tests do **not** call `render()` directly. Use `setupBrowserTest(ui, options)`, which wraps `vitest-browser-react`'s `render` with the full provider tree (QueryClient, Snackbar, i18n, Modal, Router).

```tsx
async function setupMyTest(): Promise<void> {
  await setupBrowserTest(
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/my-route" element={<MyComponent />} />
    </Routes>,
    { initialRouterEntry: '/my-route' },
  );
  // Always wait for a key element to be visible before further assertions.
  await expect.element(page.getByText('Title')).toBeVisible();
}
```

Options: `{ initialRouterEntry?, queryClient?, withDomainIdRoute? }`.

## `admin-ui-test-utils` exports

- **Render/providers:** `setupBrowserTest`, `getQueryClient`, `LocationDisplay`.
- **Rights seeding (when the view needs them):** `grantUserCosRights(queryClient)`, `grantUserConfigRights(queryClient)`, `setupAccount(queryClient)`.
- **SOAP mocking:** `createBrowserSoapAPIInterceptor<Req, Res>(apiAction, response?)` → resolves with the request body; `createBrowserZextrasActionInterceptor(action, responseFactory)`; `delayedSoapApiForBrowser`.
- **MSW workers:** `worker`, `resetMockWorker`. The **global worker lifecycle is auto-wired** (`vitest-browser-setup.ts` starts it once per file and resets it in `beforeEach` via `resetMockWorker()`; it is never stopped per file — see [Durable SOAP catch-alls](#durable-soap-catch-alls)). You only need to call `resetMockWorker()` in your own `afterEach` if you add custom handlers.

## Locating elements (priority order)

1. `page.getByRole('textbox' | 'button' | 'switch', { name: '…' })` — preferred.
2. `page.getByLabelText('…')`.
3. `page.getByText('…')` / `page.getByPlaceholder('…')` — fallback.

**Never use `getByTestId`** (AGENTS.md rule — couples tests to implementation details).

**Accessibility note:** the Zextras `Input` component renders `<label htmlFor={id}>` from its `label` prop, and `Button` uses its `label` prop as the accessible name. So `getByRole('textbox', { name: 'Cos Name' })` resolves to the input whose `label="Cos Name"`.

## Interactions

```tsx
await userEvent.fill(page.getByRole('textbox', { name: 'Cos Name' }), 'mycos');
await userEvent.clear(input);
await userEvent.type(input, '256');           // append / per-key
await userEvent.click(page.getByRole('switch', { name: 'Enable X' }));
await page.getByRole('button', { name: 'Save' }).click();
```

## Assertions (all awaited)

```tsx
await expect.element(page.getByText('Title')).toBeVisible();
await expect.element(page.getByText('Title')).toBeInTheDocument();
await expect.element(input).toHaveValue('value');
await expect.element(button).toBeDisabled();
await expect.element(button).not.toBeDisabled();   // or .toBeEnabled()
await expect.element(switchEl).toBeChecked();
await expect.element(switchEl).not.toBeChecked();
```

## Lifecycle hooks

```tsx
describe('MyComponent', () => {
  beforeEach(() => { vi.resetAllMocks(); });
  afterEach(() => { resetMockWorker(); }); // only needed if you add custom MSW handlers
});
```

## MSW: happy path vs errors

```tsx
// Happy path (resolves with the request body)
const reqPromise = createBrowserSoapAPIInterceptor('CreateCos', mockResponse);

// Custom error
worker.use(
  http.post('/service/admin/soap/CreateCosRequest', () =>
    HttpResponse.json({ Body: { Fault: { Reason: { Text: 'Server error' } } } }, { status: 500 }),
  ),
);
```

## Save flows: end on an ordered post-save signal

A click on Save starts a chain that outlives the request assertion: mutation → `FlushCache` →
`invalidateQueries` → refetch → `form.reset()`. `await modifyCosPromise` (the interceptor
promise) resolves when MSW *receives* the mutation — everything after it is still in flight.
If the test ends there, `resetMockWorker()` and iframe teardown race the remaining requests
into unhandled rejections attributed to whichever file runs next.

End every Save test on a UI signal that is only reachable **after the whole chain completed**:

```tsx
await page.getByRole('button', { name: 'Save' }).click();

// success snackbar — labels are app-specific, match the real one:
await expect.element(page.getByText('The change has been saved successfully')).toBeVisible();
// and/or the actions disappearing (form is pristine again):
await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
```

Snackbar labels in this repo: `Changes have been saved successfully` (cos), `The change has
been saved successfully` (domains/config views), `The changes have been saved` (mailing lists).

### Saved-state refetch handlers

When the save invalidates a query the form is built from, the post-save refetch must return
the **saved** values. If the seed handler keeps answering with the pre-save state, the refetch
reinstates stale defaults, the form stays dirty, and the Save-hidden wait never converges.
Concrete patterns in the codebase:

- `apps/admin-ui-cos/src/views/cos/tests/cos-advanced.browser.test.tsx` — re-registers the
  extension attributes GET with the saved value (`mockGetCoreAttributes(false)` before the
  Save click), then ends on the Save-hidden wait.
- `apps/admin-ui-domains/src/views/details/domain-disclaimer/tests/domain-disclaimer.browser.test.tsx`
  — registers `GetDomain` with the saved disclaimer attributes alongside `FlushCache`, then
  asserts snackbar + Save-hidden.
- `apps/admin-ui-domains/src/views/details/domain-gal-settings/tests/domain-gal-settings.browser.test.tsx`
  — stateful server: one mutable variable (`galPollingInterval`) is flipped by the
  `ModifyAccount` interceptor when it observes the saved payload, and the `GetAccount`
  handler reads the variable on each refetch.

**Ordering rule: register saved-state refetch handlers AFTER `setupBrowserTest`/render.**
Handlers registered before the render are also what the initial mount fetches see — the form
mounts already-clean on the saved state and the dirty-state scenario silently weakens. The
gal-settings tests register their saved-state handlers immediately after `setupAndRender()`
(the inline comments there flag this ordering). Suites that seed the cache synchronously via
`setQueryData` (like `domain-disclaimer`) have no mount fetch, so the ordering does not apply
there and registering before render is fine.

## Durable SOAP catch-alls

Shared MSW fallbacks live in `defaultHandlers` in `packages/test-utils/src/browser/worker/index.ts`:

- SOAP fallbacks: `GetAccount`, `GetInfo`, `GetCos`, `SearchDirectory`
- explicit SOAP handlers: `GetAllServers`, `GetAllConfig` (+ the `getAllServers` extension
  endpoint and `/services/catalog/services`)
- canned zextras actions at `/service/admin/soap/zextras` (`listS3Connector`, `getHSMPolicy`,
  `listBuckets`, `getAllVolumes`, `get_global_config`, …)
- a lenient bare `/service/admin/soap` handler
- a generic `/service/admin/soap/:api` catch-all answering flat `Body: {}` (resolving to
  `undefined`, the shape component code assumes — a defined-but-empty `{}` payload crashes
  `data?.x[0]`-style success callbacks); only the explicit named fallbacks above return
  key-shaped `Body: {XResponse: {}}`

`resetMockWorker()` resets *to* `defaultHandlers` (`worker.resetHandlers(...defaultHandlers)`),
so the catch-alls survive every reset **on purpose**: requests leaked past test teardown get a
valid empty envelope instead of passthrough-to-dev-server empty-body errors
(`Empty response from XRequest`). `apps/admin-ui-cos/tests/browser/soap-fallback.browser.test.tsx`
is the regression guard — it calls `resetMockWorker()` and then asserts a SOAP request still
resolves.

Consequences:

- **Never rely on a request being unhandled.** Per-test interceptors from
  `createBrowserSoapAPIInterceptor` / `worker.use()` are prepended and always take precedence
  over the defaults.
- **A forgotten in-test handler fails silently.** A SOAP request with no matching handler
  resolves `undefined` via the catch-all — it will NOT fail loudly. If a test seems to pass
  while its component gets empty data, check for a missing interceptor.
- **When adding a named key-shaped fallback** (`Body: {XResponse: {}}`), `data` resolves `{}`
  (not undefined) — every consumer must fully optional-chain (`data?.x?.[0]`, never
  `data?.x[0]`); an unguarded index access crashes success callbacks.
- **Extend `defaultHandlers`** (specific handler or fallback) rather than registering
  catch-alls per-test when a new API leaks past test ends.
- **Never stop the worker per file.** No `worker.stop()` / service-worker teardown in per-file
  `afterAll`: files run as parallel iframes sharing one origin-scoped service worker, and
  unregistering it breaks every file still running. The browser teardown at run end handles it.

## TanStack (`@tanstack/react-form`) tests

- For component-level tests, render the real component via `setupBrowserTest`. For field-level tests, use a small `Wrapper` harness that calls `useForm` and renders the field + a submit button.
- Locate inputs by label, type with `userEvent.fill`, then click submit and assert errors / call counts.
- Validation timing matches the form's `validators` config: `onMount` / `onChange` / `onBlur` / `onSubmit`.
- **Disabling a button based on validity:** read form state *reactively*, e.g. `const canSubmit = useSelector(form.store, (s) => s.canSubmit);` — a direct `form.state.canSubmit` read does **not** re-render on changes. Note `canSubmit` is `true` on a pristine form with no `onMount` validator, so to disable a button when a required field is empty from the start, add `onMount: schema` to the validators.

## File naming & location

- Extension: `.browser.test.tsx` (runs in Playwright; unit tests are `.test.ts(x)` in jsdom).
- Co-locate a `tests/` folder next to the feature, e.g. `views/cos/advanced/tests/*.browser.test.tsx`.

## Run a single test

```bash
pnpm vitest run apps/admin-ui-cos/src/views/cos/advanced/tests/foo.browser.test.tsx --reporter=verbose
# visible browser window:
HEADED=true pnpm vitest run <file>
```

## Cheatsheet

```tsx
import { resetMockWorker, setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';

describe('X', () => {
  beforeEach(() => vi.resetAllMocks());
  afterEach(() => resetMockWorker());

  it('does something', async () => {
    await setupBrowserTest(<MyComponent />, { initialRouterEntry: '/x' });
    await expect.element(page.getByText('Title')).toBeVisible();

    const input = page.getByRole('textbox', { name: 'Field' });
    await userEvent.fill(input, 'value');

    const btn = page.getByRole('button', { name: 'Save' });
    await expect.element(btn).not.toBeDisabled();
    await btn.click();
  });
});
```
