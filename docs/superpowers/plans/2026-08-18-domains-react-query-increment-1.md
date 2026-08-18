# admin-ui-domains React Query Migration — Increment 1 (Settings reads) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace manual `useEffect`/`useState` fetch patterns with TanStack React Query hooks for five settings views (2FA domain + global, address-book service, anti-DOS config, SAML config), keyed via the existing `domainQueryKeys` factory.

**Architecture:** One new RQ hook per read concern, colocated with the other query hooks in `src/services/`. Components keep their local edit state; server truth comes from `useQuery`; direct mutation service calls stay but are followed by `queryClient.invalidateQueries(...)` so the cache (and any derived edit-reset effects) refresh. Existing behavior (snackbars, dirty tracking, button gating) is preserved.

**Tech Stack:** React 19, @tanstack/react-query v5, Vitest (jsdom unit tests via `@testing-library/react` `renderHook`; Playwright browser tests via `admin-ui-test-utils` `setupBrowserTest`), existing SOAP/REST service modules unchanged.

**Conventions (from AGENTS.md + repo):**
- SPDX header year 2026 on every new file.
- New files use 2-space indent, single quotes, trailing commas, print width 100 (prettier defaults). **Exception:** `domain-2fa.tsx` and `global-two-factor-auth.tsx` use TAB indent — edits inside them must use tabs.
- Named exports only. Arrow-function component hooks (`export const useX = (...) => ...`), plain `function` declarations for helpers.
- No `useMemo`/`useCallback` in new code (React Compiler handles memoization).
- Query options to match existing hooks: `staleTime: 30_000, retry: 1, refetchOnWindowFocus: false`.
- Unit tests: `.test.tsx` in `src/services/tests/`, Vitest globals (`describe/it/expect` may be imported for clarity like existing tests do), `vi.hoisted` + `vi.mock` for service modules (same pattern as `src/views/domain/details/tests/domain-2fa.browser.test.tsx:15`).
- **Commits are MANUAL ONLY — NEVER run `git commit`, `git add`, amend, or push.** Each task ends with a "Manual commit checkpoint" step that only suggests a commit message for the user; the user does the committing.

**Test commands (run from repo root `/home/airarch/zextras/carbonio-admin-console-ui-1`):**
- Single unit test: `pnpm vitest run apps/admin-ui-domains/src/services/tests/<file>.test.tsx`
- Single browser test: `pnpm vitest run <path-to-.browser.test.tsx>`
- Type check: `pnpm type-check`
- Lint: `pnpm lint`

**Out of scope (later increments):** mutations as `useMutation`, remaining Tier-1 reads (accounts/DL/resources/devices/quarantine), duplicate-service consolidation (`set-password*`, `get-account*`).

---

### Task 1: Extend the query key factory

**Files:**
- Modify: `apps/admin-ui-domains/src/services/domain-query-keys.ts`

- [ ] **Step 1: Add the new key families**

Replace the whole file content with:

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const domainQueryKeys = {
  all: ['domain'] as const,
  list: () => [...domainQueryKeys.all, 'list'] as const,
  quota: (domainId: string) => [...domainQueryKeys.all, 'quota', domainId] as const,
  twoFactorPolicies: (domain: string) =>
    [...domainQueryKeys.all, 'two-factor-policies', domain] as const,
  addressBookService: () => [...domainQueryKeys.all, 'address-book-service'] as const,
  antiDosConfig: () => [...domainQueryKeys.all, 'anti-dos-config'] as const,
  samlConfig: (domain: string) => [...domainQueryKeys.all, 'saml-config', domain] as const,
} as const;
```

- [ ] **Step 2: Type-check**

Run: `pnpm type-check`
Expected: PASS (no errors in admin-ui-domains)

- [ ] **Step 3: Manual commit checkpoint (do NOT commit)**

Do not run any git commands. When the user is ready, the suggested commit is:

```bash
git add apps/admin-ui-domains/src/services/domain-query-keys.ts
git commit -m "refactor(domains): add query keys for settings reads"
```

---

### Task 2: `use2faPolicies` hook (TDD)

**Files:**
- Create: `apps/admin-ui-domains/src/services/use-2fa-policies.ts`
- Test: `apps/admin-ui-domains/src/services/tests/use-2fa-policies.test.tsx`

Background: `list2faPolicies(domain)` (in `src/services/list-2fa-policies.ts`) resolves a raw SOAP envelope. The payload is `JSON.parse(res.Body.response.content)` → `{ response: { values: [...] } }`. Both `domain-2fa.tsx` and `global-two-factor-auth.tsx` duplicate this parsing today.

- [ ] **Step 1: Write the failing test**

Create `apps/admin-ui-domains/src/services/tests/use-2fa-policies.test.tsx`:

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockList2faPolicies = vi.hoisted(() => vi.fn());

vi.mock('../list-2fa-policies', () => ({
  list2faPolicies: mockList2faPolicies,
}));

import { parse2faPolicies, use2faPolicies } from '../use-2fa-policies';

function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function makeSoapResponse(values: Array<unknown> | undefined): unknown {
  return {
    Body: {
      response: {
        content: JSON.stringify({ response: { values } }),
      },
    },
  };
}

describe('parse2faPolicies', () => {
  it('should extract values from the zextras content envelope', () => {
    const values = [{ WebUI: { trustedDevice: 1, trustedIpRange: [] } }];

    expect(parse2faPolicies(makeSoapResponse(values))).toEqual(values);
  });

  it('should return an empty array when content is missing', () => {
    expect(parse2faPolicies({ Body: {} })).toEqual([]);
    expect(parse2faPolicies(undefined)).toEqual([]);
  });
});

describe('use2faPolicies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return parsed policies for the given domain', async () => {
    const values = [{ WebUI: { trustedDevice: 1, trustedIpRange: [] } }];
    mockList2faPolicies.mockResolvedValue(makeSoapResponse(values));

    const { result } = renderHook(() => use2faPolicies('example.com'), {
      wrapper: QueryWrapper,
    });

    await waitFor(() => expect(result.current.data).toEqual(values));
    expect(mockList2faPolicies).toHaveBeenCalledWith('example.com');
  });

  it('should expose the error when the service rejects', async () => {
    mockList2faPolicies.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => use2faPolicies(''), {
      wrapper: QueryWrapper,
    });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error), { timeout: 4000 });
    expect(result.current.error?.message).toBe('boom');
  });

  it('should stay disabled while the domain is undefined', async () => {
    mockList2faPolicies.mockResolvedValue(makeSoapResponse([]));

    const { result } = renderHook(() => use2faPolicies(undefined), {
      wrapper: QueryWrapper,
    });

    expect(result.current.isPending).toBe(true);
    expect(mockList2faPolicies).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run apps/admin-ui-domains/src/services/tests/use-2fa-policies.test.tsx`
Expected: FAIL — cannot resolve `../use-2fa-policies`

- [ ] **Step 3: Write the hook**

Create `apps/admin-ui-domains/src/services/use-2fa-policies.ts`:

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import type { TwoFactorAuthPolicyValues } from '../../types';
import { domainQueryKeys } from './domain-query-keys';
import { list2faPolicies } from './list-2fa-policies';

export function parse2faPolicies(res: any): Array<TwoFactorAuthPolicyValues> {
  if (!res?.Body?.response?.content) {
    return [];
  }
  const content = JSON.parse(res.Body.response.content);
  return content?.response?.values ?? [];
}

export const use2faPolicies = (domain: string | undefined) =>
  useQuery({
    queryKey: domainQueryKeys.twoFactorPolicies(domain ?? ''),
    queryFn: async () => parse2faPolicies(await list2faPolicies(domain ?? '')),
    enabled: domain !== undefined,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
```

Note: `enabled: domain !== undefined` prevents the domain view from fetching **global** policies while the selected domain is still loading (`domain-2fa.tsx` passes `domain?.name`). The global view always passes `''` explicitly.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run apps/admin-ui-domains/src/services/tests/use-2fa-policies.test.tsx`
Expected: PASS (all tests)

- [ ] **Step 5: Manual commit checkpoint (do NOT commit)**

Do not run any git commands. When the user is ready, the suggested commit is:

```bash
git add apps/admin-ui-domains/src/services/use-2fa-policies.ts apps/admin-ui-domains/src/services/tests/use-2fa-policies.test.tsx
git commit -m "refactor(domains): add use2faPolicies react query hook"
```

---

### Task 3: Wire `use2faPolicies` into the two 2FA views

**Files:**
- Modify: `apps/admin-ui-domains/src/views/domain/details/domain-2fa.tsx` (TAB indent!)
- Modify: `apps/admin-ui-domains/src/views/domain/global/global-two-factor-auth.tsx` (TAB indent!)

- [ ] **Step 1: Update `domain-2fa.tsx`**

1a. Replace the imports block (lines ~6–17) with:

```
import { Button, Container, Padding, RouteLeavingGuard, Row, useSnackbar } from '@zextras/ui-components';
import { useQueryClient } from '@tanstack/react-query';
import { differenceWith, isEqual, map, some } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TwoFactorAuthPolicyValues } from '../../../../types';
import { OK } from '../../../constants';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { domainQueryKeys } from '../../../services/domain-query-keys';
import { set2faPolicies } from '../../../services/set-2fa-policies';
import { use2faPolicies } from '../../../services/use-2fa-policies';
import { isValidIpRange, TwoFactorPolicyArray } from '../../utility/utils';
import { TwoFactorAuthencationConfig } from '../two-factor-authentication/2fa-config';
```

(Import order will be auto-fixed by `simple-import-sort` on lint; content correctness matters first.)

1b. Inside the component, replace the `arrPolicies` state declaration (line ~23):

```
	const [arrPoliciesToModify, setArrPoliciesToModify] = useState<TwoFactorAuthPolicyValues[]>([]);
```
stays, but **delete** the line `const [arrPolicies, setArrPolicies] = useState<TwoFactorAuthPolicyValues[]>([]);` and add after the `useSelectedDomain` block:

```
	const queryClient = useQueryClient();
	const { data: arrPolicies = [], error: policiesError } = use2faPolicies(domainName);
```

1c. **Delete** the whole `listGlobalPolicies` callback (lines ~29–53) and the `useEffect(() => { listGlobalPolicies(); }, [listGlobalPolicies]);` at the bottom (lines ~127–129).

1d. Add these two effects where `listGlobalPolicies` used to be:

```
	useEffect(() => {
		setArrPoliciesToModify(arrPolicies);
	}, [arrPolicies]);

	useEffect(() => {
		if (policiesError) {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label: policiesError?.message
					? policiesError?.message
					: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		}
	}, [policiesError, createSnackbar, t]);
```

The first effect resets the editable copy whenever fresh server data arrives (initial load and post-save invalidation) — this is what the old `.then` did with `setArrPolicies` + `setArrPoliciesToModify`.

1e. In `handleOnSave`, inside the `.then` on the `response?.ok` branch, after `setIsDirty(false);` (line ~94) add:

```
						queryClient.invalidateQueries({
							queryKey: domainQueryKeys.twoFactorPolicies(domainName ?? '')
						});
```

(Use TAB indentation matching the surrounding block.)

- [ ] **Step 2: Update `global-two-factor-auth.tsx` the same way**

2a. Imports: remove `list2faPolicies` import, add `useQueryClient` from `@tanstack/react-query`, `domainQueryKeys` and `use2faPolicies` from `../../../services/...`.

2b. Delete `const [arrPolicies, setArrPolicies] = useState...`, add:

```
	const queryClient = useQueryClient();
	const { data: arrPolicies = [], error: policiesError } = use2faPolicies('');
```

2c. Delete `listGlobalPolicies` and its `useEffect` invocation; add the two replacement effects from step 1d (identical code).

2d. In `handleOnSave`'s success branch after `setIsDirty(false);` add:

```
						queryClient.invalidateQueries({ queryKey: domainQueryKeys.twoFactorPolicies('') });
```

- [ ] **Step 3: Run both components' browser tests**

Run:
```bash
pnpm vitest run apps/admin-ui-domains/src/views/domain/details/tests/domain-2fa.browser.test.tsx
```
Expected: PASS. The test mocks the `list-2fa-policies` module directly (`vi.mock`), so the hook picks the mock up transparently.

If a timing assertion fails because the hook is disabled until the selected-domain query resolves, check the test's `setup()` seeds `domainByIdKey` before render (it does, `domain-2fa.browser.test.tsx:56-68`) and re-run once — flakes here indicate a missing `await`, not a broken component.

- [ ] **Step 4: Type-check + lint the app**

Run: `pnpm type-check && pnpm lint`
Expected: PASS (import order auto-fixable via `pnpm lint:fix` if simple-import-sort complains)

- [ ] **Step 5: Manual commit checkpoint (do NOT commit)**

Do not run any git commands. When the user is ready, the suggested commit is:

```bash
git add apps/admin-ui-domains/src/views/domain/details/domain-2fa.tsx apps/admin-ui-domains/src/views/domain/global/global-two-factor-auth.tsx
git commit -m "refactor(domains): use use2faPolicies in 2fa views"
```

---

### Task 4: `useAddressBookServiceStatus` hook (TDD)

**Files:**
- Create: `apps/admin-ui-domains/src/services/use-address-book-service.ts`
- Test: `apps/admin-ui-domains/src/services/tests/use-address-book-service.test.tsx`

Background: `getAddressBookServices()` (in `src/services/get-address-book-services.ts`) already parses the envelope, throws on SOAP Fault, and returns `AddressBookServiceStatus`. The hook is a thin wrapper.

- [ ] **Step 1: Write the failing test**

Create `apps/admin-ui-domains/src/services/tests/use-address-book-service.test.tsx`:

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetAddressBookServices = vi.hoisted(() => vi.fn());

vi.mock('../get-address-book-services', () => ({
  getAddressBookServices: mockGetAddressBookServices,
}));

import { useAddressBookServiceStatus } from '../use-address-book-service';

function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const RUNNING = { running: true, couldStart: false, couldStop: true };

describe('useAddressBookServiceStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the parsed service status', async () => {
    mockGetAddressBookServices.mockResolvedValue(RUNNING);

    const { result } = renderHook(() => useAddressBookServiceStatus(), {
      wrapper: QueryWrapper,
    });

    await waitFor(() => expect(result.current.data).toEqual(RUNNING));
  });

  it('should expose the error when the service throws', async () => {
    mockGetAddressBookServices.mockRejectedValue(new Error('Service error'));

    const { result } = renderHook(() => useAddressBookServiceStatus(), {
      wrapper: QueryWrapper,
    });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.error?.message).toBe('Service error');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run apps/admin-ui-domains/src/services/tests/use-address-book-service.test.tsx`
Expected: FAIL — cannot resolve `../use-address-book-service`

- [ ] **Step 3: Write the hook**

Create `apps/admin-ui-domains/src/services/use-address-book-service.ts`:

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getAddressBookServices } from './get-address-book-services';

export const useAddressBookServiceStatus = () =>
  useQuery({
    queryKey: domainQueryKeys.addressBookService(),
    queryFn: getAddressBookServices,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run apps/admin-ui-domains/src/services/tests/use-address-book-service.test.tsx`
Expected: PASS

- [ ] **Step 5: Manual commit checkpoint (do NOT commit)**

Do not run any git commands. When the user is ready, the suggested commit is:

```bash
git add apps/admin-ui-domains/src/services/use-address-book-service.ts apps/admin-ui-domains/src/services/tests/use-address-book-service.test.tsx
git commit -m "refactor(domains): add useAddressBookServiceStatus hook"
```

---

### Task 5: Wire `useAddressBookServiceStatus` into `global-address-book.tsx`

**Files:**
- Modify: `apps/admin-ui-domains/src/views/domain/global/global-address-book.tsx` (2-space indent)

- [ ] **Step 1: Replace the fetch state and effects**

1a. Update imports: add `useQueryClient` from `@tanstack/react-query`; add `domainQueryKeys` from `../../../services/domain-query-keys` and `useAddressBookServiceStatus` from `../../../services/use-address-book-service`.

1b. Replace these state declarations (lines ~69–72):

```ts
  const [serviceStatus, setServiceStatus] = useState<AddressBookServiceStatus>(DEFAULT_STATUS);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedStatus, setHasLoadedStatus] = useState(false);
```

with:

```ts
  const queryClient = useQueryClient();
  const { data, isPending, error: statusError } = useAddressBookServiceStatus();
  const serviceStatus = data ?? DEFAULT_STATUS;
```

(`isRequestInProgress` state stays — it drives the toggle button's `loading` prop.)

1c. **Delete** the whole mount `useEffect` that calls `getAddressBookServices()` (lines ~86–123, including the `cancelled` flag and the eslint-disable comment).

1d. Add an error-snackbar effect after the `userSetting` effect:

```ts
  useEffect(() => {
    if (statusError) {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: getErrorLabel(statusError, fallbackError),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    }
  }, [statusError, createSnackbar, fallbackError]);
```

1e. In `serviceStartStop`, replace the `setServiceStatus({...})` call (lines ~135–139) with:

```ts
        queryClient.invalidateQueries({ queryKey: domainQueryKeys.addressBookService() });
```

and keep the success snackbar. The MSW-driven browser test has a stateful interceptor, so the refetch observes the toggled state.

1f. Update `canToggle` (line ~172): replace `!isLoading` with `!isPending`:

```ts
  const canToggle =
    isGlobalAdmin && !isPending && !isRequestInProgress && (serviceStatus.running ? serviceStatus.couldStop : serviceStatus.couldStart);
```

1g. Update the render condition (line ~211): replace

```tsx
        {isLoading && !hasLoadedStatus ? (
          ...spinner...
        ) : (
          hasLoadedStatus && (
```

with:

```tsx
        {isPending ? (
          ...spinner...
        ) : (
          !statusError && (
```

(On error we now render nothing extra — the snackbar reports it — instead of an empty status card from `DEFAULT_STATUS`.)

- [ ] **Step 2: Run the browser test**

Run: `pnpm vitest run apps/admin-ui-domains/src/views/domain/global/tests/global-address-book.browser.test.tsx`
Expected: PASS

- [ ] **Step 3: Type-check + lint**

Run: `pnpm type-check && pnpm lint`
Expected: PASS

- [ ] **Step 4: Manual commit checkpoint (do NOT commit)**

Do not run any git commands. When the user is ready, the suggested commit is:

```bash
git add apps/admin-ui-domains/src/views/domain/global/global-address-book.tsx
git commit -m "refactor(domains): use react query for address book service status"
```

---

### Task 6: `useAntiDosConfig` hook (TDD)

**Files:**
- Create: `apps/admin-ui-domains/src/services/use-anti-dos-config.ts`
- Test: `apps/admin-ui-domains/src/services/tests/use-anti-dos-config.test.tsx`

Background: four ZxConfig gets (`get-mobile-anti-dos-service*.ts`, one file per attribute) each return a raw envelope; `global-active-sync.tsx:172-202` parses them in four separate `useEffect` promises. `enabled` reads only `values[0].value`; the other three fall back to `inheritedValue` when `value` is falsy. Preserve that exactly, and coerce the three numeric settings to strings because the component stores them in string states / `<Input>` values.

- [ ] **Step 1: Write the failing test**

Create `apps/admin-ui-domains/src/services/tests/use-anti-dos-config.test.tsx`:

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getEnabled: vi.fn(),
  getJailDuration: vi.fn(),
  getMaxRequests: vi.fn(),
  getTimeWindow: vi.fn(),
}));

vi.mock('../get-mobile-anti-dos-service', () => ({
  getMobileAntiDosService: mocks.getEnabled,
}));
vi.mock('../get-mobile-anti-dos-service-jail-duration', () => ({
  getMobileAntiDosServiceJailDuration: mocks.getJailDuration,
}));
vi.mock('../get-mobile-anti-dos-service-max-requests', () => ({
  getMobileAntiDosServiceMaxRequests: mocks.getMaxRequests,
}));
vi.mock('../get-mobile-anti-dos-service-time-window', () => ({
  getMobileAntiDosServiceTimeWindow: mocks.getTimeWindow,
}));

import { parseAntiDosEnabled, parseAntiDosValue, useAntiDosConfig } from '../use-anti-dos-config';

function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function makeValueResponse(value: unknown, inheritedValue?: unknown): unknown {
  return {
    Body: {
      response: {
        content: JSON.stringify({
          response: { values: [{ value, inheritedValue }] },
        }),
      },
    },
  };
}

describe('parse helpers', () => {
  it('should read enabled from value only', () => {
    expect(parseAntiDosEnabled(makeValueResponse(true, false))).toBe(true);
    expect(parseAntiDosEnabled(makeValueResponse(undefined, true))).toBe(false);
  });

  it('should fall back to inheritedValue for numeric settings', () => {
    expect(parseAntiDosValue(makeValueResponse(30))).toBe('30');
    expect(parseAntiDosValue(makeValueResponse(undefined, 60))).toBe('60');
  });
});

describe('useAntiDosConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should combine the four config gets into one object', async () => {
    mocks.getEnabled.mockResolvedValue(makeValueResponse(true));
    mocks.getJailDuration.mockResolvedValue(makeValueResponse(30));
    mocks.getMaxRequests.mockResolvedValue(makeValueResponse(undefined, 100));
    mocks.getTimeWindow.mockResolvedValue(makeValueResponse(60000));

    const { result } = renderHook(() => useAntiDosConfig(), {
      wrapper: QueryWrapper,
    });

    await waitFor(() =>
      expect(result.current.data).toEqual({
        enabled: true,
        jailDuration: '30',
        maxRequests: '100',
        timeWindow: '60000',
      }),
    );
  });

  it('should expose the error when any get rejects', async () => {
    mocks.getEnabled.mockResolvedValue(makeValueResponse(true));
    mocks.getJailDuration.mockRejectedValue(new Error('boom'));
    mocks.getMaxRequests.mockResolvedValue(makeValueResponse(1));
    mocks.getTimeWindow.mockResolvedValue(makeValueResponse(1));

    const { result } = renderHook(() => useAntiDosConfig(), {
      wrapper: QueryWrapper,
    });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run apps/admin-ui-domains/src/services/tests/use-anti-dos-config.test.tsx`
Expected: FAIL — cannot resolve `../use-anti-dos-config`

- [ ] **Step 3: Write the hook**

Create `apps/admin-ui-domains/src/services/use-anti-dos-config.ts`:

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { getMobileAntiDosService } from './get-mobile-anti-dos-service';
import { getMobileAntiDosServiceJailDuration } from './get-mobile-anti-dos-service-jail-duration';
import { getMobileAntiDosServiceMaxRequests } from './get-mobile-anti-dos-service-max-requests';
import { getMobileAntiDosServiceTimeWindow } from './get-mobile-anti-dos-service-time-window';
import { domainQueryKeys } from './domain-query-keys';

export type AntiDosConfig = {
  enabled: boolean;
  jailDuration: string;
  maxRequests: string;
  timeWindow: string;
};

function parseEnvelope(res: any): any {
  return JSON.parse(res?.Body?.response?.content);
}

export function parseAntiDosEnabled(res: any): boolean {
  return Boolean(parseEnvelope(res)?.response?.values?.[0]?.value);
}

export function parseAntiDosValue(res: any): string {
  const entry = parseEnvelope(res)?.response?.values?.[0];
  const value = entry?.value ? entry.value : entry?.inheritedValue;
  return String(value ?? '');
}

export const useAntiDosConfig = () =>
  useQuery({
    queryKey: domainQueryKeys.antiDosConfig(),
    queryFn: async (): Promise<AntiDosConfig> => {
      const [enabledRes, jailRes, maxRes, windowRes] = await Promise.all([
        getMobileAntiDosService(),
        getMobileAntiDosServiceJailDuration(),
        getMobileAntiDosServiceMaxRequests(),
        getMobileAntiDosServiceTimeWindow(),
      ]);
      return {
        enabled: parseAntiDosEnabled(enabledRes),
        jailDuration: parseAntiDosValue(jailRes),
        maxRequests: parseAntiDosValue(maxRes),
        timeWindow: parseAntiDosValue(windowRes),
      };
    },
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run apps/admin-ui-domains/src/services/tests/use-anti-dos-config.test.tsx`
Expected: PASS

- [ ] **Step 5: Manual commit checkpoint (do NOT commit)**

Do not run any git commands. When the user is ready, the suggested commit is:

```bash
git add apps/admin-ui-domains/src/services/use-anti-dos-config.ts apps/admin-ui-domains/src/services/tests/use-anti-dos-config.test.tsx
git commit -m "refactor(domains): add useAntiDosConfig hook"
```

---

### Task 7: Wire `useAntiDosConfig` into `global-active-sync.tsx`

**Files:**
- Modify: `apps/admin-ui-domains/src/views/domain/global/global-active-sync.tsx` (2-space indent)

- [ ] **Step 1: Replace the four gets with the hook**

1a. Imports: remove the four `get-mobile-anti-dos-service*` imports (lines 23–26); add `useQueryClient` from `@tanstack/react-query`, `domainQueryKeys` and `useAntiDosConfig` from `../../../services/...`.

1b. After `const createSnackbar = useSnackbar();` (line 45) add:

```ts
  const queryClient = useQueryClient();
  const { data: antiDosConfig } = useAntiDosConfig();
```

1c. **Delete** the whole mount `useEffect` with the four `.then` fetches (lines 172–202).

1d. Add a seeding effect where the old effect was:

```ts
  useEffect(() => {
    if (antiDosConfig) {
      setIntMobileAntiDosServiceEnbled(antiDosConfig.enabled);
      setMobileAntiDosServiceEnbled(antiDosConfig.enabled);
      setIntMobileAntiDosServiceJailDuration(antiDosConfig.jailDuration);
      setMobileAntiDosServiceJailDuration(antiDosConfig.jailDuration);
      setIntMobileAntiDosServiceMaxRequests(antiDosConfig.maxRequests);
      setMobileAntiDosServiceMaxRequests(antiDosConfig.maxRequests);
      setIntMobileAntiDosServiceTimeWindow(antiDosConfig.timeWindow);
      setMobileAntiDosServiceTimeWindow(antiDosConfig.timeWindow);
    }
  }, [antiDosConfig]);
```

This runs on initial load and after every invalidation (post-save), replacing the manual `setInt...` calls in `onSave`.

1e. In `onSave` (lines 136–162): remove each `setInt...(...)` line inside the `.then`s (the seeding effect now handles it), and append an invalidation inside each `.then` after `successSnackbar();`:

```ts
        queryClient.invalidateQueries({ queryKey: domainQueryKeys.antiDosConfig() });
```

so `onSave` becomes:

```ts
  const onSave = (): void => {
    if (mobileAntiDosServiceEnbled !== intMobileAntiDosServiceEnbled) {
      setAntiDosServiceEnabled(mobileAntiDosServiceEnbled).then(() => {
        successSnackbar();
        queryClient.invalidateQueries({ queryKey: domainQueryKeys.antiDosConfig() });
      });
    }
    if (mobileAntiDosServiceJailDuration !== intMobileAntiDosServiceJailDuration) {
      setAntiDosServiceJailDuration(Number(mobileAntiDosServiceJailDuration)).then(() => {
        successSnackbar();
        queryClient.invalidateQueries({ queryKey: domainQueryKeys.antiDosConfig() });
      });
    }
    if (mobileAntiDosServiceMaxRequests !== intMobileAntiDosServiceMaxRequests) {
      setAntiDosServiceMaxRequests(Number(mobileAntiDosServiceMaxRequests)).then(() => {
        successSnackbar();
        queryClient.invalidateQueries({ queryKey: domainQueryKeys.antiDosConfig() });
      });
    }
    if (mobileAntiDosServiceTimeWindow !== intMobileAntiDosServiceTimeWindow) {
      setAntiDosServiceTimeWindow(Number(mobileAntiDosServiceTimeWindow)).then(() => {
        successSnackbar();
        queryClient.invalidateQueries({ queryKey: domainQueryKeys.antiDosConfig() });
      });
    }
    setIsDirty(false);
  };
```

(React Query dedupes concurrent invalidations of the same key, so multiple changed fields cause one refetch.)

- [ ] **Step 2: Run the browser test**

Run: `pnpm vitest run apps/admin-ui-domains/src/views/domain/global/tests/global-active-sync.browser.test.tsx`
Expected: PASS. If the test intercepts the four zextras GET endpoints via MSW, the post-save invalidation refetches them; the stateful handlers make this a no-op visually.

- [ ] **Step 3: Type-check + lint**

Run: `pnpm type-check && pnpm lint`
Expected: PASS

- [ ] **Step 4: Manual commit checkpoint (do NOT commit)**

Do not run any git commands. When the user is ready, the suggested commit is:

```bash
git add apps/admin-ui-domains/src/views/domain/global/global-active-sync.tsx
git commit -m "refactor(domains): use useAntiDosConfig in global active sync"
```

---

### Task 8: `useSamlConfig` hook (TDD)

**Files:**
- Create: `apps/admin-ui-domains/src/services/use-saml-config.ts`
- Test: `apps/admin-ui-domains/src/services/tests/use-saml-config.test.tsx`

Background: `getSamlConfig(domain, raw)` (REST GET `/service/extension/zextras_admin/auth/saml/{domain}?raw=true`) resolves the attribute map, or an object carrying `{ error }`. `domain-saml.tsx` treats `data.error` as failure.

- [ ] **Step 1: Write the failing test**

Create `apps/admin-ui-domains/src/services/tests/use-saml-config.test.tsx`:

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetSamlConfig = vi.hoisted(() => vi.fn());

vi.mock('../get-saml-configurations', () => ({
  getSamlConfig: mockGetSamlConfig,
}));

import { useSamlConfig } from '../use-saml-config';

function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useSamlConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch raw config for the domain', async () => {
    mockGetSamlConfig.mockResolvedValue({ attr1: 'value1' });

    const { result } = renderHook(() => useSamlConfig('example.com'), {
      wrapper: QueryWrapper,
    });

    await waitFor(() => expect(result.current.data).toEqual({ attr1: 'value1' }));
    expect(mockGetSamlConfig).toHaveBeenCalledWith('example.com', true);
  });

  it('should throw when the response carries an error', async () => {
    mockGetSamlConfig.mockResolvedValue({ error: 'not found' });

    const { result } = renderHook(() => useSamlConfig('example.com'), {
      wrapper: QueryWrapper,
    });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.error?.message).toBe('not found');
  });

  it('should stay disabled while the domain is empty', async () => {
    mockGetSamlConfig.mockResolvedValue({});

    const { result } = renderHook(() => useSamlConfig(''), {
      wrapper: QueryWrapper,
    });

    expect(result.current.isPending).toBe(true);
    expect(mockGetSamlConfig).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run apps/admin-ui-domains/src/services/tests/use-saml-config.test.tsx`
Expected: FAIL — cannot resolve `../use-saml-config`

- [ ] **Step 3: Write the hook**

Create `apps/admin-ui-domains/src/services/use-saml-config.ts`:

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getSamlConfig } from './get-saml-configurations';

export const useSamlConfig = (domain: string) =>
  useQuery({
    queryKey: domainQueryKeys.samlConfig(domain),
    queryFn: async () => {
      const data = await getSamlConfig(domain, true);
      if (data?.error) {
        throw new Error(data.error);
      }
      return data;
    },
    enabled: !!domain,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run apps/admin-ui-domains/src/services/tests/use-saml-config.test.tsx`
Expected: PASS

- [ ] **Step 5: Manual commit checkpoint (do NOT commit)**

Do not run any git commands. When the user is ready, the suggested commit is:

```bash
git add apps/admin-ui-domains/src/services/use-saml-config.ts apps/admin-ui-domains/src/services/tests/use-saml-config.test.tsx
git commit -m "refactor(domains): add useSamlConfig hook"
```

---

### Task 9: Wire `useSamlConfig` into `domain-saml.tsx`

**Files:**
- Modify: `apps/admin-ui-domains/src/views/domain/details/domain-saml.tsx` (2-space indent)

This is the largest edit. The pattern: server truth = `useSamlConfig`; every mutation success → invalidate; the attribute list and table rows are derived from query data.

- [ ] **Step 1: Replace state with query data**

1a. Imports: add `useQueryClient` from `@tanstack/react-query`; add `domainQueryKeys` and `useSamlConfig` from `../../../services/...`. Keep `getSamlConfig` (still used by `exportMetadata`).

1b. Delete the `samlAttributes` state (line 44) and add after `createSnackbar`:

```ts
  const queryClient = useQueryClient();
  const { data: samlConfig, error: samlError } = useSamlConfig(domainName);
```

1c. Delete `setSAMLAttributes` (lines 76–86) and replace with derived data + invalidation helper:

```ts
  const samlAttributes: Array<SamlAttribute> = samlConfig
    ? Object.entries(samlConfig).map(([attribute, value]) => ({ attribute, value }))
    : [];

  function refreshSamlConfig(): void {
    queryClient.invalidateQueries({ queryKey: domainQueryKeys.samlConfig(domainName) });
  }
```

(No `useMemo` — React Compiler memoizes this.)

1d. Delete `getSAMLConfigurations` (lines 176–192) and its mount effect (lines 375–379).

1e. Add an error-snackbar effect (after `showError` definition):

```ts
  useEffect(() => {
    if (samlError) {
      showError(samlError);
    }
  }, [samlError, showError]);
```

- [ ] **Step 2: Point all mutation callbacks at invalidation**

In each of the five mutation callbacks — `importSAMLConfigurations`, `generateSPCertificates`, `addOrUpdateSAMLAttributes`, `removeSAMLAttributes`, `deleteSAMLConfigurations` — replace the `setSAMLAttributes(data);` line inside the success branch with:

```ts
            refreshSamlConfig();
```

Keep the snackbar logic and the `setSamlAttrKey('')` / `setSamlAttrValue('')` resets exactly as they are. The remaining `if (!data?.error) { ... } else { showError }` branches stay for the mutation responses themselves.

- [ ] **Step 3: Verify the remaining effects**

The `generateSAMLTable` effect (lines 381–385) and the entityId/serviceUrl effect stay unchanged — `samlAttributes` is now a derived value they consume.

- [ ] **Step 4: Run the browser test**

Run: `pnpm vitest run apps/admin-ui-domains/src/views/domain/details/tests/domain-saml.browser.test.tsx`
Expected: PASS. If the test asserts table contents after a mutation, the invalidation refetch must be handled by its MSW handler — inspect the test file first (`apps/admin-ui-domains/src/views/domain/details/tests/domain-saml.browser.test.tsx`) and, if it uses one-shot handlers, switch them to stateful handlers mirroring `setupAddressBookInterceptor` in `global-address-book.browser.test.tsx:112`.

- [ ] **Step 5: Type-check + lint**

Run: `pnpm type-check && pnpm lint`
Expected: PASS

- [ ] **Step 6: Manual commit checkpoint (do NOT commit)**

Do not run any git commands. When the user is ready, the suggested commit is:

```bash
git add apps/admin-ui-domains/src/views/domain/details/domain-saml.tsx
git commit -m "refactor(domains): use useSamlConfig in domain saml view"
```

---

### Task 10: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run all unit tests for the app's services**

```bash
pnpm vitest run apps/admin-ui-domains/src/services/tests
```
Expected: PASS

- [ ] **Step 2: Run all affected browser tests**

```bash
pnpm vitest run \
  apps/admin-ui-domains/src/views/domain/details/tests/domain-2fa.browser.test.tsx \
  apps/admin-ui-domains/src/views/domain/details/tests/domain-saml.browser.test.tsx \
  apps/admin-ui-domains/src/views/domain/global/tests/global-address-book.browser.test.tsx \
  apps/admin-ui-domains/src/views/domain/global/tests/global-active-sync.browser.test.tsx \
  apps/admin-ui-domains/src/views/domain/two-factor-authentication/tests/2fa-config.browser.test.tsx
```
Expected: PASS

- [ ] **Step 3: Repo-wide type check and lint**

```bash
pnpm type-check && pnpm lint
```
Expected: PASS

- [ ] **Step 4: Sanity-check for leftovers**

```bash
git grep -n "setArrPolicies\b\|listGlobalPolicies\|setServiceStatus\|setSAMLAttributes\|getSAMLConfigurations" apps/admin-ui-domains/src || true
```
Expected: no matches (all manual fetch plumbing removed)

```bash
git status
```
Expected: clean working tree (everything committed)

---

## Self-Review Notes

- **Coverage:** 5 components migrated (both 2FA views, address-book, active-sync, SAML), 4 new hooks, key factory extended. Duplicate-service consolidation and remaining Tier-1 reads deliberately deferred (documented as out of scope).
- **Behavior preserved:** snackbar error surfacing via `error`-state effects; dirty-state tracking untouched; `enabled` guards mirror the old "wait for domain name" gating; anti-DOS value/inheritance fallback logic copied verbatim into tested parse helpers.
- **Behavior improved (intentional):** post-save cache invalidation now refreshes server truth in 2FA/anti-DOS/SAML views (previously stale local copies); 2FA domain view no longer issues a wrong-level global fetch while the domain is loading.
- **Type consistency:** `AntiDosConfig` fields are all strings (component stores strings; numbers coerced via `String()`), `parse2faPolicies` returns `Array<TwoFactorAuthPolicyValues>` matching component state types, `useSamlConfig` returns the raw attribute map consumed by `Object.entries`.
