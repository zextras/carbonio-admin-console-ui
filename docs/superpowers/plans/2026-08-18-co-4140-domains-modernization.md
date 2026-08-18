# CO-4140 — admin-ui-domains Modernization Implementation Plan (Master Roadmap)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan phase-by-phase. Phases use checkbox (`- [ ]`) syntax for tracking. This is the **master roadmap**: before starting each phase, generate a detailed per-task sub-plan (writing-plans style, with full code) from the inventory in this document, because code-level details for the monster files cannot be known reliably until each file is read.

**Jira:** [CO-4140](https://zextras.atlassian.net/browse/CO-4140) — [AdminRefactor][Domains] Modernize admin-ui-domains architecture to match admin-ui-cos standards
**Reference precedent:** [CO-3770](https://zextras.atlassian.net/browse/CO-3770) — the COS module overhaul (Done)

**Goal:** Bring the Domains module (the largest Admin Console module) to the same modern standard as `admin-ui-cos`: React Compiler with zero manual memoization, React Query for all server state, TanStack Form + zod for all forms, ~80% automated test coverage, proper accessibility, and no file over ~800 lines.

**Architecture:** The app already has a clean ~104-file SOAP service layer (after Increment 3 consolidation); the refactor routes all data access through React Query hooks (COS convention) built on top of it, removes the 520 manual `useMemo`/`useCallback` calls the React Compiler makes redundant, decomposes 16 oversized files into small focused components/hooks behind characterization tests, and migrates forms to TanStack Form with the canonical post-save `form.reset()` + query-invalidation pattern. Each phase ships independently green (lint + type-check + tests).

**Tech Stack:** React 19 + React Compiler (already wired in root vitest/bootstrap configs), `@tanstack/react-query` v5, `@tanstack/react-form` (to be added) + zod, `@zextras/ui-components` / `@zextras/ui-shared` (`soapFetch`, `flushCache`, RQ hooks), Vitest 4 (jsdom unit + Playwright browser mode), MSW, `admin-ui-test-utils`.

---

## 0. Progress Log (updated 2026-08-18, branch `CO-4140-refactor-admin-ui-domains`, 33 commits)

### Done — React Query migration, Increments 1–4

Sub-plans (per the just-in-time-detail agreement, §4): `2026-08-18-domains-react-query-increment-{1..4}.md` in this directory. Each increment was executed task-by-task with TDD and a commit per task.

- **13 new hooks in `src/services/`** (9 query + 4 mutation), each with unit tests (13 new test files; `src/services/tests` is now 26 files / 110 tests):
  - Query: `use-2fa-policies`, `use-address-book-service`, `use-anti-dos-config`, `use-saml-config`, `use-account-quota`, `use-cos-quota`, `use-signatures`, `use-account-membership`, `use-user-sessions`
  - Mutation: `use-set-2fa-policies`, `use-set-address-book-service-enabled`, `use-save-anti-dos-setting`, `use-saml-mutation`
- **Query-key factory grown 3 → 13 key families**: `all`, `list`, `quota` + new `accountQuota`, `cosQuota`, `twoFactorPolicies`, `addressBookService`, `antiDosConfig`, `samlConfig`, `accountSignatures`, `accountMembership`, `userSessions`.
- **7 views migrated off `useEffect`-fetch / manual pending state**: `domain-2fa`, `global-two-factor-auth`, `global-address-book`, `global-active-sync`, `domain-saml`, `manage-accounts` (quota + signatures/membership/sessions detail reads), `edit-account` (quota read + post-save invalidation). Wiring pattern: components keep local edit state; server truth via `useQuery`; seeding effects write query data into existing form state; error effects surface snackbars (RQ v5 has no per-query `onError`).
- **Service consolidation**: duplicate `set-password-service.ts` and `get-account-service.ts` deleted (canonical files widened); bogus `updateSamlAttributes(domain, body: JSON)` param type fixed to `Record<string, unknown>`.
- **React Query presence**: 12 → 25 non-test files using RQ APIs.
- **Verification at branch tip**: 26 service test files / 110 unit tests green; affected browser tests green (2FA ×2, SAML, address-book, active-sync, manage-accounts, GAL settings, resource-edit — 100+ browser tests); `pnpm type-check` and `pnpm lint` 15/15.

### Approved behavior deltas (per Working Agreements §4)

1. Anti-DOS and SAML save failures now surface via error snackbars (previously silent unhandled rejections).
2. `useCosQuota` skips the fetch when `cosId` is undefined (previously a guaranteed 404 silently swallowed).
3. `edit-account` fetches account quota on mount when `isAdvanced` (previously only after a quota save).
4. 2FA warning-snackbar falls back to the success label when `message` is undefined (surfaced by typing).

### Convention deviation (recorded, revisit on request)

Mutation hooks own **invalidation only**; components own snackbar feedback via call-level `mutate(vars, { onSuccess, onError })` (both fire in RQ v5). This differs from §2.2's "mutation hook owns snackbar + i18n" — chosen to preserve existing per-view snackbar copy/severity during the refactor without behavior changes. Revisit if strict COS alignment is wanted.

### Remaining React Query scope (Increment 5+ candidates)

Delegates views (reuse the new `useSignatures`/`useAccountMembership`/`useUserSessions` hooks), grants/folders raw-SOAP chain extraction (`getIdentitiesList`/`getFolderList`, `GetGrantsRequest`, `GetFolderRequest`), `checkRightRequest`, `getAccountDetail` itself, `accountListDirectory` search (pair with `useDebouncedValue`), `countAccount`, mailing-list / resource / quarantine / virtual-host reads, `modifyDomain`/`modifyAccountRequest`/`modifyConfig` mutations, raw `VerifyCertKey`/`GetDomainCert`/`getBackupAccounts` extraction.

---

## 1. Current-State Inventory (verified 2026-08-18)

All paths relative to `apps/admin-ui-domains/` unless noted. Source = non-test `.ts`/`.tsx` files.

### 1.1 Scale

| Metric | Value |
|---|---|
| Non-test source files | 245 (129 `.ts`, 116 `.tsx`) |
| Non-test LOC | ~52,300 |
| Service layer files (`src/services/`) | 104 (thin `soapFetch` wrappers + 13 RQ hooks; 2 duplicates deleted in Increment 3) |
| Existing test files | 71 (49 `.browser.test.tsx`, 22 unit) |

### 1.2 The 16 oversized files (>800 lines) — decomposition targets

| # | Lines | File | Notes |
|---|---|---|---|
| 1 | 1643 | `src/views/utility/utils.ts` | grab-bag utils, split by domain |
| 2 | 1600 | `src/views/quarantine/quarantine-list.tsx` | **0 tests** |
| 3 | 1586 | `src/views/domain/manange/accounts/edit-account/edit-account-security-section.tsx` | **0 tests** |
| 4 | 1468 | `src/views/domain/details/domain-gal-settings.tsx` | has some RQ usage |
| 5 | 1463 | `src/views/domain/manange/mailing-list/edit-mailing-detail-view.tsx` | **0 tests** |
| 6 | 1383 | `src/views/domain/details/domain-general-settings.tsx` | has some RQ usage |
| 7 | 1358 | `src/views/domain/manange/accounts/manage-accounts.tsx` | ~30 `useState`; quota + 3 detail reads now via RQ hooks (Inc 3–4) |
| 8 | 1299 | `src/views/domain/manange/accounts/edit-account/edit-account-delegates-section.tsx` | **0 tests** |
| 9 | 1198 | `src/views/domain/manange/accounts/edit-account/edit-account.tsx` | quota flow now via RQ hook (Inc 3); still 0 direct tests |
| 10 | 1195 | `src/views/domain/manange/delegates/manage-delegates.tsx` | |
| 11 | 1194 | `src/views/domain/manange/accounts/edit-account/edit-account-general-section.tsx` | |
| 12 | 1191 | `src/views/domain/manange/resources/resource-edit-detail-view.tsx` | |
| 13 | 952 | `src/views/domain/details/domain-authentication.tsx` | |
| 14 | 872 | `src/views/domain/global-delegates.tsx` | |
| 15 | 855 | `src/views/domain/manange/mailing-list/edit-mailing-detail/send-as-tab.tsx` | **0 tests** |
| 16 | 806 | `src/views/domain/manange/mailing-list/domain-mailing-list.tsx` | |

Near-misses to include when touched: `edit-account-user-pref-section.tsx` (786), `domain-cos-link.tsx` (734), `members-tab.tsx` (706), `mailing-list-settings-sections.tsx` (686), `create-new-domain.tsx` (673), `domain-saml.tsx` (731 after Increment 2 slimming), `global-active-sync.tsx` (349) and `global-address-book.tsx` (310) now well under target.

Note: `manange/` is a pre-existing directory typo. Keep the typo in path references until Phase 3 renames it (rename is a standalone, no-op-diff move paired with import updates).

### 1.3 Manual memoization & legacy patterns (React Compiler makes these dead weight)

| Pattern | Count | Files |
|---|---|---|
| `useCallback` | 361 | 77 files total (memo hooks) |
| `useMemo` | 159 | same 77 files |
| `FC<...>` | 60 | scattered |
| default exports | 66 | (except `src/app.tsx` which must stay default) |
| `useEffect` | 195 | ~64 files; 19 view files fetch via `useEffect` + nested `.then` |
| `useState` | 753 | `manage-accounts.tsx` alone has ~30 |

Top memoization offenders: `manage-accounts.tsx` (30), `edit-account-general-section.tsx` (26), `edit-account-security-section.tsx` (25), `manage-delegates.tsx` (24), `quarantine-list.tsx` (21), `resource-edit-detail-view.tsx` (20), `edit-account.tsx` (20), `global-delegates.tsx` (18), `edit-account-user-pref-section.tsx` (17), `domain-gal-settings.tsx` (15).

### 1.4 Data fetching today (post-Increments 1–4)

- Service layer: `src/services/` — 104 files (2 duplicates deleted), thin `soapFetch` wrappers, mostly untyped (`Promise<any>`).
- Transport calls in views: `soapFetch` ×111, `postSoapFetchRequest` ×36 overall; some views call SOAP directly (`domain-virtual-hosts.tsx`, `load-verify-certificate.tsx`, `search-domain-service.ts`).
- React Query in **25 non-test files**: `domain-query-keys.ts` (13 key families, see §0) + 13 local hooks in `src/services/use-*.ts` + 7 migrated views + the pre-existing `use-domain-list`/`use-domain-quota`/`use-domain-search`.
- `@zextras/ui-shared` already ships canonical RQ hooks (`use-domain-by-id`, `use-account`, `use-rights`, `useCosList`, `useAllConfig`, `useMailstoreServers`, `useDebouncedValue`…) — prefer extending/reusing these before writing new ones.
- Still imperative (Increment 5+): delegates views (`manage-delegates`, `global-delegates`, `edit-account-delegates-section`), quarantine, mailing-list tabs, resource detail, virtual hosts, `getAccountDetail`/`getAccountSpecificDetail`/`getCosDetail`/`checkRightRequest`/`countAccount` in `manage-accounts`, the grants/folders chain (`getIdentitiesList`/`getFolderList`).
- Anti-pattern to eliminate (real example, `quarantine-list.tsx:810-852`): `useCallback` wrapping a nested `.then` chain with manual `setRequestInprogress` flags, re-invoked manually after every mutation (lines 893, 945, 980, 1214).

### 1.5 Test coverage

- Good: `views/domain/details/*` (10 browser tests), `edit-account/parts/*` quotas (7), resources (3), address-book (3), restore-delete-account (2), domain-list/global tabs, **26 service unit-test files (110 tests, incl. 13 new hook suites from Increments 1–4)**, `views/utility/tests/utils.test.ts`.
- **Zero coverage, highest risk:** `quarantine-list.tsx` + `attachments-block.tsx`; entire `edit-mailing-detail/` tree (members/owners/send-as/send-to/general tabs) + `edit-mailing-detail-view.tsx`; `edit-account.tsx` (exercised indirectly via manage-accounts browser tests, but no direct suite), `edit-account-delegates-section.tsx`, `edit-account-administration-section.tsx`, `signature-detail.tsx`, `add-delegate-section/*`; `src/composer/` (TinyMCE), `src/wsc/wsc-settings.tsx`, `src/hooks/use-selected-domain.ts`, `global-detail-panel.tsx`, `active-device-detail.tsx`, `create-new-domain.tsx`; ~93 of 104 services untested (all 13 new RQ hooks are tested).

### 1.6 Accessibility

- 9 `aria-label`s in 5 files (icon-only buttons: `attachments-block`, `address-book-detail-panel`, `owners-tab`, `members-tab`, `send-as-tab`, `send-to-tab`). Zero `role=`, zero `aria-labelledby`, no axe tooling. `eslint-plugin-jsx-a11y` is configured repo-wide (static lint only).

### 1.7 Dependencies & config facts

- Dead dep: `zustand` declared, **zero imports** → remove. `src/store/` holds only types.
- Missing dep: `@tanstack/react-form` (storage/privacy/cos/backup already have it) → add.
- Unique deps: `tinymce` + `@tinymce/tinymce-react` (composer; heavy mocking in root vitest base config), `date-fns`, `react-csv`, `qrcode.react`, `immer`, `html-entities`.
- React Compiler babel preset already active app-wide at build/test level (root `vitest.config.base.ts`, `apps/admin-ui-bootstrap/vite.config.ts`) — the 520 manual memo calls are pure redundancy today.
- Root `eslint.config.js` **strict block** (lines ~94-128: `react-compiler/react-compiler: error`, jsx-a11y recommended, `react-you-might-not-need-an-effect`, all `react-hooks/*` errors) currently covers only a sliver of domains: `src/views/domain/domain-list/**`, `domain-list-panel.tsx`, `global-list-panel.tsx`. The comment at line 92 states the goal is all apps eventually.
- react-router v8 (`useNavigate`/`useParams` ×18 files), `useContext` ×26 (e.g. `AccountDetail` context), state otherwise prop-drilled; no TanStack Form.

---

## 2. Target Conventions (the COS standard to replicate)

Reference implementation: `apps/admin-ui-cos/`. Authoritative convention guide: repo root `AGENTS.md`.

### 2.1 File layout

```
src/
├── app.tsx                  # ONLY default export (micro-frontend entry)
├── constants.ts             # UPPER_SNAKE_CASE
├── services/                # flat, kebab-case: SOAP fns + RQ hooks + query-key factory + tests/
├── utils/                   # cross-view pure utils + tests/
├── views/<feature>/         # small components (<~400 lines), feature-local hooks/, schema.ts, tests/
└── types/                   # shared SOAP domain types (outside src/ if published, like cos)
```

### 2.2 Services + React Query (the 5-option contract)

```typescript
// services/<verb>-<noun>.ts — SOAP fn: thin, typed, no logic
export const modifyDomain = async (body: ModifyDomainBody): Promise<DomainResponse> =>
	soapFetch(`ModifyDomain`, { ...body });
```

```typescript
// services/domain-query-keys.ts — one factory, hierarchical keys
export const domainQueryKeys = {
  all: ['domain'] as const,
  detail: (domainId: string) => [...domainQueryKeys.all, 'detail', domainId] as const,
  list: (searchQuery: string, limit: number, offset: number) =>
    [...domainQueryKeys.all, 'list', searchQuery, limit, offset] as const,
} as const;
```

```typescript
// services/use-<noun>.ts — EVERY query uses the same 5 options
export const useDomainDetail = (domainId: string | undefined) =>
  useQuery({
    queryKey: domainQueryKeys.detail(domainId ?? ''),
    queryFn: async () => {
      const res = await getDomain(domainId!);
      if (res.type === 'error') throw new Error(res.error);
      return res;
    },
    enabled: !!domainId,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    retry: 1,
    refetchOnWindowFocus: false,
  });
```

```typescript
// services/use-<verb>-<noun>.ts — mutation hook owns snackbar + i18n + invalidation
export const useModifyDomain = () => {
  const createSnackbar = useSnackbar();
  const [t] = useTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: modifyDomain,
    onSuccess: async () => {
      await flushCache(); // ui-shared SOAP cache when needed
      await queryClient.invalidateQueries({ queryKey: domainQueryKeys.all });
      createSnackbar({ key: 'domain-modified', severity: 'success', /* ... */ });
    },
    onError: (error) =>
      createSnackbar(generateSnackbarFromError(error, t)),
  });
};
```

Rules:
- Before writing a new hook, check `packages/ui-shared/src/react-query/` — extend the shared hook if two apps need it.
- Components read `isPending` → shimmer/skeleton (`<ds-page-shimmer>`), `isPlaceholderData` → keep-old-data UX. No manual boolean loaders.
- REST endpoints return discriminated unions `{ type: 'success' | 'error' }` (see `admin-ui-cos/src/services/get-cos-quota.ts`).
- No `useEffect` fetching. No `soapFetch` imports in `views/` — views consume hooks only.

### 2.3 Components

- Arrow-function named exports: `export const MyComponent = ({ title }: MyComponentProps) => { ... };`
- Props: `type` (never `interface`), named `<Component>Props`, defined above the component. `children?: React.ReactNode`.
- **Zero `useMemo`/`useCallback`/`FC`/`forwardRef`** — React Compiler handles memoization; linters flag manual calls.
- No IIFEs. Module-level helper `function` declarations for pure logic (testable without rendering).
- i18n: `const [t] = useTranslation()` with inline defaults: `t('label.unlimited_quota', 'Unlimited quota')`.
- Errors: snackbar via `useSnackbar()` + `generateSnackbarFromError` mapper (`admin-ui-cos/src/views/error/generate-snackbar-error.tsx` pattern).

### 2.4 TanStack Form + post-save pattern (mandatory, exact)

```typescript
// on successful save — BOTH steps, per AGENTS.md
// 1. inside mutation onSuccess (hook) — invalidate:
queryClient.invalidateQueries({ queryKey: myQueryKeys.config(id) });
// 2. in the component submit handler:
modifyMutation.mutate(body, {
  onSuccess: () => { form.reset(value, { keepDefaultValues: true }); },
});
```

Reference implementations: `apps/admin-ui-storage/src/views/hsm/hsm-setting-panel.tsx`, `apps/admin-ui-backup/src/views/backup/server-advanced/server-advanced.tsx`, `apps/admin-ui-cos/src/views/cos/general-information/general-information-form.tsx:308-312`. Query hooks that feed forms must set `placeholderData: keepPreviousData`. Validation: zod schemas co-located per feature (`views/<feature>/schema.ts`).

### 2.5 Testing

- Unit: `.test.ts`/`.test.tsx` (jsdom) for services/hooks/utils — `renderHook` + `waitFor`, hand-rolled `createWrapper()` with fresh `QueryClient({ defaultOptions: { queries: { retry: false } } })`, `vi.mock` the service fn.
- Browser: `.browser.test.tsx` (Playwright chromium) for views/flows — `setupBrowserTest(<Component />, { initialRouterEntry, queryClient, grantRights })` from `admin-ui-test-utils`; MSW worker via `createBrowserSoapAPIInterceptor('SearchDirectory', mockResponse)` + `resetMockWorker()` in `afterEach`; seed cache with `getQueryClient().setQueryData(...)`.
- Locators priority: `getByRole` → `getByLabelText` → `getByText`/`getByPlaceholder` → icon fallback `page.getByTestId('icon: CloseOutline')`. **Never `getByTestId` on arbitrary elements; `page.locator` does not exist** (vitest browser `page` ≠ Playwright Page).
- Always set `testTimeout: 10_000` (20_000 CI). Never remove `.test.only`/`it.only`.
- Read `AGENTS.md` §Testing; note `docs/browser-test-conventions.md` referenced there does **not** currently exist — treat `apps/admin-ui-cos` tests as the living spec.

### 2.6 SPDX header

Every new/modified source file (not icons/config/mocks):

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
```

---

## 3. Phases

Each phase = one or more PRs, ships green (`pnpm lint && pnpm type-check && pnpm test`), independently reviewable. Generate the detailed writing-plans-style sub-plan (with real code) at the start of each phase.

### Phase 0 — Foundations & enforcement (small, do first)

**Objective:** make the rules enforceable and the toolchain identical to COS.

- [ ] 0.1 Remove dead `zustand` dep: `pnpm remove zustand --filter @zextras/admin-ui-domains`; confirm `src/store/` only holds types (fold types into `src/types/` if trivial).
- [ ] 0.2 Add `@tanstack/react-form` + `zod` (match sibling versions): `pnpm add @tanstack/react-form zod --filter @zextras/admin-ui-domains`.
- [ ] 0.3 Extend root `eslint.config.js` strict block to cover ALL of `apps/admin-ui-domains/**`. **Important:** this will initially error on the 77 files with manual memoization — either (a) land Phase 0+2 together, or (b) add the strict entry with per-file `eslint-disable` overrides listed in a tracked temp file, then delete overrides file-by-file in Phase 2. Decide in the Phase 0 sub-plan; option (a) is cleaner if Phase 2 lands within days.
- [~] 0.4 Extend `src/services/domain-query-keys.ts` into the full hierarchical factory — **partially done (Increments 1, 3, 4)**: 13 key families exist (`quota`, `accountQuota`, `cosQuota`, `twoFactorPolicies`, `addressBookService`, `antiDosConfig`, `samlConfig`, `accountSignatures`, `accountMembership`, `userSessions`, plus `all`/`list`); remaining namespaces to seed as later phases need them: mailing lists, delegates, resources, quarantine, virtual hosts/certs, config.
- [ ] 0.5 Create `src/views/error/generate-snackbar-error.tsx` (port from `admin-ui-cos`) if not already equivalent; verify current `views/error/` content first.
- [ ] 0.6 Baseline: record current coverage (`CI=TRUE vitest run --coverage` from app dir) in the phase notes for the coverage-delta report.
- [ ] 0.7 Commit(s): `refactor(domains): foundations for CO-4140 modernization`.

**Verify:** `pnpm lint`, `pnpm type-check`, `pnpm test` all green (with chosen 0.3 strategy).

### Phase 1 — Data layer: typed services + React Query hooks

**Objective:** every server call typed, cachable, retryable, observable; no view-level fetching. This phase feeds Phases 3–5; do it first and well.

Scope: `src/services/` (104 files) + new `use-*` hooks + `types/`.

- [~] 1.1 Inventory services by domain area (domains, accounts, mailing lists, delegates, resources, quarantine, virtual hosts/certs, config). Order work by the Phase 3 decomposition order so hooks exist before views need them. **Progress: domain-settings area (2FA/SAML/anti-DOS/address-book) and account-detail area (quota ×2, signatures, membership, sessions) done with mutations — see §0.**
- [~] 1.2 For each area (TDD — hook test first, then hook): **done for the two areas above; repeat for the remaining areas.**
  - Type request/response bodies in the service file or `types/` (kill `Promise<any>`; use `admin-ui-cos/types/` attribute model `{ n, _content }` as the base).
  - Write the `use<Noun>` hook with the 5-option contract (§2.2).
  - Write the mutation hooks with snackbar + `flushCache`/invalidation (§2.2).
  - Unit test each hook: `renderHook` + `waitFor`, mocked service, asserts success, error-snackbar path, `enabled:false` behavior. (Pattern: `admin-ui-cos/src/services/tests/use-cos-quota.test.tsx`.)
- [ ] 1.3 Check `packages/ui-shared/src/react-query/` before each new hook; promote hooks that are generically useful (`use-account-list`, `use-mailing-list…`) into ui-shared with its own tests, mirroring existing shared hooks.
- [ ] 1.4 Move direct SOAP calls out of views into services (`domain-virtual-hosts.tsx`, `load-verify-certificate.tsx`, `search-domain-service.ts`, any `soapFetch`/`postSoapFetchRequest` import under `views/`).
- [ ] 1.5 Add debounced search where lists have search inputs (`useDebouncedValue` from ui-shared), matching COS behavior.
- [ ] 1.6 Commit per area: `refactor(domains): <area> services typed + react-query hooks`.

**Verify:** unit tests for every new hook; `rg "Promise<any>" apps/admin-ui-domains/src/services` trending to 0 (any remainder listed with justification); `rg "soapFetch|postSoapFetchRequest" apps/admin-ui-domains/src/views` → 0.

### Phase 2 — Syntax sweep: memoization, FC, exports, typing style

**Objective:** mechanical, low-risk, repo-wide style migration to compiler-era code. Best executed as scripted-assisted batches + manual review (this is where the bulk of the "~80 files" claim lands).

- [ ] 2.1 Per-directory batches (small PRs): remove `useMemo`/`useCallback` (520 occurrences / 77 files). For each: hoist pure computations to module scope or derive inline; convert memoized callbacks to plain functions/inline handlers; the compiler memoizes. Order: leaf components first (edit-account/parts, components/) up to the monster files (which Phase 3 rewrites anyway — if a monster file is untouched by Phase 3 yet, skip it there to avoid double work).
- [ ] 2.2 Replace `FC<Props>` (60×) with arrow-function consts + explicit `type XProps`; remove default exports (66×) except `src/app.tsx`; update all import sites (`import X from` → `import { X } from`).
- [ ] 2.3 Convert props `interface` → `type`; `SomeType[]` → `Array<SomeType>`; remove `Object`/empty-interface usage.
- [ ] 2.4 Remove dead code found along the way (unused exports, commented blocks); rely on `unused-imports/no-unused-imports` autofix.
- [ ] 2.5 Delete the Phase 0.3 `eslint-disable` override entries (or land 0.3 now if option (a)); the strict react-compiler + hooks rules must pass clean app-wide.
- [ ] 2.6 Commits: `refactor(domains): drop manual memoization in <dir>` / `style(domains): named exports + type props in <dir>`.

**Verify:** `rg -c "useMemo|useCallback" apps/admin-ui-domains/src` → 0 matches (non-test); `rg "FC<" apps/admin-ui-domains/src` → 0; `rg "export default" apps/admin-ui-domains/src` → only `app.tsx`; `pnpm lint` clean under strict block; existing tests still green.

### Phase 3 — Decompose the 16 monster files (characterization-first)

**Objective:** no source file >800 lines; each component <~400; logic in named module functions / feature hooks with tests.

**Method per file (strict order):**
1. Read the file completely; map sections (usually tab/section per render branch).
2. Write **characterization browser tests** against current behavior BEFORE splitting (MSW mocks for every SOAP call it makes; snapshot-level assertions on interactions: list loads, search filters, save shows snackbar, navigation works). These tests are the safety net for the split and seed Phase 5 coverage.
3. Split: extract one section/tab at a time into `views/<feature>/<section>/<section>.tsx` + feature-local `hooks/` (RQ hooks stay in `src/services/`), module-level pure helpers → `utils.ts` with unit tests. After each extraction run the characterization tests, then commit.
4. Migrate the file's data access to Phase 1 hooks and its forms to TanStack Form if not already (Phase 4 overlaps here — for files with heavy forms, do 3+4 together for that file).

**Order (riskiest/least-tested first, aligned with ticket):**

- [ ] 3.1 `views/quarantine/quarantine-list.tsx` (1600) + `attachments-block.tsx` (588) + split `views/utility/utils.ts` (1643) by consumer domain. **0 tests today — characterization first.**
- [ ] 3.2 `edit-account` ecosystem: `edit-account.tsx` (1177), `edit-account-security-section.tsx` (1586), `edit-account-delegates-section.tsx` (1299), `edit-account-general-section.tsx` (1194), `edit-account-user-pref-section.tsx` (786), `edit-account-administration-section.tsx` (497), `signature-detail.tsx`; kill the `AccountDetail` prop-drill context where hooks replace it.
- [ ] 3.3 `domain-gal-settings.tsx` (1468) and `domain-general-settings.tsx` (1383) — already partly RQ; finish migration while splitting.
- [ ] 3.4 `mailing-list`: `edit-mailing-detail-view.tsx` (1463) + all tabs (`members-tab` 706, `send-as-tab` 855, `send-to-tab`, `owners-tab`, `general`), `domain-mailing-list.tsx` (806), `mailing-list-settings-sections.tsx` (686). **0 tests today.**
- [ ] 3.5 `manage-accounts.tsx` (1392, ~30 useState), `manage-delegates.tsx` (1195), `global-delegates.tsx` (872), `resource-edit-detail-view.tsx` (1191), `domain-authentication.tsx` (952).
- [ ] 3.6 Remaining near-misses when touched + rename `manange/` → `manage/` (pure `git mv` + import rewrite commit, no other changes in that commit).
- [ ] 3.7 `create-new-domain.tsx` (673) and `global-detail-panel.tsx` (465) if still over target after their Phase 4 form migration.

**Verify per file:** characterization tests green before AND after; `wc -l` of every touched file and its new children <800; `pnpm lint && pnpm type-check` green.

### Phase 4 — Forms → TanStack Form + zod

**Objective:** all forms validate as you type, track dirty state accurately, and use the canonical post-save pattern.

- [ ] 4.1 Enumerate all forms (domain general/GAL/theme/disclaimer/authentication/SAML/virtual-hosts, create domain, create/edit account sections, mailing list tabs, delegates, resources, quarantine settings).
- [ ] 4.2 Per form: co-located `schema.ts` (zod) → `useForm` migration → submit via Phase 1 mutation hook → **both** post-save steps (§2.4) → dirty-state via `useSelector(form.store, (state) => !state.isDefaultValue)` → unsaved-changes guard (nav-guard pattern, see `admin-ui-cos/src/views/ui-extras/`).
- [ ] 4.3 Verify each migrated form with a browser test covering: validation error on bad input, save success (snackbar + dirty cleared), save failure (error snackbar + dirty retained).
- [ ] 4.4 Commits: `refactor(domains): migrate <form> to tanstack form`.

**Verify:** `rg "@zextras/ui-components.*Form" apps/admin-ui-domains/src` reduced to zero legacy form usage (or listed exceptions); post-save pattern present (grep for `form.reset(` near `keepDefaultValues`).

### Phase 5 — Coverage to ~80%

**Objective:** ≥80% coverage overall, weighted toward behavior not lines.

- [ ] 5.1 Run coverage, map the gap by directory against the §1.5 zero-coverage list.
- [ ] 5.2 Priorities: services unit tests (bulk, cheap — ~93 untested), `use-selected-domain.ts` + `wsc-settings.tsx` + `composer/` (TinyMCE mocked per root vitest base config), key user flows as browser tests: domain list → domain detail (each tab), create/edit/delete account, mailing list edit (all tabs), delegates add/remove, quarantine release/delete, virtual hosts + certificate upload, create domain wizard.
- [ ] 5.3 Each browser test: MSW SOAP interceptors, rights seeded via `grantRights`, no real network, `resetMockWorker()` afterEach, locator rules §2.5.
- [ ] 5.4 Commits: `test(domains): cover <area>`.

**Verify:** `CI=TRUE vitest run --coverage` from app dir → thresholds ≥80% (add `coverage.thresholds` to app vitest config only at the end, so CI enforces the win).

### Phase 6 — Accessibility pass

**Objective:** interactive elements labeled; keyboard navigable; static guarantees enforced.

- [ ] 6.1 Sweep all icon-only buttons for `aria-label` (extends the 9 existing); add `aria-labelledby`/`role` where semantic structure requires (tabs, dialogs, lists); ensure focus management in modals/wizards.
- [ ] 6.2 Keyboard flows verified in browser tests where business-critical (open edit panel → tab through → save).
- [ ] 6.3 jsx-a11y strict block (from Phase 0.3) must be clean — it is the permanent guard.
- [ ] 6.4 Commit: `feat(domains): accessibility labels and keyboard support`.

**Verify:** `pnpm lint` (jsx-a11y recommended active app-wide); manual keyboard pass notes per view recorded in the PR.

### Phase 7 — Final verification & release

- [ ] 7.1 Full monorepo: `pnpm install && pnpm build && pnpm lint && pnpm type-check && pnpm test:ci`.
- [ ] 7.2 Coverage report ≥80% attached to CO-4140; delta vs Phase 0.6 baseline documented.
- [ ] 7.3 Final greps all zero (non-test): `useMemo|useCallback`, `FC<`, `export default` (except `app.tsx`), `soapFetch` under `views/`, files >800 lines (`find apps/admin-ui-domains/src -name "*.ts*" | xargs wc -l | sort -rn`).
- [ ] 7.4 Manual smoke in dev bootstrap: domain CRUD, account CRUD, mailing list edit, delegates, quarantine, virtual hosts, create-domain wizard.
- [ ] 7.5 Close-out comment on CO-4140 summarizing per-phase outcomes; link PRs.

---

## 4. Working Agreements

- **Branching:** one branch per phase (`co-4140/phase-<n>-<slug>`), small commits, PRs reviewable in <1h each. Phase 3 may be several PRs (one per monster file / ecosystem).
- **Just-in-time detail:** before each phase, write a detailed sub-plan (writing-plans format, real code, bite-sized TDD steps) from this roadmap. Do not pre-write code for files nobody has read yet. Phase 1 sub-plans exist as `2026-08-18-domains-react-query-increment-{1..4}.md` in this directory (see §0 for what they covered); Increment 5+ continues the series or switches to `2026-08-18-co-4140-phase-<n>.md` naming.
- **TDD everywhere** except pure-sweep Phase 2 (mechanical, guarded by existing tests + strict lint).
- Never remove `.test.only`/`it.only`; never commit secrets; never commit without green lint+type-check+affected tests.
- Follow AGENTS.md (authoritative) for all conventions; `apps/admin-ui-cos` is the living reference.
- No UX/behavior changes without a note: this is a refactor — screens must behave identically (bugs fixed only if CO-4140 scope says so, and then explicitly listed in the PR).

## 5. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Regressions while splitting 16 monster files (several with 0 tests) | High | High | Characterization browser tests BEFORE each split; one section per commit; PRs scoped per file |
| Typing services (`any` → real types) reveals contract drift / latent bugs | Medium | Medium | Type from actual SOAP responses (MSW captures); discriminated unions for REST; document every deliberate behavior fix in PR |
| Phase 0.3 strict ESLint blocks CI before Phase 2 finishes | High | Low | Choose strategy in 0.3 sub-plan (land-with-Phase-2 or temporary tracked overrides) |
| `manange/` rename breaks IDE/other branches | Low | Low | Pure `git mv` commit, no other diffs; coordinate merge order |
| TinyMCE composer testability | Medium | Medium | Reuse root vitest tinymce mocks; test `composer/` utils as units, wrapper as thin browser test |
| Phase 3 edits collide with Phase 4 forms in same file | Medium | Medium | Do form migration together with that file's split (3.2–3.4 notes), not as a separate pass |
| Coverage target gamed by trivial service tests | Medium | Medium | Phase 5 weights browser flow tests; review checks test names, not just percentage |
| `flushCache` misuse causing stale admin data after mutations | Low | High | Copy COS mutation pattern exactly; browser test asserts refetch-after-save |

## 6. Definition of Done

1. `pnpm lint`, `pnpm type-check`, `pnpm test:ci` green at monorepo root.
2. Coverage ≥80% for `admin-ui-domains`, thresholds enforced in CI.
3. Zero (non-test): `useMemo`, `useCallback`, `FC<`, default exports (except `src/app.tsx`), `soapFetch`/`postSoapFetchRequest` imports in `views/`, `Promise<any>` in services, files >800 lines.
4. ESLint strict block (react-compiler + jsx-a11y + hooks rules) covers `apps/admin-ui-domains/**` with no overrides.
5. All forms on TanStack Form + zod with the canonical post-save pattern; all server state through React Query hooks.
6. A11y: every interactive element labeled; keyboard flows verified; jsx-a11y clean.
7. CO-4140 closed with per-phase summary + coverage delta report.
