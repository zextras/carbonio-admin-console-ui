# admin-ui-domains React Query Migration — Increment 4 (account-detail read hooks) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the account-detail reads triggered by `openDetailView` in `manage-accounts.tsx` (signatures, distribution-list membership, user sessions) to React Query hooks keyed off a synchronously-set selected-row state.

**Architecture:** `openDetailView(acc)` currently fires five imperative fetches; three of them (`getSignatureDetail`, `getAccountMembership`, `getAllUserSession`) become hooks keyed off a new `selectedDetailAccount` state set synchronously in `openDetailView`. Hooks own fetching/parsing (envelope parsing moves into tested helpers); the component keeps its context states (`signatureList`, `directMemberList`/`inDirectMemberList`, `userSessionList`/`allUserSessionList`) fed by seeding effects — same pattern as Increment 3 Task 7. `getAccountDetail`, `getIdentitiesList` (grants+folders raw SOAP) and `getDeletePasswordRight` stay imperative for now (Increment 5).

**Tech Stack:** React 19, @tanstack/react-query v5, Vitest jsdom unit tests, Playwright browser tests via `admin-ui-test-utils`.

**Conventions:**
- SPDX 2026 header; named exports; no `useMemo`/`useCallback` in new files; 2-space indent in new files.
- **Commit at every completed task.** Stage exactly the listed files, run the given commit. Never push, never amend.
- Unit tests in `src/services/tests/`, `vi.hoisted` + `vi.mock` service modules, `makeWrapper(queryClient)` factory, error-path `waitFor` with `{ timeout: 4000 }`.
- Query options: `staleTime: 30_000, retry: 1, refetchOnWindowFocus: false`, `enabled: !!id`-style guards.

**Test commands (from `apps/admin-ui-domains/` unless noted):**
- Unit: `pnpm vitest run src/services/tests/<file>.test.tsx`
- Browser: `pnpm vitest run src/views/domain/manange/accounts/tests/manage-accounts.browser.test.tsx`
- Repo root: `pnpm type-check`, `pnpm --filter @zextras/admin-ui-domains lint`

**Out of scope (Increment 5+):** grants/folders raw SOAP chain (`getIdentitiesList`/`getFolderList`), `getDeletePasswordRight`/`checkRightRequest`, `getAccountDetail` itself, `accountListDirectory` search hooks, delegates/quarantine views wiring, mutations.

**Approved behavior deltas:**
1. Sessions list now clears via a seeding effect when the new key has no data yet (previously cleared synchronously in `getAllUserSession`) — same visible result, one render later.
2. Signature/membership/session reads are cached per account: reopening the same account shows cached data instantly instead of refetching (staleTime 30s).
3. `getSessions` network failures were previously silent unhandled rejections; the hook now retries once (`retry: 1`) and stays silent otherwise (no error snackbar — preserving old UX).

---

### Task 1: Extend the query key factory

**Files:**
- Modify: `apps/admin-ui-domains/src/services/domain-query-keys.ts`

- [ ] **Step 1: Add the account-read key families**

Add three entries to `domainQueryKeys` (after `cosQuota`, before `twoFactorPolicies`):

```ts
  accountSignatures: (accountId: string) =>
    [...domainQueryKeys.all, 'account-signatures', accountId] as const,
  accountMembership: (accountId: string) =>
    [...domainQueryKeys.all, 'account-membership', accountId] as const,
  userSessions: (accountName: string) =>
    [...domainQueryKeys.all, 'user-sessions', accountName] as const,
```

- [ ] **Step 2: Type-check, then commit**

Run (repo root): `pnpm type-check` → PASS

```bash
git add apps/admin-ui-domains/src/services/domain-query-keys.ts
git commit -m "refactor(domains): add account read query keys"
```

---

### Task 2: `useSignatures` hook (TDD)

**Files:**
- Create: `apps/admin-ui-domains/src/services/use-signatures.ts`
- Test: `apps/admin-ui-domains/src/services/tests/use-signatures.test.tsx`

Background: `getSingatures(accountId)` (in `src/services/get-signature-service.ts`) resolves `{Body: {GetSignaturesResponse: {signature: [...]}}}`. The component reads `data?.Body?.GetSignaturesResponse?.signature || []`.

- [ ] **Step 1: Write the failing test**

Create `apps/admin-ui-domains/src/services/tests/use-signatures.test.tsx`:

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

const mockGetSingatures = vi.hoisted(() => vi.fn());

vi.mock('../get-signature-service', () => ({
	getSingatures: mockGetSingatures,
}));

import { parseSignatures, useSignatures } from '../use-signatures';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('parseSignatures', () => {
	it('should extract the signature array from the envelope', () => {
		const signatures = [{ id: 'sig-1', name: 'default' }];
		expect(
			parseSignatures({ Body: { GetSignaturesResponse: { signature: signatures } } }),
		).toEqual(signatures);
	});

	it('should return an empty array for missing envelopes', () => {
		expect(parseSignatures({ Body: {} })).toEqual([]);
		expect(parseSignatures(undefined)).toEqual([]);
	});
});

describe('useSignatures', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return parsed signatures for the account', async () => {
		const signatures = [{ id: 'sig-1', name: 'default' }];
		mockGetSingatures.mockResolvedValue({
			Body: { GetSignaturesResponse: { signature: signatures } },
		});

		const { result } = renderHook(() => useSignatures('account-1'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.data).toEqual(signatures));
		expect(mockGetSingatures).toHaveBeenCalledWith('account-1');
	});

	it('should stay disabled while the account id is undefined', async () => {
		mockGetSingatures.mockResolvedValue({ Body: {} });

		const { result } = renderHook(() => useSignatures(undefined), {
			wrapper: makeWrapper(new QueryClient()),
		});

		expect(result.current.isPending).toBe(true);
		expect(mockGetSingatures).not.toHaveBeenCalled();
	});
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/services/tests/use-signatures.test.tsx`
Expected: FAIL — cannot resolve `../use-signatures`

- [ ] **Step 3: Write the hook**

Create `apps/admin-ui-domains/src/services/use-signatures.ts`:

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getSingatures } from './get-signature-service';

export function parseSignatures(res: any): Array<any> {
	return res?.Body?.GetSignaturesResponse?.signature ?? [];
}

export const useSignatures = (accountId: string | undefined) =>
	useQuery({
		queryKey: domainQueryKeys.accountSignatures(accountId ?? ''),
		queryFn: async () => parseSignatures(await getSingatures(accountId!)),
		enabled: !!accountId,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/services/tests/use-signatures.test.tsx` → PASS (4 tests)

- [ ] **Step 5: Type-check + lint, then commit**

Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint` → PASS

```bash
git add apps/admin-ui-domains/src/services/use-signatures.ts apps/admin-ui-domains/src/services/tests/use-signatures.test.tsx
git commit -m "refactor(domains): add useSignatures hook"
```

---

### Task 3: `useAccountMembership` hook (TDD)

**Files:**
- Create: `apps/admin-ui-domains/src/services/use-account-membership.ts`
- Test: `apps/admin-ui-domains/src/services/tests/use-account-membership.test.tsx`

Background: `getAccountMembershipRequest(id)` resolves `{dl: [{name, via, ...}]}`. The component splits direct/indirect via the `via` field (view logic stays in the component).

- [ ] **Step 1: Write the failing test**

Create `apps/admin-ui-domains/src/services/tests/use-account-membership.test.tsx`:

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

const mockGetAccountMembershipRequest = vi.hoisted(() => vi.fn());

vi.mock('../get-account-membership', () => ({
	getAccountMembershipRequest: mockGetAccountMembershipRequest,
}));

import { useAccountMembership } from '../use-account-membership';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('useAccountMembership', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return the dl array for the account', async () => {
		const dl = [{ name: 'list-1' }, { name: 'list-2', via: 'nested' }];
		mockGetAccountMembershipRequest.mockResolvedValue({ dl });

		const { result } = renderHook(() => useAccountMembership('account-1'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.data).toEqual(dl));
		expect(mockGetAccountMembershipRequest).toHaveBeenCalledWith('account-1');
	});

	it('should return an empty array when dl is missing', async () => {
		mockGetAccountMembershipRequest.mockResolvedValue({});

		const { result } = renderHook(() => useAccountMembership('account-1'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.data).toEqual([]));
	});

	it('should expose the error when the service rejects', async () => {
		mockGetAccountMembershipRequest.mockRejectedValue(new Error('boom'));

		const { result } = renderHook(() => useAccountMembership('account-1'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		await waitFor(() => expect(result.current.error).toBeInstanceOf(Error), { timeout: 4000 });
		expect((result.current.error as Error).message).toBe('boom');
	});

	it('should stay disabled while the account id is undefined', async () => {
		mockGetAccountMembershipRequest.mockResolvedValue({ dl: [] });

		const { result } = renderHook(() => useAccountMembership(undefined), {
			wrapper: makeWrapper(new QueryClient()),
		});

		expect(result.current.isPending).toBe(true);
		expect(mockGetAccountMembershipRequest).not.toHaveBeenCalled();
	});
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/services/tests/use-account-membership.test.tsx`
Expected: FAIL — cannot resolve `../use-account-membership`

- [ ] **Step 3: Write the hook**

Create `apps/admin-ui-domains/src/services/use-account-membership.ts`:

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getAccountMembershipRequest } from './get-account-membership';

export const useAccountMembership = (accountId: string | undefined) =>
	useQuery({
		queryKey: domainQueryKeys.accountMembership(accountId ?? ''),
		queryFn: async () => (await getAccountMembershipRequest(accountId!))?.dl ?? [],
		enabled: !!accountId,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/services/tests/use-account-membership.test.tsx` → PASS (4 tests)

- [ ] **Step 5: Type-check + lint, then commit**

Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint` → PASS

```bash
git add apps/admin-ui-domains/src/services/use-account-membership.ts apps/admin-ui-domains/src/services/tests/use-account-membership.test.tsx
git commit -m "refactor(domains): add useAccountMembership hook"
```

---

### Task 4: `useUserSessions` hook (TDD)

**Files:**
- Create: `apps/admin-ui-domains/src/services/use-user-sessions.ts`
- Test: `apps/admin-ui-domains/src/services/tests/use-user-sessions.test.tsx`

Background: `getSessions(type, accountName)` resolves `{s: [{name, sid, zid, ...}]}`. The component calls it for types `admin`, `imap`, `soap`, filters by `name === accountName`, maps each to `{ip:'', name, sid, service:'', zid}`, and appends to two lists. The hook combines the three calls via a tested parse helper.

- [ ] **Step 1: Write the failing test**

Create `apps/admin-ui-domains/src/services/tests/use-user-sessions.test.tsx`:

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

const mockGetSessions = vi.hoisted(() => vi.fn());

vi.mock('../get-sessions', () => ({
	getSessions: mockGetSessions,
}));

import { parseUserSessions, useUserSessions } from '../use-user-sessions';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

function makeSessionsResponse(sessions: Array<unknown> | undefined): unknown {
	return sessions ? { s: sessions } : {};
}

describe('parseUserSessions', () => {
	it('should filter by account name and map to UserSession shape', () => {
		const res = makeSessionsResponse([
			{ name: 'user@example.com', sid: 'sid-1', zid: 'zid-1' },
			{ name: 'other@example.com', sid: 'sid-2', zid: 'zid-2' },
			{ name: 'user@example.com', sid: 'sid-3', zid: 'zid-3' },
		]);

		expect(parseUserSessions(res, 'user@example.com')).toEqual([
			{ ip: '', name: 'user@example.com', sid: 'sid-1', service: '', zid: 'zid-1' },
			{ ip: '', name: 'user@example.com', sid: 'sid-3', service: '', zid: 'zid-3' },
		]);
	});

	it('should return an empty array when there are no sessions', () => {
		expect(parseUserSessions(makeSessionsResponse(undefined), 'user@example.com')).toEqual([]);
		expect(parseUserSessions({}, 'user@example.com')).toEqual([]);
	});
});

describe('useUserSessions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should merge the admin, imap and soap session lists', async () => {
		const session = { name: 'user@example.com', sid: 'sid-1', zid: 'zid-1' };
		mockGetSessions.mockImplementation(async (type: string) => {
			if (type === 'admin') return makeSessionsResponse([session]);
			if (type === 'imap') return makeSessionsResponse([session]);
			return makeSessionsResponse(undefined);
		});

		const { result } = renderHook(() => useUserSessions('user@example.com'), {
			wrapper: makeWrapper(new QueryClient()),
		});

		const expected = [
			{ ip: '', name: 'user@example.com', sid: 'sid-1', service: '', zid: 'zid-1' },
			{ ip: '', name: 'user@example.com', sid: 'sid-1', service: '', zid: 'zid-1' },
		];
		await waitFor(() => expect(result.current.data).toEqual(expected));
		expect(mockGetSessions).toHaveBeenCalledTimes(3);
		expect(mockGetSessions).toHaveBeenCalledWith('admin', 'user@example.com');
		expect(mockGetSessions).toHaveBeenCalledWith('imap', 'user@example.com');
		expect(mockGetSessions).toHaveBeenCalledWith('soap', 'user@example.com');
	});

	it('should stay disabled while the account name is undefined', async () => {
		mockGetSessions.mockResolvedValue({});

		const { result } = renderHook(() => useUserSessions(undefined), {
			wrapper: makeWrapper(new QueryClient()),
		});

		expect(result.current.isPending).toBe(true);
		expect(mockGetSessions).not.toHaveBeenCalled();
	});
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/services/tests/use-user-sessions.test.tsx`
Expected: FAIL — cannot resolve `../use-user-sessions`

- [ ] **Step 3: Write the hook**

Create `apps/admin-ui-domains/src/services/use-user-sessions.ts`:

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getSessions } from './get-sessions';

export type UserSession = {
	name: string;
	sid: string;
	zid: string;
	ip: string;
	service: string;
};

const SESSION_TYPES = ['admin', 'imap', 'soap'] as const;

export function parseUserSessions(res: any, accountName: string): Array<UserSession> {
	const sessions = res?.s;
	if (!sessions) {
		return [];
	}
	return sessions
		.filter((sessionItem: any) => sessionItem?.name === accountName)
		.map((sessionItem: any) => ({
			ip: '',
			name: sessionItem?.name,
			sid: sessionItem?.sid,
			service: '',
			zid: sessionItem?.zid,
		}));
}

export const useUserSessions = (accountName: string | undefined) =>
	useQuery({
		queryKey: domainQueryKeys.userSessions(accountName ?? ''),
		queryFn: async () => {
			const responses = await Promise.all(
				SESSION_TYPES.map((type) => getSessions(type, accountName!)),
			);
			return responses.flatMap((res) => parseUserSessions(res, accountName!));
		},
		enabled: !!accountName,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/services/tests/use-user-sessions.test.tsx` → PASS (4 tests)

- [ ] **Step 5: Type-check + lint, then commit**

Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint` → PASS

```bash
git add apps/admin-ui-domains/src/services/use-user-sessions.ts apps/admin-ui-domains/src/services/tests/use-user-sessions.test.tsx
git commit -m "refactor(domains): add useUserSessions hook"
```

---

### Task 5: Wire the three hooks into `manage-accounts.tsx`

**Files:**
- Modify: `apps/admin-ui-domains/src/views/domain/manange/accounts/manage-accounts.tsx`

Background: `openDetailView` (line ~770) fires `getSignatureDetail(acc?.id)`, `getAccountMembership(acc?.id)`, `getAllUserSession(acc?.name)` alongside calls that stay. Replace those three with a `selectedDetailAccount` state + hooks + seeding effects.

- [ ] **Step 1: Swap imports**

Remove:

```ts
import { getAccountMembershipRequest } from '../../../../services/get-account-membership';
import { getSessions } from '../../../../services/get-sessions';
import { getSingatures } from '../../../../services/get-signature-service';
```

Add (with the other `use-*` service imports):

```ts
import { useAccountMembership } from '../../../../services/use-account-membership';
import { useSignatures } from '../../../../services/use-signatures';
import { useUserSessions } from '../../../../services/use-user-sessions';
```

Also delete the local `type UserSession = {...}` declaration (lines ~52–58) and import the hook's type:

```ts
import { type UserSession } from '../../../../services/use-user-sessions';
```

(Import placement will be auto-sorted by lint.)

- [ ] **Step 2: Add selected-row state + hooks**

After `const [signatureItems, setSignatureItems] = useState<any[]>([]);` (line ~291), add:

```ts
  const [selectedDetailAccount, setSelectedDetailAccount] = useState<any>(undefined);
```

After the quota hooks (after `const account = useUserAccount();` + the quota hook block from Increment 3), add:

```ts
  const { data: signatureData } = useSignatures(selectedDetailAccount?.id);
  const { data: membershipData, error: membershipError } = useAccountMembership(
    selectedDetailAccount?.id,
  );
  const { data: sessionsData } = useUserSessions(selectedDetailAccount?.name);
```

- [ ] **Step 3: Delete the three imperative callbacks**

Delete entirely:
- `generateSignatureList` + `getSignatureDetail` (lines ~294–304)
- `getAccountMembership` (lines ~623–657)
- `getAllUserSession` (lines ~738–768)

- [ ] **Step 4: Add seeding effects (where `getSignatureDetail` used to live)**

```ts
  useEffect(() => {
    setSignatureList(signatureData ?? []);
  }, [signatureData]);

  useEffect(() => {
    if (!membershipData) {
      return;
    }
    const directMemArr: any[] = [];
    const inDirectMemArr: any[] = [];
    membershipData.forEach((ele: any) => {
      //remove zimbraIsAdminGroup
      const re = /^__(monitoring|helpdesk|groups|users|delegated|domain)_admins.*/;
      if (re.test(ele?.name)) return;
      if (ele?.via) inDirectMemArr.push({ label: ele?.name, closable: false, disabled: true });
      else directMemArr.push({ label: ele?.name, closable: false, disabled: true });
    });
    setDirectMemberList(directMemArr);
    setInDirectMemberList(inDirectMemArr);
  }, [membershipData]);

  useEffect(() => {
    if (membershipError) {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: membershipError?.message
          ? membershipError?.message
          : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    }
  }, [membershipError, createSnackbar, t]);

  useEffect(() => {
    if (!sessionsData) {
      setUserSessionList([]);
      setAllUserSessionList([]);
      return;
    }
    setUserSessionList(sessionsData);
    setAllUserSessionList(sessionsData);
  }, [sessionsData]);
```

(The `!sessionsData` branch replicates the old synchronous clear when a new account is selected and its query is still pending.)

- [ ] **Step 5: Update `openDetailView`**

Replace the body (lines ~770–789) with:

```ts
  const openDetailView = useCallback(
    (acc: any): void => {
      setAccountDetail({});
      setShowEditAccountView(true);
      setSelectedDetailAccount(acc);
      getAccountDetail(acc?.id);
      getIdentitiesList(acc);
      getDeletePasswordRight(acc?.name);
    },
    [getAccountDetail, getIdentitiesList, getDeletePasswordRight],
  );
```

- [ ] **Step 6: Verify**

Run (from `apps/admin-ui-domains/`): `pnpm vitest run src/views/domain/manange/accounts/tests/manage-accounts.browser.test.tsx` → PASS
Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint` → PASS
Leftover check: `rg -n "getSingatures|getAccountMembershipRequest|getSessions\(" src/views/domain/manange/accounts/manage-accounts.tsx` → no matches

- [ ] **Step 7: Commit**

```bash
git add apps/admin-ui-domains/src/views/domain/manange/accounts/manage-accounts.tsx
git commit -m "refactor(domains): use account read hooks in manage accounts"
```

---

### Task 6: Full verification

**Files:** none (verification only)

- [ ] **Step 1: All services unit tests**

Run (from `apps/admin-ui-domains/`): `pnpm vitest run src/services/tests` → PASS (26 files after this increment)

- [ ] **Step 2: Affected browser tests**

Run (from `apps/admin-ui-domains/`):

```bash
pnpm vitest run src/views/domain/manange/accounts/tests/manage-accounts.browser.test.tsx
```
Expected: PASS

- [ ] **Step 3: Repo-wide type check and lint**

Run (repo root): `pnpm type-check && pnpm lint` → PASS (15/15 both)

- [ ] **Step 4: Leftover sanity check + commit plan doc**

```bash
rg -n "getSingatures|getAccountMembershipRequest" apps/admin-ui-domains/src/views || echo clean
git status
```
Expected: `clean`; working tree clean apart from untracked docs.

```bash
git add docs/superpowers/plans/2026-08-18-domains-react-query-increment-4.md
git commit -m "docs(domains): add increment 4 migration plan"
```

---

## Self-Review Notes

- **Coverage:** 3 read hooks (signatures, membership, sessions) + key families + wiring; grants/folders chain, `checkRightRequest`, `getAccountDetail`, and delegates views explicitly deferred to Increment 5.
- **Placeholder scan:** none — every step carries complete code.
- **Type consistency:** `UserSession` moves from the component to `use-user-sessions.ts` and is imported back (Task 5 Step 1); hook signatures all take `string | undefined` with `enabled` guards, matching Increment 3's hooks; key names (`accountSignatures`/`accountMembership`/`userSessions`) match between Task 1 and Tasks 2–4.
- **Risk notes:** seeding effects preserve the old clear-on-select semantics for sessions only (old code never cleared signatures/membership on select); dep-array shrink in `openDetailView` is validated by lint's `react-hooks/exhaustive-deps`.
