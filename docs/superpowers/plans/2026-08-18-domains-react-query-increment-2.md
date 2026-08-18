# admin-ui-domains React Query Migration — Increment 2 (useMutation + invalidation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the write paths of the five views migrated in Increment 1 (2FA ×2, address-book, anti-DOS, SAML) to `useMutation` hooks that own cache invalidation, removing manual `queryClient.invalidateQueries` calls and pending-state plumbing from components.

**Architecture:** One mutation hook per concern in `src/services/`, TDD with jsdom unit tests asserting both the service dispatch and the `invalidateQueries` call. Hook-level `onSuccess` owns invalidation; components own UI feedback via call-level `mutate(vars, { onSuccess, onError })` callbacks (both levels fire in React Query v5). Service functions stay unchanged; raw envelopes get tested parse/throw helpers where the component previously branched on response content (2FA `ok`/`message`, SAML `data.error`, anti-DOS `Fault`).

**Tech Stack:** React 19, @tanstack/react-query v5 (`useMutation`, `useQueryClient`), Vitest jsdom unit tests (`@testing-library/react` `renderHook` + `act`), Playwright browser tests via `admin-ui-test-utils`.

**Conventions (from AGENTS.md + Increment 1):**
- SPDX header year 2026, named exports, no `useMemo`/`useCallback` in new code.
- 2-space indent for new files; `domain-2fa.tsx` and `global-two-factor-auth.tsx` use TAB indent.
- **Commit at every completed task.** Each task ends with a Commit step — stage exactly the files listed and run the given commit. Never push, never amend.
- Unit tests live in `apps/admin-ui-domains/src/services/tests/`, use the named `QueryWrapper` pattern (anonymous wrappers fail `react/display-name`), and error-path `waitFor` needs `{ timeout: 4000 }` when `retry` is involved (mutations don't retry by default, but keep the pattern for consistency where applicable).
- Invalidation-assertion pattern (used in Tasks 1/3/5/7):

```tsx
const queryClient = new QueryClient();
const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
// renderHook with wrapper that provides THIS queryClient
await act(async () => result.current.mutate(input));
await waitFor(() =>
  expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainQueryKeys.xxx() }),
);
```

**Test commands (run from `apps/admin-ui-domains/` unless noted):**
- Single unit test: `pnpm vitest run src/services/tests/<file>.test.tsx`
- Single browser test: `pnpm vitest run src/views/.../<file>.browser.test.tsx`
- Type check (repo root): `pnpm type-check`
- Lint (repo root): `pnpm --filter @zextras/admin-ui-domains lint`

**Out of scope (Increment 3):** mutations in accounts/DL/resources/devices/quarantine views, device actions, `modifyDomain`/`modifyConfig` writers, duplicate-service consolidation.

**Approved behavior deltas (vs. current code):**
1. Anti-DOS save errors surface via `onError` snackbar (previously silent unhandled rejections).
2. SAML `data.error` responses become thrown `Error`s → uniform `onError` (previously an error branch inside every `.then`).
3. 2FA network-failure snackbar label uses `error.message` (previously `error?.error` on raw envelopes).
4. Invalidations move from components into hooks; `isRequestInProgress` state in `global-address-book.tsx` is replaced by `mutation.isPending`.

---

### Task 1: `useSet2faPolicies` hook (TDD)

**Files:**
- Create: `apps/admin-ui-domains/src/services/use-set-2fa-policies.ts`
- Test: `apps/admin-ui-domains/src/services/tests/use-set-2fa-policies.test.tsx`

Background: `set2faPolicies(domain, service, trustedDevice, trustedIpRange)` (in `src/services/set-2fa-policies.ts`) resolves a raw envelope; payload is `JSON.parse(res.Body.response.content)` → `{ ok, message?, error? }`. Both 2FA views duplicate this parsing plus `OK`-comparison snackbar logic. The hook parses, throws on `!ok`, returns `{ message }`, and invalidates `twoFactorPolicies(domain ?? '')`.

- [ ] **Step 1: Write the failing test**

Create `apps/admin-ui-domains/src/services/tests/use-set-2fa-policies.test.tsx`:

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSet2faPolicies = vi.hoisted(() => vi.fn());

vi.mock('../set-2fa-policies', () => ({
	set2faPolicies: mockSet2faPolicies,
}));

import { domainQueryKeys } from '../domain-query-keys';
import { parseSet2faResponse, useSet2faPolicies } from '../use-set-2fa-policies';

function makeEnvelope(content: unknown): unknown {
	return {
		Body: {
			response: {
				content: JSON.stringify(content),
			},
		},
	};
}

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

const INPUT = { service: 'WebUI', trustedDevice: 1, trustedIpRange: 'empty' };

describe('parseSet2faResponse', () => {
	it('should extract ok and message from the zextras content envelope', () => {
		expect(parseSet2faResponse(makeEnvelope({ ok: 'ok', message: 'ok' }))).toEqual({
			ok: true,
			message: 'ok',
			error: undefined,
		});
	});

	it('should return ok=false with error when the response is not ok', () => {
		expect(parseSet2faResponse(makeEnvelope({ ok: false, error: 'denied' }))).toEqual({
			ok: false,
			message: undefined,
			error: 'denied',
		});
	});

	it('should tolerate missing content', () => {
		expect(parseSet2faResponse({ Body: {} })).toEqual({
			ok: false,
			message: undefined,
			error: undefined,
		});
	});
});

describe('useSet2faPolicies', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call the service, return the message, and invalidate the policies query', async () => {
		mockSet2faPolicies.mockResolvedValue(makeEnvelope({ ok: 'ok', message: 'ok' }));
		const queryClient = new QueryClient();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => useSet2faPolicies('example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate(INPUT));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mockSet2faPolicies).toHaveBeenCalledWith(
			'example.com',
			'WebUI',
			1,
			'empty',
		);
		expect(result.current.data).toEqual({ message: 'ok' });
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.twoFactorPolicies('example.com'),
		});
	});

	it('should throw with the response error when the policy update is rejected', async () => {
		mockSet2faPolicies.mockResolvedValue(makeEnvelope({ ok: false, error: 'denied' }));
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSet2faPolicies('example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate(INPUT));
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.error).toBeInstanceOf(Error);
		expect((result.current.error as Error).message).toBe('denied');
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/services/tests/use-set-2fa-policies.test.tsx` (from `apps/admin-ui-domains/`)
Expected: FAIL — cannot resolve `../use-set-2fa-policies`

- [ ] **Step 3: Write the hook**

Create `apps/admin-ui-domains/src/services/use-set-2fa-policies.ts`:

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { set2faPolicies } from './set-2fa-policies';

export type Set2faPolicyInput = {
	service: string;
	trustedDevice: number | undefined;
	trustedIpRange: string | undefined;
};

export type Set2faPolicyResult = {
	ok: boolean;
	message?: string;
	error?: string;
};

export function parseSet2faResponse(res: any): Set2faPolicyResult {
	if (!res?.Body?.response?.content) {
		return { ok: false };
	}
	const content = JSON.parse(res.Body.response.content);
	return {
		ok: Boolean(content?.ok),
		message: content?.message,
		error: content?.error,
	};
}

export const useSet2faPolicies = (domain: string | undefined) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: Set2faPolicyInput): Promise<{ message?: string }> => {
			const parsed = parseSet2faResponse(
				await set2faPolicies(domain, input.service, input.trustedDevice, input.trustedIpRange),
			);
			if (!parsed.ok) {
				throw new Error(parsed.error ?? '2fa policy update failed');
			}
			return { message: parsed.message };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: domainQueryKeys.twoFactorPolicies(domain ?? ''),
			});
		},
	});
};
```

Note: `parseSet2faResponse` keeps the raw `message` string — the component keeps the `message !== OK` → warning-vs-success snackbar decision, exactly as today.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/services/tests/use-set-2fa-policies.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Type-check + lint**

Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint`
Expected: PASS

- [ ] **Step 6: Commit**

Stage exactly the files below and commit (never push):

```bash
git add apps/admin-ui-domains/src/services/use-set-2fa-policies.ts apps/admin-ui-domains/src/services/tests/use-set-2fa-policies.test.tsx
git commit -m "refactor(domains): add useSet2faPolicies mutation hook"
```

---

### Task 2: Wire `useSet2faPolicies` into both 2FA views

**Files:**
- Modify: `apps/admin-ui-domains/src/views/domain/details/domain-2fa.tsx` (TAB indent!)
- Modify: `apps/admin-ui-domains/src/views/domain/global/global-two-factor-auth.tsx` (TAB indent!)

- [ ] **Step 1: Update `domain-2fa.tsx`**

1a. Imports: remove `useQueryClient` from '@tanstack/react-query' (line 6), remove `domainQueryKeys` import (line 15), remove `set2faPolicies` import (line 16); add:

```
import { useSet2faPolicies } from '../../../services/use-set-2fa-policies';
```

1b. Replace `const queryClient = useQueryClient();` (line 28) with:

```
	const setPolicyMutation = useSet2faPolicies(domainName);
```

1c. Replace the body of `handleOnSave` (lines 62–121) with:

```
	const handleOnSave = (): void => {
		const dif = differenceWith(arrPoliciesToModify, arrPolicies, isEqual);

		map(dif, (policy: TwoFactorAuthPolicyValues) => {
			setPolicyMutation.mutate(
				{
					service: Object.keys(policy)[0],
					trustedDevice: policy[Object.keys(policy)[0]]?.trustedDevice,
					trustedIpRange:
						policy[Object.keys(policy)[0]]?.trustedIpRange?.length !== 0
							? policy[Object.keys(policy)[0]]?.trustedIpRange?.toString()
							: 'empty'
				},
				{
					onSuccess: ({ message }): void => {
						createSnackbar({
							key: 'policy-success',
							severity: message !== OK ? 'warning' : 'success',
							label:
								message !== OK
									? message
									: t(
											'label.2fa-policy-updated-successfully',
											'The settings have been applied to all services'
									  ),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
						setIsDirty(false);
					},
					onError: (error: Error): void => {
						createSnackbar({
							key: 'policy-error',
							severity: 'error',
							label: error?.message
								? error?.message
								: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					}
				}
			);
		});
	};
```

(Snackbar severity/label logic is byte-identical to the old `.then`; invalidation and the `ok` check now live in the hook.)

- [ ] **Step 2: Update `global-two-factor-auth.tsx` the same way**

2a. Imports: remove `useQueryClient`, `domainQueryKeys`, `set2faPolicies`; add `useSet2faPolicies`.

2b. Replace `const queryClient = useQueryClient();` with `const setPolicyMutation = useSet2faPolicies('');`

2c. Replace `handleOnSave` body with the same `mutate` shape as Step 1c — identical code except nothing references `domainName` (the global view passed `''` before; the hook now holds it).

- [ ] **Step 3: Run the 2FA browser tests**

Run: `pnpm vitest run src/views/domain/details/tests/domain-2fa.browser.test.tsx`
Expected: PASS. The test mocks the `set-2fa-policies` module, which the mutation calls; the mocked envelope `{ ok: 'ok', message: 'ok' }` parses to `ok: true, message: 'ok'`, so the success path and invalidation fire.

- [ ] **Step 4: Type-check + lint**

Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/admin-ui-domains/src/views/domain/details/domain-2fa.tsx apps/admin-ui-domains/src/views/domain/global/global-two-factor-auth.tsx
git commit -m "refactor(domains): use useSet2faPolicies in 2fa views"
```

---

### Task 3: `useSetAddressBookServiceEnabled` hook (TDD)

**Files:**
- Create: `apps/admin-ui-domains/src/services/use-set-address-book-service-enabled.ts`
- Test: `apps/admin-ui-domains/src/services/tests/use-set-address-book-service-enabled.test.tsx`

Background: `setAddressBookServiceEnabled(enabled)` (in `src/services/set-address-book-service-enabled.ts`) already asserts `ok` via `assertZextrasOk` and throws on failure. Thin mutation wrapper + invalidation.

- [ ] **Step 1: Write the failing test**

Create `apps/admin-ui-domains/src/services/tests/use-set-address-book-service-enabled.test.tsx`:

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSetAddressBookServiceEnabled = vi.hoisted(() => vi.fn());

vi.mock('../set-address-book-service-enabled', () => ({
	setAddressBookServiceEnabled: mockSetAddressBookServiceEnabled,
}));

import { domainQueryKeys } from '../domain-query-keys';
import { useSetAddressBookServiceEnabled } from '../use-set-address-book-service-enabled';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('useSetAddressBookServiceEnabled', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call the service and invalidate the address book service query', async () => {
		mockSetAddressBookServiceEnabled.mockResolvedValue({ Body: { response: {} } });
		const queryClient = new QueryClient();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => useSetAddressBookServiceEnabled(), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate(true));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mockSetAddressBookServiceEnabled).toHaveBeenCalledWith(true);
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.addressBookService(),
		});
	});

	it('should surface the service error', async () => {
		mockSetAddressBookServiceEnabled.mockRejectedValue(new Error('Service error'));
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSetAddressBookServiceEnabled(), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate(false));
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect((result.current.error as Error).message).toBe('Service error');
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/services/tests/use-set-address-book-service-enabled.test.tsx`
Expected: FAIL — cannot resolve `../use-set-address-book-service-enabled`

- [ ] **Step 3: Write the hook**

Create `apps/admin-ui-domains/src/services/use-set-address-book-service-enabled.ts`:

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { setAddressBookServiceEnabled } from './set-address-book-service-enabled';

export const useSetAddressBookServiceEnabled = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: setAddressBookServiceEnabled,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: domainQueryKeys.addressBookService() });
		},
	});
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/services/tests/use-set-address-book-service-enabled.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Type-check + lint**

Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/admin-ui-domains/src/services/use-set-address-book-service-enabled.ts apps/admin-ui-domains/src/services/tests/use-set-address-book-service-enabled.test.tsx
git commit -m "refactor(domains): add useSetAddressBookServiceEnabled mutation hook"
```

---

### Task 4: Wire `useSetAddressBookServiceEnabled` into `global-address-book.tsx`

**Files:**
- Modify: `apps/admin-ui-domains/src/views/domain/global/global-address-book.tsx`

- [ ] **Step 1: Replace the toggle flow**

1a. Imports: remove `useQueryClient` from '@tanstack/react-query', remove `domainQueryKeys` import; add `useSetAddressBookServiceEnabled` from `../../../services/use-set-address-book-service-enabled`.

1b. Remove state `const [isRequestInProgress, setIsRequestInProgress] = useState(false);` and `const queryClient = useQueryClient();`; add after the `useAddressBookServiceStatus()` line:

```ts
  const setServiceEnabledMutation = useSetAddressBookServiceEnabled();
```

1c. Replace the whole `serviceStartStop` function with:

```ts
  function serviceStartStop(): void {
    if (!isGlobalAdmin) {
      return;
    }

    const nextEnabled = !serviceStatus.running;

    setServiceEnabledMutation.mutate(nextEnabled, {
      onSuccess: () => {
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: nextEnabled
            ? t('label.ldap_address_book_service_started', 'ldap-address-book service started')
            : t('label.ldap_address_book_service_stopped', 'ldap-address-book service stopped'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      },
      onError: (error: Error) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: getErrorLabel(error, fallbackError),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      },
    });
  }
```

1d. Replace `!isRequestInProgress` in `canToggle` and `loading={isRequestInProgress}` on the Button with the mutation's pending state:

```ts
  const canToggle =
    isGlobalAdmin &&
    !isPending &&
    !setServiceEnabledMutation.isPending &&
    (serviceStatus.running ? serviceStatus.couldStop : serviceStatus.couldStart);
```

```tsx
                    loading={setServiceEnabledMutation.isPending}
```

- [ ] **Step 2: Run the browser test**

Run: `pnpm vitest run src/views/domain/global/tests/global-address-book.browser.test.tsx`
Expected: PASS — the test's stateful MSW interceptor serves the toggled status to the invalidation refetch.

- [ ] **Step 3: Type-check + lint**

Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/admin-ui-domains/src/views/domain/global/global-address-book.tsx
git commit -m "refactor(domains): use useSetAddressBookServiceEnabled in global address book"
```

---

### Task 5: `useSaveAntiDosSetting` hook (TDD)

**Files:**
- Create: `apps/admin-ui-domains/src/services/use-save-anti-dos-setting.ts`
- Test: `apps/admin-ui-domains/src/services/tests/use-save-anti-dos-setting.test.tsx`

Background: four ZxConfig setters (one file per attribute) return raw envelopes `{Body: {response: {}}}`; on failure the envelope carries `Body.Fault`. The component currently fires them directly without error handling (silent failures). One mutation hook with an input union dispatching to the right setter; throws on `Fault`; invalidates `antiDosConfig()`.

- [ ] **Step 1: Write the failing test**

Create `apps/admin-ui-domains/src/services/tests/use-save-anti-dos-setting.test.tsx`:

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	setEnabled: vi.fn(),
	setJailDuration: vi.fn(),
	setMaxRequests: vi.fn(),
	setTimeWindow: vi.fn(),
}));

vi.mock('../set-mobile-anti-dos-service', () => ({
	setAntiDosServiceEnabled: mocks.setEnabled,
}));
vi.mock('../set-mobile-anti-dos-service-jail-duration', () => ({
	setAntiDosServiceJailDuration: mocks.setJailDuration,
}));
vi.mock('../set-mobile-anti-dos-service-max-requests', () => ({
	setAntiDosServiceMaxRequests: mocks.setMaxRequests,
}));
vi.mock('../set-mobile-anti-dos-service-time-window', () => ({
	setAntiDosServiceTimeWindow: mocks.setTimeWindow,
}));

import { domainQueryKeys } from '../domain-query-keys';
import { useSaveAntiDosSetting } from '../use-save-anti-dos-setting';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

const OK_ENVELOPE = { Body: { response: {} } };

describe('useSaveAntiDosSetting', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should dispatch enabled to the enabled setter and invalidate the config query', async () => {
		mocks.setEnabled.mockResolvedValue(OK_ENVELOPE);
		const queryClient = new QueryClient();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => useSaveAntiDosSetting(), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate({ field: 'enabled', value: true }));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mocks.setEnabled).toHaveBeenCalledWith(true);
		expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainQueryKeys.antiDosConfig() });
	});

	it('should dispatch each numeric field to its own setter', async () => {
		mocks.setJailDuration.mockResolvedValue(OK_ENVELOPE);
		mocks.setMaxRequests.mockResolvedValue(OK_ENVELOPE);
		mocks.setTimeWindow.mockResolvedValue(OK_ENVELOPE);
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSaveAntiDosSetting(), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate({ field: 'jailDuration', value: 30 }));
		await waitFor(() => expect(mocks.setJailDuration).toHaveBeenCalledWith(30));
		await act(async () => result.current.mutate({ field: 'maxRequests', value: 100 }));
		await waitFor(() => expect(mocks.setMaxRequests).toHaveBeenCalledWith(100));
		await act(async () => result.current.mutate({ field: 'timeWindow', value: 60000 }));
		await waitFor(() => expect(mocks.setTimeWindow).toHaveBeenCalledWith(60000));
	});

	it('should throw when the envelope carries a SOAP Fault', async () => {
		mocks.setEnabled.mockResolvedValue({
			Body: { Fault: { Reason: { Text: 'denied' } } },
		});
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSaveAntiDosSetting(), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate({ field: 'enabled', value: false }));
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect((result.current.error as Error).message).toBe('denied');
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/services/tests/use-save-anti-dos-setting.test.tsx`
Expected: FAIL — cannot resolve `../use-save-anti-dos-setting`

- [ ] **Step 3: Write the hook**

Create `apps/admin-ui-domains/src/services/use-save-anti-dos-setting.ts`:

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { setAntiDosServiceEnabled } from './set-mobile-anti-dos-service';
import { setAntiDosServiceJailDuration } from './set-mobile-anti-dos-service-jail-duration';
import { setAntiDosServiceMaxRequests } from './set-mobile-anti-dos-service-max-requests';
import { setAntiDosServiceTimeWindow } from './set-mobile-anti-dos-service-time-window';

export type SaveAntiDosSettingInput =
	| { field: 'enabled'; value: boolean }
	| { field: 'jailDuration'; value: number }
	| { field: 'maxRequests'; value: number }
	| { field: 'timeWindow'; value: number };

function assertNoFault(res: any): void {
	if (res?.Body?.Fault) {
		throw new Error(res.Body.Fault?.Reason?.Text ?? 'anti-dos setting save failed');
	}
}

export const useSaveAntiDosSetting = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: SaveAntiDosSettingInput): Promise<void> => {
			switch (input.field) {
				case 'enabled':
					assertNoFault(await setAntiDosServiceEnabled(input.value));
					return;
				case 'jailDuration':
					assertNoFault(await setAntiDosServiceJailDuration(input.value));
					return;
				case 'maxRequests':
					assertNoFault(await setAntiDosServiceMaxRequests(input.value));
					return;
				case 'timeWindow':
					assertNoFault(await setAntiDosServiceTimeWindow(input.value));
					return;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: domainQueryKeys.antiDosConfig() });
		},
	});
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/services/tests/use-save-anti-dos-setting.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Type-check + lint**

Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/admin-ui-domains/src/services/use-save-anti-dos-setting.ts apps/admin-ui-domains/src/services/tests/use-save-anti-dos-setting.test.tsx
git commit -m "refactor(domains): add useSaveAntiDosSetting mutation hook"
```

---

### Task 6: Wire `useSaveAntiDosSetting` into `global-active-sync.tsx`

**Files:**
- Modify: `apps/admin-ui-domains/src/views/domain/global/global-active-sync.tsx`

- [ ] **Step 1: Replace the save flow**

1a. Imports: remove `useQueryClient`, remove `domainQueryKeys`, remove the four `set-mobile-anti-dos-service*` imports; add `useSaveAntiDosSetting` from `../../../services/use-save-anti-dos-setting`.

1b. Replace `const queryClient = useQueryClient();` with:

```ts
  const saveSettingMutation = useSaveAntiDosSetting();
```

1c. Replace the whole `onSave` function with:

```ts
  const onSave = (): void => {
    if (mobileAntiDosServiceEnbled !== intMobileAntiDosServiceEnbled) {
      saveSettingMutation.mutate(
        { field: 'enabled', value: mobileAntiDosServiceEnbled },
        { onSuccess: successSnackbar, onError: onErrorSnackbar },
      );
    }
    if (mobileAntiDosServiceJailDuration !== intMobileAntiDosServiceJailDuration) {
      saveSettingMutation.mutate(
        { field: 'jailDuration', value: Number(mobileAntiDosServiceJailDuration) },
        { onSuccess: successSnackbar, onError: onErrorSnackbar },
      );
    }
    if (mobileAntiDosServiceMaxRequests !== intMobileAntiDosServiceMaxRequests) {
      saveSettingMutation.mutate(
        { field: 'maxRequests', value: Number(mobileAntiDosServiceMaxRequests) },
        { onSuccess: successSnackbar, onError: onErrorSnackbar },
      );
    }
    if (mobileAntiDosServiceTimeWindow !== intMobileAntiDosServiceTimeWindow) {
      saveSettingMutation.mutate(
        { field: 'timeWindow', value: Number(mobileAntiDosServiceTimeWindow) },
        { onSuccess: successSnackbar, onError: onErrorSnackbar },
      );
    }
    setIsDirty(false);
  };
```

1d. Add the shared error snackbar next to `successSnackbar`:

```ts
  const onErrorSnackbar = (error: Error): void => {
    createSnackbar({
      key: 'error',
      severity: 'error',
      label: error?.message
        ? error.message
        : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  };
```

(Approved delta: failures were previously silent unhandled rejections.)

- [ ] **Step 2: Run the browser test**

Run: `pnpm vitest run src/views/domain/global/tests/global-active-sync.browser.test.tsx`
Expected: PASS (14 tests — none assert the save flow, but the interceptor serves `set_global_config`)

- [ ] **Step 3: Type-check + lint**

Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/admin-ui-domains/src/views/domain/global/global-active-sync.tsx
git commit -m "refactor(domains): use useSaveAntiDosSetting in global active sync"
```

---

### Task 7: `useSamlMutation` hook (TDD)

**Files:**
- Create: `apps/admin-ui-domains/src/services/use-saml-mutation.ts`
- Test: `apps/admin-ui-domains/src/services/tests/use-saml-mutation.test.tsx`

Background: five SAML write services (`importSamlConfig`, `generateSignedCertificate`, `updateSamlAttributes`, `deleteSamlAttributes` with/without `keys`) all resolve data-or-`{error}` REST bodies. The component branches on `data?.error` in every `.then`. One mutation with an input union; `mutationFn` throws `Error(data.error)`; invalidates `samlConfig(domain)`. `exportMetadata` (a download, not a cache write) stays a direct call.

- [ ] **Step 1: Write the failing test**

Create `apps/admin-ui-domains/src/services/tests/use-saml-mutation.test.tsx`:

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	deleteSamlAttributes: vi.fn(),
	generateSignedCertificate: vi.fn(),
	importSamlConfig: vi.fn(),
	updateSamlAttributes: vi.fn(),
}));

vi.mock('../delete-saml-attributes', () => ({
	deleteSamlAttributes: mocks.deleteSamlAttributes,
}));
vi.mock('../generate-signed-certificate', () => ({
	generateSignedCertificate: mocks.generateSignedCertificate,
}));
vi.mock('../import-saml-configurations', () => ({
	importSamlConfig: mocks.importSamlConfig,
}));
vi.mock('../update-saml-attributes', () => ({
	updateSamlAttributes: mocks.updateSamlAttributes,
}));

import { domainQueryKeys } from '../domain-query-keys';
import { useSamlMutation } from '../use-saml-mutation';

function makeWrapper(queryClient: QueryClient) {
	return function QueryWrapper({ children }: { children: ReactNode }): ReactNode {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('useSamlMutation', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should dispatch import and invalidate the saml config query', async () => {
		mocks.importSamlConfig.mockResolvedValue({ imported: true });
		const queryClient = new QueryClient();
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => useSamlMutation('example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () =>
			result.current.mutate({ op: 'import', url: 'https://idp/metadata', allowUnsecure: false }),
		);
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mocks.importSamlConfig).toHaveBeenCalledWith(
			'example.com',
			'https://idp/metadata',
			false,
		);
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: domainQueryKeys.samlConfig('example.com'),
		});
	});

	it('should dispatch saveAttribute with the attribute body', async () => {
		mocks.updateSamlAttributes.mockResolvedValue({ attr: 'value' });
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSamlMutation('example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () =>
			result.current.mutate({ op: 'saveAttribute', key: 'attr', value: 'value' }),
		);
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mocks.updateSamlAttributes).toHaveBeenCalledWith('example.com', { attr: 'value' });
	});

	it('should dispatch removeAttribute with the keys query param', async () => {
		mocks.deleteSamlAttributes.mockResolvedValue({});
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSamlMutation('example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate({ op: 'removeAttribute', key: 'attr' }));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mocks.deleteSamlAttributes).toHaveBeenCalledWith('example.com', 'attr');
	});

	it('should dispatch deleteConfig without keys', async () => {
		mocks.deleteSamlAttributes.mockResolvedValue({});
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSamlMutation('example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate({ op: 'deleteConfig' }));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mocks.deleteSamlAttributes).toHaveBeenCalledWith('example.com', undefined);
	});

	it('should dispatch generate', async () => {
		mocks.generateSignedCertificate.mockResolvedValue({ generated: true });
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSamlMutation('example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate({ op: 'generate' }));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mocks.generateSignedCertificate).toHaveBeenCalledWith('example.com');
	});

	it('should throw when the response carries an error', async () => {
		mocks.generateSignedCertificate.mockResolvedValue({ error: 'not found' });
		const queryClient = new QueryClient();

		const { result } = renderHook(() => useSamlMutation('example.com'), {
			wrapper: makeWrapper(queryClient),
		});

		await act(async () => result.current.mutate({ op: 'generate' }));
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect((result.current.error as Error).message).toBe('not found');
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/services/tests/use-saml-mutation.test.tsx`
Expected: FAIL — cannot resolve `../use-saml-mutation`

- [ ] **Step 3: Write the hook**

Create `apps/admin-ui-domains/src/services/use-saml-mutation.ts`:

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteSamlAttributes } from './delete-saml-attributes';
import { domainQueryKeys } from './domain-query-keys';
import { generateSignedCertificate } from './generate-signed-certificate';
import { importSamlConfig } from './import-saml-configurations';
import { updateSamlAttributes } from './update-saml-attributes';

export type SamlMutationInput =
	| { op: 'import'; url: string; allowUnsecure: boolean }
	| { op: 'generate' }
	| { op: 'saveAttribute'; key: string; value: unknown }
	| { op: 'removeAttribute'; key: string }
	| { op: 'deleteConfig' };

async function assertNoError(res: any): Promise<any> {
	if (res?.error) {
		throw new Error(res.error);
	}
	return res;
}

export const useSamlMutation = (domain: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: SamlMutationInput): Promise<void> => {
			switch (input.op) {
				case 'import':
					await assertNoError(
						await importSamlConfig(domain, input.url, input.allowUnsecure),
					);
					return;
				case 'generate':
					await assertNoError(await generateSignedCertificate(domain));
					return;
				case 'saveAttribute':
					await assertNoError(
						await updateSamlAttributes(domain, { [input.key]: input.value } as JSON),
					);
					return;
				case 'removeAttribute':
					await assertNoError(await deleteSamlAttributes(domain, input.key));
					return;
				case 'deleteConfig':
					await assertNoError(await deleteSamlAttributes(domain));
					return;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: domainQueryKeys.samlConfig(domain) });
		},
	});
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/services/tests/use-saml-mutation.test.tsx`
Expected: PASS (6 tests)

- [ ] **Step 5: Type-check + lint**

Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/admin-ui-domains/src/services/use-saml-mutation.ts apps/admin-ui-domains/src/services/tests/use-saml-mutation.test.tsx
git commit -m "refactor(domains): add useSamlMutation hook"
```

---

### Task 8: Wire `useSamlMutation` into `domain-saml.tsx`

**Files:**
- Modify: `apps/admin-ui-domains/src/views/domain/details/domain-saml.tsx`

- [ ] **Step 1: Replace the five mutation callbacks**

1a. Imports: remove `useQueryClient`, `domainQueryKeys`, `importSamlConfig`, `updateSamlAttributes`, `deleteSamlAttributes`, `generateSignedCertificate`; add `useSamlMutation` from `../../../services/use-saml-mutation`. Keep `getSamlConfig` (used by `exportMetadata`).

1b. Replace `const queryClient = useQueryClient();` and delete the `refreshSamlConfig` function; add:

```ts
  const samlMutation = useSamlMutation(domainName);
```

1c. Replace `importSAMLConfigurations` with:

```tsx
  const importSAMLConfigurations = useCallback(
    (domain: string, url: string, allowUnsecure: boolean): void => {
      samlMutation.mutate(
        { op: 'import', url, allowUnsecure },
        {
          onSuccess: () => {
            createSnackbar({
              key: 'success',
              severity: 'success',
              label: t('label.you_have_imported_the_configuration', 'You have imported the configuration'),
              autoHideTimeout: 3000,
              hideButton: true,
              replace: true,
            });
          },
          onError: showError,
        },
      );
    },
    [createSnackbar, samlMutation, showError, t],
  );
```

1d. Replace `generateSPCertificates` with:

```tsx
  const generateSPCertificates = useCallback(
    (domain: string): void => {
      samlMutation.mutate(
        { op: 'generate' },
        {
          onSuccess: () => {
            createSnackbar({
              key: 'success',
              severity: 'success',
              label: t(
                'label.you_have_generated_the_sp_certificate',
                'You have generated the SP Certificate',
              ),
              autoHideTimeout: 3000,
              hideButton: true,
              replace: true,
            });
          },
          onError: showError,
        },
      );
    },
    [createSnackbar, samlMutation, showError, t],
  );
```

1e. Replace `addOrUpdateSAMLAttributes` with:

```tsx
  const addOrUpdateSAMLAttributes = useCallback(
    (domain: string, key: string, value: unknown, isUpdate: boolean): void => {
      samlMutation.mutate(
        { op: 'saveAttribute', key, value },
        {
          onSuccess: () => {
            setSamlAttrKey('');
            setSamlAttrValue('');
            const attributeName = key;
            if (isUpdate) {
              createSnackbar({
                key: 'success',
                severity: 'success',
                label: t('label.you_have_updated_attribute', {
                  attributeName,
                  defaultValue: 'You have updated the {{ attributeName }} attribute',
                }),
                autoHideTimeout: 3000,
                hideButton: true,
                replace: true,
              });
            } else {
              createSnackbar({
                key: 'success',
                severity: 'success',
                label: t('label.you_have_added_attribute', {
                  attributeName,
                  defaultValue: 'You have added the {{ attributeName }} attribute',
                }),
                autoHideTimeout: 3000,
                hideButton: true,
                replace: true,
              });
            }
          },
          onError: showError,
        },
      );
    },
    [createSnackbar, samlMutation, showError, t],
  );
```

1f. Replace `removeSAMLAttributes` with:

```tsx
  const removeSAMLAttributes = useCallback(
    (domain: string, key: string): void => {
      samlMutation.mutate(
        { op: 'removeAttribute', key },
        {
          onSuccess: () => {
            setSamlAttrKey('');
            setSamlAttrValue('');
            createSnackbar({
              key: 'success',
              severity: 'success',
              label: t('label.you_have_removed_attribute', {
                attributeName: key,
                defaultValue: 'You have removed the {{ attributeName }} attribute',
              }),
              autoHideTimeout: 3000,
              hideButton: true,
              replace: true,
            });
          },
          onError: showError,
        },
      );
    },
    [createSnackbar, samlMutation, showError, t],
  );
```

1g. Replace `deleteSAMLConfigurations` with:

```tsx
  const deleteSAMLConfigurations = useCallback(
    (domain: string): void => {
      samlMutation.mutate(
        { op: 'deleteConfig' },
        {
          onSuccess: () => {
            createSnackbar({
              key: 'success',
              severity: 'success',
              label: t(
                'label.you_have_deleted_the_configuration',
                'You have deleted the configuration',
              ),
              autoHideTimeout: 3000,
              hideButton: true,
              replace: true,
            });
          },
          onError: showError,
        },
      );
    },
    [createSnackbar, samlMutation, showError, t],
  );
```

(`showError` already reads `error?.message`; thrown `Error`s flow straight through. `exportMetadata` stays as the direct `getSamlConfig` call — it is a download, not a cache write.)

- [ ] **Step 2: Run the SAML browser test**

Run: `pnpm vitest run src/views/domain/details/tests/domain-saml.browser.test.tsx`
Expected: PASS (3 tests — rendering + export, both untouched by this task)

- [ ] **Step 3: Type-check + lint**

Run (repo root): `pnpm type-check && pnpm --filter @zextras/admin-ui-domains lint`
Expected: PASS (import order may need `eslint --fix`)

- [ ] **Step 4: Commit**

```bash
git add apps/admin-ui-domains/src/views/domain/details/domain-saml.tsx
git commit -m "refactor(domains): use useSamlMutation in domain saml view"
```

---

### Task 9: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run all services unit tests**

Run (from `apps/admin-ui-domains/`): `pnpm vitest run src/services/tests`
Expected: PASS (21 files after this increment)

- [ ] **Step 2: Run all affected browser tests**

Run (from `apps/admin-ui-domains/`):

```bash
pnpm vitest run \
  src/views/domain/details/tests/domain-2fa.browser.test.tsx \
  src/views/domain/details/tests/domain-saml.browser.test.tsx \
  src/views/domain/global/tests/global-address-book.browser.test.tsx \
  src/views/domain/global/tests/global-active-sync.browser.test.tsx \
  src/views/domain/two-factor-authentication/tests/2fa-config.browser.test.tsx
```
Expected: PASS (50 tests)

- [ ] **Step 3: Repo-wide type check and lint**

Run (repo root): `pnpm type-check && pnpm lint`
Expected: PASS (15/15 both)

- [ ] **Step 4: Sanity-check for leftovers**

Run: `git grep -n "set2faPolicies\|setAddressBookServiceEnabled\|setAntiDosService\|importSamlConfig\|updateSamlAttributes\|deleteSamlAttributes\|generateSignedCertificate" apps/admin-ui-domains/src/views`
Expected: matches ONLY inside `src/views/**/tests/**` (test mocks); zero direct service imports left in view components.

Run: `git status`
Expected: only untracked `docs/` (plan files) — all code changes manually committed by the user.

---

## Self-Review Notes

- **Coverage:** all five Increment-1 views' write paths migrated; 4 mutation hooks (`useSet2faPolicies`, `useSetAddressBookServiceEnabled`, `useSaveAntiDosSetting`, `useSamlMutation`) with invalidation owned at hook level; components reduced to `mutate(vars, { onSuccess, onError })`.
- **Placeholder scan:** none — every step carries complete code.
- **Type consistency:** `Set2faPolicyInput` fields match the four `set2faPolicies` args; `SaveAntiDosSettingInput` union matches the four setter signatures (`boolean`/`number`); `SamlMutationInput` ops match the five wiring call sites; invalidation keys reuse the `domainQueryKeys` factory from Increment 1 unchanged.
- **`JSON` cast note:** `updateSamlAttributes(domain, body: JSON)` has a bogus service-side type (`JSON`); the hook uses `as JSON` at the single call site rather than editing the service (service consolidation is Increment 3 scope).
