# admin-ui-domains React Query Migration — Increment 3 (service consolidation + account quota reads) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate duplicate SOAP service files, fix one bogus service type, and migrate the account/COS quota reads (used by the account-management views) to React Query hooks with seeding effects.

**Architecture:** Two duplicated service pairs collapse into their canonical files (callers re-pointed, duplicates deleted). The Storages REST quota services (`getAccountQuota`, `getCosQuota`) keep their `{type:'success'|'error'}` result contract; new `useAccountQuota`/`useCosQuota` hooks re-throw error results (same pattern as the existing `use-domain-quota.ts`) and are keyed via `domainQueryKeys`. Components consume hooks + seeding effects that write query data into their existing form state, replacing imperative `.then` chains; post-save refresh becomes `queryClient.invalidateQueries`.

**Tech Stack:** React 19, @tanstack/react-query v5, Vitest jsdom unit tests, Playwright browser tests via `admin-ui-test-utils`.

**Conventions:**
- SPDX 2026 header; named exports; no `useMemo`/`useCallback` in new files; 2-space indent (new files); TAB indent preserved in edited regions that already use tabs.
- **Commit at every completed task.** Stage exactly the listed files, run the given commit. Never push, never amend.
- Unit tests in `src/services/tests/`, `vi.hoisted` + `vi.mock` service modules, named `QueryWrapper` (via `makeWrapper(queryClient)` factory — same as Increment 2), error-path `waitFor` with `{ timeout: 4000 }` (hooks use `retry: 1`).
- Query options: `staleTime: 30_000, retry: 1, refetchOnWindowFocus: false`, `enabled: !!id`-style guards.

**Test commands (from `apps/admin-ui-domains/` unless noted):**
- Unit: `pnpm vitest run src/services/tests/<file>.test.tsx`
- Browser: `pnpm vitest run src/views/.../<file>.browser.test.tsx`
- Repo root: `pnpm type-check`, `pnpm --filter @zextras/admin-ui-domains lint`

**Out of scope (Increment 4+):** `getAccountRequest`/`accountListDirectory`/`getSessions`/`getSingatures`/`getAccountMembershipRequest` query hooks, `modifyDomain`/`modifyAccountRequest` mutations, remaining raw SOAP extraction (`GetGrantsRequest`, `GetFolderRequest`, etc.).

**Approved behavior deltas:**
1. `useCosQuota` skips the fetch when `cosId` is undefined (previously `getCosQuota(undefined)` hit `/quota/cos/undefined` and silently swallowed the error — net effect identical: no cos quota data).
2. `edit-account.tsx` now fetches account quota once on mount when `isAdvanced` (previously only refetched after a quota save; initial values came from the parent). The seeding effect writes the same keys the parent wrote, so the form starts in the same state.
3. Quota fetch failures in `manage-accounts` still show the `retrieveAccountQuotaError` snackbar; in `edit-account` failures now show the `getAccountQuotaError` snackbar on initial load too (previously initial load never fetched).

---

### Task 1: Consolidate `set-password*` services

**Files:**
- Modify: `apps/admin-ui-domains/src/services/set-password.ts`
- Delete: `apps/admin-ui-domains/src/services/set-password-service.ts`
- Modify: `apps/admin-ui-domains/src/views/domain/manange/resources/resource-edit-detail-view.tsx:18`

Background: two files export an identical `setPasswordRequest` wrapping `soapFetch('SetPassword')`. `set-password.ts` takes `(id: string, newPassword: string)` (caller: `edit-account.tsx`); `set-password-service.ts` takes `(resourceId: string, newPassword?: string)` (caller: `resource-edit-detail-view.tsx:518`). The optional-param signature is the superset — keep `set-password.ts` with it.

- [ ] **Step 1: Widen the canonical signature**

Replace the whole content of `apps/admin-ui-domains/src/services/set-password.ts` with:

```ts
/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

export const setPasswordRequest = async (id: string, newPassword?: string): Promise<any> => {
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		id,
		newPassword
	};

	return soapFetch(`SetPassword`, {
		...request
	});
};
```

- [ ] **Step 2: Re-point the resource view import**

In `apps/admin-ui-domains/src/views/domain/manange/resources/resource-edit-detail-view.tsx` line 18, change:

```ts
import { setPasswordRequest } from '../../../../services/set-password-service';
```

to:

```ts
import { setPasswordRequest } from '../../../../services/set-password';
```

- [ ] **Step 3: Delete the duplicate**

```bash
git rm apps/admin-ui-domains/src/services/set-password-service.ts
```

- [ ] **Step 4: Verify**

Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint`
Expected: PASS. Then confirm no references remain:

```bash
rg -n "set-password-service" apps/admin-ui-domains/src || echo "clean"
```
Expected: `clean`

- [ ] **Step 5: Commit**

```bash
git add apps/admin-ui-domains/src/services/set-password.ts apps/admin-ui-domains/src/views/domain/manange/resources/resource-edit-detail-view.tsx
git commit -m "refactor(domains): consolidate duplicate set-password services"
```

---

### Task 2: Consolidate `get-account*` services

**Files:**
- Modify: `apps/admin-ui-domains/src/services/get-account.ts`
- Delete: `apps/admin-ui-domains/src/services/get-account-service.ts`
- Modify: `apps/admin-ui-domains/src/views/domain/details/domain-gal-settings.tsx:35`

Background: `get-account.ts` exports `getAccountRequest(id, name, applyCos, attrs?)`; `get-account-service.ts` exports `getAccount(accountId)` — a simpler by-id `GetAccount` used twice in `domain-gal-settings.tsx` (lines 300, 861). Move `getAccount` into `get-account.ts` verbatim, delete the other file.

- [ ] **Step 1: Add `getAccount` to the canonical file**

Append to `apps/admin-ui-domains/src/services/get-account.ts` (keeping the existing `getAccountRequest` untouched):

```ts
export const getAccount = async (accountId: string): Promise<any> =>
	soapFetch(`GetAccount`, {
		_jsns: 'urn:zimbraAdmin',
		account: {
			by: 'id',
			_content: accountId
		}
	});
```

- [ ] **Step 2: Re-point the GAL settings import**

In `apps/admin-ui-domains/src/views/domain/details/domain-gal-settings.tsx` line 35, change:

```ts
import { getAccount } from '../../../services/get-account-service';
```

to:

```ts
import { getAccount } from '../../../services/get-account';
```

- [ ] **Step 3: Delete the duplicate**

```bash
git rm apps/admin-ui-domains/src/services/get-account-service.ts
```

- [ ] **Step 4: Verify**

Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint && pnpm vitest run src/views/domain/details/tests/domain-gal-settings.browser.test.tsx` (from `apps/admin-ui-domains/`)
Expected: PASS; `rg -n "get-account-service" apps/admin-ui-domains/src || echo clean` → `clean`

- [ ] **Step 5: Commit**

```bash
git add apps/admin-ui-domains/src/services/get-account.ts apps/admin-ui-domains/src/views/domain/details/domain-gal-settings.tsx
git commit -m "refactor(domains): consolidate duplicate get-account services"
```

---

### Task 3: Fix `updateSamlAttributes` parameter type

**Files:**
- Modify: `apps/admin-ui-domains/src/services/update-saml-attributes.ts`
- Modify: `apps/admin-ui-domains/src/services/use-saml-mutation.ts`

Background: `updateSamlAttributes(domain: string, body: JSON)` uses the global `JSON` interface as a parameter type — nonsense that forced an `as unknown as JSON` cast in `use-saml-mutation.ts`. Fix the service type and drop the cast.

- [ ] **Step 1: Change the service signature**

In `apps/admin-ui-domains/src/services/update-saml-attributes.ts`, change:

```ts
export const updateSamlAttributes = async (domain: string, body: JSON): Promise<any> =>
```

to:

```ts
export const updateSamlAttributes = async (
	domain: string,
	body: Record<string, unknown>
): Promise<any> =>
```

- [ ] **Step 2: Drop the cast in the mutation hook**

In `apps/admin-ui-domains/src/services/use-saml-mutation.ts`, change:

```ts
					await assertNoError(
						await updateSamlAttributes(domain, { [input.key]: input.value } as unknown as JSON),
					);
```

to:

```ts
					await assertNoError(
						await updateSamlAttributes(domain, { [input.key]: input.value }),
					);
```

- [ ] **Step 3: Verify**

Run (from `apps/admin-ui-domains/`): `pnpm vitest run src/services/tests/use-saml-mutation.test.tsx` → PASS (6 tests)
Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint` → PASS

- [ ] **Step 4: Commit**

```bash
git add apps/admin-ui-domains/src/services/update-saml-attributes.ts apps/admin-ui-domains/src/services/use-saml-mutation.ts
git commit -m "refactor(domains): fix updateSamlAttributes body type"
```

---

### Task 4: Extend the query key factory

**Files:**
- Modify: `apps/admin-ui-domains/src/services/domain-query-keys.ts`

- [ ] **Step 1: Add the quota key families**

Add two entries to `domainQueryKeys` (after the existing `quota` entry, before `twoFactorPolicies`):

```ts
  accountQuota: (accountId: string) =>
    [...domainQueryKeys.all, 'account-quota', accountId] as const,
  cosQuota: (cosId: string) => [...domainQueryKeys.all, 'cos-quota', cosId] as const,
```

- [ ] **Step 2: Type-check**

Run (repo root): `pnpm type-check` → PASS

- [ ] **Step 3: Commit**

```bash
git add apps/admin-ui-domains/src/services/domain-query-keys.ts
git commit -m "refactor(domains): add account and cos quota query keys"
```

---

### Task 5: `useAccountQuota` hook (TDD)

**Files:**
- Create: `apps/admin-ui-domains/src/services/use-account-quota.ts`
- Test: `apps/admin-ui-domains/src/services/tests/use-account-quota.test.tsx`

Background: `getAccountQuota(accountId)` returns `{type:'success', totalComputedLimit, totalLimitSource, totalStatus, totalUsed, usedByModules}` or `{type:'error', error}`. The hook mirrors `use-domain-quota.ts`: re-throw error results so React Query owns the error state.

- [ ] **Step 1: Write the failing test**

Create `apps/admin-ui-domains/src/services/tests/use-account-quota.test.tsx`:

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

const mockGetAccountQuota = vi.hoisted(() => vi.fn());

vi.mock('../get-account-quota', () => ({
	getAccountQuota: mockGetAccountQuota,
}));

import { useAccountQuota } from '../use-account-quota';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

const SUCCESS = {
	type: 'success' as const,
	totalComputedLimit: { type: 'limited' as const, value: 1024 },
	totalLimitSource: 'domain' as const,
	totalStatus: 'UNDERQUOTA' as const,
	totalUsed: 512,
	usedByModules: { mailbox: 256, files: 128, wsc: 128 },
};

describe('useAccountQuota', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return the success payload', async () => {
		mockGetAccountQuota.mockResolvedValue(SUCCESS);

		const { result } = renderHook(() => useAccountQuota('account-1'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.data).toEqual(SUCCESS));
		expect(mockGetAccountQuota).toHaveBeenCalledWith('account-1');
	});

	it('should throw when the service returns an error result', async () => {
		mockGetAccountQuota.mockResolvedValue({ type: 'error', error: 'boom' });

		const { result } = renderHook(() => useAccountQuota('account-1'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.error).toBeInstanceOf(Error), { timeout: 4000 });
		expect((result.current.error as Error).message).toBe('boom');
	});

	it('should stay disabled while the account id is undefined', async () => {
		mockGetAccountQuota.mockResolvedValue(SUCCESS);

		const { result } = renderHook(() => useAccountQuota(undefined), {
			wrapper: makeWrapper(new QueryClient()),
		});

		expect(result.current.isPending).toBe(true);
		expect(mockGetAccountQuota).not.toHaveBeenCalled();
	});
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/services/tests/use-account-quota.test.tsx`
Expected: FAIL — cannot resolve `../use-account-quota`

- [ ] **Step 3: Write the hook**

Create `apps/admin-ui-domains/src/services/use-account-quota.ts`:

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getAccountQuota } from './get-account-quota';

export const useAccountQuota = (accountId: string | undefined, enabled = true) =>
	useQuery({
		queryKey: domainQueryKeys.accountQuota(accountId ?? ''),
		queryFn: async () => {
			const res = await getAccountQuota(accountId!);
			if (res.type === 'error') {
				throw new Error(res.error);
			}
			return res;
		},
		enabled: !!accountId && enabled,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/services/tests/use-account-quota.test.tsx` → PASS (3 tests)

- [ ] **Step 5: Type-check + lint, then commit**

Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint` → PASS

```bash
git add apps/admin-ui-domains/src/services/use-account-quota.ts apps/admin-ui-domains/src/services/tests/use-account-quota.test.tsx
git commit -m "refactor(domains): add useAccountQuota hook"
```

---

### Task 6: `useCosQuota` hook (TDD)

**Files:**
- Create: `apps/admin-ui-domains/src/services/use-cos-quota.ts`
- Test: `apps/admin-ui-domains/src/services/tests/use-cos-quota.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/admin-ui-domains/src/services/tests/use-cos-quota.test.tsx`:

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

const mockGetCosQuota = vi.hoisted(() => vi.fn());

vi.mock('../get-cos-quota', () => ({
	getCosQuota: mockGetCosQuota,
}));

import { useCosQuota } from '../use-cos-quota';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

const SUCCESS = {
	type: 'success' as const,
	totalComputedLimit: { type: 'unlimited' as const },
};

describe('useCosQuota', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return the success payload', async () => {
		mockGetCosQuota.mockResolvedValue(SUCCESS);

		const { result } = renderHook(() => useCosQuota('cos-1'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.data).toEqual(SUCCESS));
		expect(mockGetCosQuota).toHaveBeenCalledWith('cos-1');
	});

	it('should throw when the service returns an error result', async () => {
		mockGetCosQuota.mockResolvedValue({ type: 'error', error: 'boom' });

		const { result } = renderHook(() => useCosQuota('cos-1'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.error).toBeInstanceOf(Error), { timeout: 4000 });
		expect((result.current.error as Error).message).toBe('boom');
	});

	it('should stay disabled while the cos id is undefined', async () => {
		mockGetCosQuota.mockResolvedValue(SUCCESS);

		const { result } = renderHook(() => useCosQuota(undefined), {
			wrapper: makeWrapper(new QueryClient()),
		});

		expect(result.current.isPending).toBe(true);
		expect(mockGetCosQuota).not.toHaveBeenCalled();
	});
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/services/tests/use-cos-quota.test.tsx`
Expected: FAIL — cannot resolve `../use-cos-quota`

- [ ] **Step 3: Write the hook**

Create `apps/admin-ui-domains/src/services/use-cos-quota.ts`:

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getCosQuota } from './get-cos-quota';

export const useCosQuota = (cosId: string | undefined, enabled = true) =>
	useQuery({
		queryKey: domainQueryKeys.cosQuota(cosId ?? ''),
		queryFn: async () => {
			const res = await getCosQuota(cosId!);
			if (res.type === 'error') {
				throw new Error(res.error);
			}
			return res;
		},
		enabled: !!cosId && enabled,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/services/tests/use-cos-quota.test.tsx` → PASS (3 tests)

- [ ] **Step 5: Type-check + lint, then commit**

Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint` → PASS

```bash
git add apps/admin-ui-domains/src/services/use-cos-quota.ts apps/admin-ui-domains/src/services/tests/use-cos-quota.test.tsx
git commit -m "refactor(domains): add useCosQuota hook"
```

---

### Task 7: Wire quota hooks into `manage-accounts.tsx`

**Files:**
- Modify: `apps/admin-ui-domains/src/views/domain/manange/accounts/manage-accounts.tsx`

Background: `retrieveAccountQuotaByAccountId(accountId, cosIdOfAccount)` (lines 498–531) is called at line 579 inside `getAccountDetail` under `if (isAdvanced)`. It sets 5 account-detail keys from `getAccountQuota`, sets `cosDetail[TOTAL_COMPUTED_QUOTA_LIMIT]` from `getCosQuota`, and invalidates `domainQueryKeys.quota(domainId)`. Replace the function with hooks + effects driven by `accountDetail` (the state that `getAccountDetail` populates).

- [ ] **Step 1: Swap imports**

Remove:

```ts
import { getAccountQuota } from '../../../../services/get-account-quota';
import { getCosQuota } from '../../../../services/get-cos-quota';
```

Add (with the other service imports, order will be fixed by lint):

```ts
import { useAccountQuota } from '../../../../services/use-account-quota';
import { useCosQuota } from '../../../../services/use-cos-quota';
```

- [ ] **Step 2: Delete `retrieveAccountQuotaByAccountId`**

Delete the whole `const retrieveAccountQuotaByAccountId = useCallback(...)` block (lines 498–531).

- [ ] **Step 3: Delete its call site**

In `getAccountDetail`'s `.then`, the `if (isAdvanced)` block (lines 578–583) becomes:

```ts
          if (isAdvanced) {
            getListOtp(data?.account?.[0]?.name);
            getCredentialList(data?.account?.[0]?.name);
            getABQStatus(id);
          }
```

Also remove `retrieveAccountQuotaByAccountId` — it was NOT in that dependency array (it was omitted), so no dep-array change is needed; verify with lint.

- [ ] **Step 4: Add hooks + seeding effects**

After the `const account = useUserAccount();` line (line 103), add:

```ts
  const isAdvancedAccountSelected = isAdvanced && !!accountDetail?.zimbraId;
  const { data: accountQuota, error: accountQuotaError } = useAccountQuota(
    isAdvancedAccountSelected ? (accountDetail?.zimbraId as string) : undefined,
  );
  const { data: cosQuota } = useCosQuota(
    isAdvancedAccountSelected ? (accountDetail?.zimbraCOSId as string | undefined) : undefined,
  );
```

After the `setAccDetailValue` callback definition (line ~478), add:

```ts
  useEffect(() => {
    if (!accountQuota) {
      return;
    }
    setAccDetailValue(TOTAL_COMPUTED_QUOTA_LIMIT, accountQuota.totalComputedLimit);
    setAccDetailValue(TOTAL_QUOTA_USED, accountQuota.totalUsed);
    setAccDetailValue(TOTAL_QUOTA_USED_BY_MODULE, accountQuota.usedByModules);
    setAccDetailValue(TOTAL_QUOTA_SOURCE, accountQuota.totalLimitSource);
    setAccDetailValue(TOTAL_QUOTA_STATUS, accountQuota.totalStatus);
  }, [accountQuota, setAccDetailValue]);

  useEffect(() => {
    if (!cosQuota) {
      return;
    }
    setCosDetail((prev: any) => ({
      ...prev,
      [TOTAL_COMPUTED_QUOTA_LIMIT]: cosQuota.totalComputedLimit,
    }));
  }, [cosQuota]);

  useEffect(() => {
    if (accountQuotaError) {
      createSnackbar({
        key: 'retrieveAccountQuotaError',
        severity: 'error',
        label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    }
  }, [accountQuotaError, createSnackbar, t]);

  useEffect(() => {
    if (accountQuota && domainId) {
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.quota(domainId) });
    }
  }, [accountQuota, domainId, queryClient]);
```

(The last effect preserves the old behavior of invalidating the domain quota cache whenever quota data arrives for a selection.)

- [ ] **Step 5: Verify**

Run (from `apps/admin-ui-domains/`): `pnpm vitest run src/views/domain/manange/accounts/tests/manage-accounts.browser.test.tsx` → PASS
Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint` → PASS

- [ ] **Step 6: Commit**

```bash
git add apps/admin-ui-domains/src/views/domain/manange/accounts/manage-accounts.tsx
git commit -m "refactor(domains): use quota query hooks in manage accounts"
```

---

### Task 8: Wire `useAccountQuota` into `edit-account.tsx` save flow

**Files:**
- Modify: `apps/admin-ui-domains/src/views/domain/manange/accounts/edit-account/edit-account.tsx`

Background: `handleTotalComputedQuotaLimitChange` (lines 470–560) saves quota via set/unset, then refetches `getAccountQuota` and writes `totalComputedQuotaLimit` + `totalQuotaSource` into both `initAccountDetail` and `accountDetail` context states. Replace the refetch with a `useAccountQuota` hook + seeding effect; the save flow just invalidates.

- [ ] **Step 1: Swap imports**

Remove:

```ts
import { getAccountQuota } from '../../../../../services/get-account-quota';
```

Add:

```ts
import { useQueryClient } from '@tanstack/react-query';
```

(first import line group) and

```ts
import { domainQueryKeys } from '../../../../../services/domain-query-keys';
import { useAccountQuota } from '../../../../../services/use-account-quota';
```

(with the service imports).

- [ ] **Step 2: Add hook + seeding/error effects**

After the `const { data: rights = [] } = useCurrentUserRights();` line (line 101), add:

```ts
  const queryClient = useQueryClient();
  const { data: accountQuota, error: accountQuotaError } = useAccountQuota(
    isAdvanced ? (accountDetail?.zimbraId as string | undefined) : undefined,
  );

  useEffect(() => {
    if (!accountQuota) {
      return;
    }
    setInitAccountDetail((prev: any) => ({
      ...prev,
      totalComputedQuotaLimit: accountQuota.totalComputedLimit,
      totalQuotaSource: accountQuota.totalLimitSource,
    }));
    setAccountDetail((prev: any) => ({
      ...prev,
      totalComputedQuotaLimit: accountQuota.totalComputedLimit,
      totalQuotaSource: accountQuota.totalLimitSource,
    }));
  }, [accountQuota, setAccountDetail, setInitAccountDetail]);

  useEffect(() => {
    if (accountQuotaError) {
      createSnackbar({
        key: 'getAccountQuotaError',
        severity: 'error',
        label: accountQuotaError.message,
        autoHideTimeout: 3000,
        hideButton: true,
        replace: false,
      });
    }
  }, [accountQuotaError, createSnackbar]);
```

- [ ] **Step 3: Simplify the save flow**

In `handleTotalComputedQuotaLimitChange`, replace everything from `setOrUnsetPromise` through the closing `});` of the `.catch` (lines 512–547) with:

```ts
      const setOrUnsetPromise =
        accountDetail.totalComputedQuotaLimit === undefined
          ? unsetAccountQuota(accountDetail?.zimbraId)
          : setAccountQuota(accountDetail?.zimbraId, accountDetail.totalComputedQuotaLimit);

      setOrUnsetPromise
        .then(notifyResult)
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: domainQueryKeys.accountQuota(accountDetail?.zimbraId ?? ''),
          });
        })
        .catch((error) => {
          createSnackbar({
            key: 'getAccountQuotaError',
            severity: 'error',
            label: error.message,
            autoHideTimeout: 3000,
            hideButton: true,
            replace: false,
          });
        });
```

(`notifyResult` and the trailing `remove(modifiedKeys, ...)` stay untouched. The refetch + state writes are now the seeding effect's job.)

- [ ] **Step 4: Verify**

Run (from `apps/admin-ui-domains/`): `pnpm vitest run src/views/domain/manange/accounts/tests/manage-accounts.browser.test.tsx` → PASS (edit-account renders inside these tests)
Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint` → PASS

- [ ] **Step 5: Commit**

```bash
git add apps/admin-ui-domains/src/views/domain/manange/accounts/edit-account/edit-account.tsx
git commit -m "refactor(domains): refresh account quota via query invalidation on save"
```

---

### Task 9: Full verification

**Files:** none (verification only)

- [ ] **Step 1: All services unit tests**

Run (from `apps/admin-ui-domains/`): `pnpm vitest run src/services/tests` → PASS (25 files after this increment)

- [ ] **Step 2: Affected browser tests**

Run (from `apps/admin-ui-domains/`):

```bash
pnpm vitest run \
  src/views/domain/manange/accounts/tests/manage-accounts.browser.test.tsx \
  src/views/domain/details/tests/domain-gal-settings.browser.test.tsx \
  src/views/domain/manange/resources/tests/resource-edit-detail-view.browser.test.tsx \
  src/views/domain/details/tests/domain-saml.browser.test.tsx
```
Expected: PASS

- [ ] **Step 3: Repo-wide type check and lint**

Run (repo root): `pnpm type-check && pnpm lint` → PASS (15/15 both)

- [ ] **Step 4: Leftover sanity check**

```bash
rg -n "set-password-service|get-account-service" apps/admin-ui-domains/src || echo clean
rg -n "getAccountQuota|getCosQuota" apps/admin-ui-domains/src/views || echo clean
git status
```
Expected: `clean` for the first two (services only referenced from `src/services/` and tests); working tree clean apart from untracked docs.

---

## Self-Review Notes

- **Coverage:** both duplicate service pairs consolidated (Tasks 1–2), SAML type fixed (Task 3), quota keys + 2 hooks TDD'd (Tasks 4–6), both account views wired (Tasks 7–8), full sweep (Task 9).
- **Placeholder scan:** none — every step carries complete code or exact edit instructions with line anchors.
- **Type consistency:** hooks take `string | undefined` ids with `enabled` guards, matching `use-domain-quota`'s shape; `accountQuota`/`cosQuota` keys defined in Task 4 match the hooks (5/6) and invalidation call (Task 8); seeding-effect keys (`TOTAL_*` constants in manage-accounts, literal `totalComputedQuotaLimit`/`totalQuotaSource` in edit-account) match what the old code wrote.
- **Risk notes:** `manage-accounts` wiring replaces an imperative call inside `getAccountDetail` with effects keyed off `accountDetail` — selection changes swap the query key, fetching quota exactly when the old code did (advanced users only). Structural sharing prevents spurious re-seeds while the selection is unchanged.
