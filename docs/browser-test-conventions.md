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
- **MSW workers:** `worker`, `resetMockWorker`. The **global worker lifecycle is auto-wired** (`vitest-browser-setup.ts` starts/resets/stops it per file). You only need to call `resetMockWorker()` in your own `afterEach` if you add custom handlers.

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
