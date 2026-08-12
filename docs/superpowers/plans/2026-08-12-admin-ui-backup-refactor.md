# [AdminRefactor][Backup] Modernize admin-ui-backup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `apps/admin-ui-backup` to match the architecture, conventions, and quality bar established in `admin-ui-cos` (CO-3770): React Compiler compliance, TanStack Form + zod, React Query service layer, decomposed components, expanded test coverage, full ESLint strict enforcement.

**Architecture:** Extract all inline SOAP calls from the two god components into typed service files + React Query hooks. Migrate form state from 56 raw `useState` + 25 per-field dirty-tracking `useEffect`s to TanStack Form with zod schemas. Split the two god components (`backup-configuration.tsx` 1611 LOC, `server-advanced.tsx` 981 LOC) into focused section sub-components (<400 LOC each). All code follows the COS gold-standard patterns documented below.

**Tech Stack:** React 19, React Compiler, TanStack Form ^1.32.0 + zod ^4.3.6, TanStack React Query ^5.90.5, Vitest (jsdom + Playwright browser), MSW, `@zextras/ui-components`, `@zextras/ui-shared` (`soapFetch`, `useCurrentUserRights`, `useSnackbar`, `flushCache`).

**Reference issue:** [CO-4110](https://zextras.atlassian.net/browse/CO-4110) · **Gold standard:** [CO-3770](https://zextras.atlassian.net/browse/CO-3770) (`apps/admin-ui-cos`)

---

## Key Design Decisions (confirmed with user)

| Decision | Choice | Rationale |
|---|---|---|
| Form state | **TanStack Form + zod** | Matches COS exactly; eliminates all 25 dirty-tracking `useEffect`s and 56 `useState`s |
| `GlobalConfig` typing | **Fully typed shape** | Replaces `Record<string, any>` with proper interface; aligns with COS typed domain types |
| Hook/component naming | **kebab-case files, camelCase exports** | Matches COS convention (`use-modify-cos.ts` → `useModifyCos`) |
| Rights checking | **Pure function in `utils/`** | Matches COS `utils/check-rights.ts` pattern; de-duplicates 3 copies of `allowSetBackup` |
| Dirty state | **`form.store.isDefaultValue`** | COS pattern via `useSelector(form.store, ...)`; no manual `useEffect` tracking |
| Unsaved-changes guard | **`<FormPageLayout unsavedChanges={isDirty}>`** | COS pattern; `FormPageLayout` renders `<RouteLeavingGuard>` internally |

---

## COS Gold-Standard Patterns (reference for every task)

These patterns are confirmed in `apps/admin-ui-cos` and must be replicated throughout:

**Service layer** (`src/services/`):
- SOAP: `soapFetch('OpName', body)` from `@zextras/ui-shared` — returns typed `Promise<T>`, errors throw
- REST: native `fetch` with discriminated union `{ type: 'success' } | { type: 'error'; error: string }` using `satisfies`
- Query keys: single `xxxQueryKeys` const, `all: [...] as const` anchor, fns returning `[...xxxQueryKeys.all, ...] as const`
- `useQuery`: `enabled`, `staleTime: 30_000`, `retry: 1`, `refetchOnWindowFocus: false`
- `useMutation`: `function useXxx()`, explicit generics `useMutation<TResult, Error, TVars>`, `onSuccess` = `flushCache` + `invalidateQueries` + success snackbar, `onError` = error snackbar w/ fallback
- Snackbar: always `{ key, severity, label, autoHideTimeout: 3000, hideButton: true, replace: true }`

**Components** (`src/views/`):
- Arrow-fn or `function` declaration + named export, `type Props = {...}`, no `FC`, no `default` (except `app.tsx`), no `useMemo`/`useCallback`
- kebab-case filenames, PascalCase exports
- Prop-drill `form` object (no context/provider)

**TanStack Form**:
- `useForm({ defaultValues, validators: { onChange: schema, onMount: schema, onSubmit: schema }, onSubmit })` — pass zod schema **directly** (no adapter needed in v1.32+)
- Fields: `useField({ form, name })` or `<form.Field name={name}>{(field) => ...}</form.Field>`
- Errors: `getFieldErrorProps(field, isSubmitted, t, ERROR_MESSAGES)` from `@zextras/ui-components`
- `isSubmitted`: `useSelector(form.store, (s) => s.submissionAttempts > 0)` from `@tanstack/react-store`
- Dirty: `useSelector(form.store, (state) => !state.isDefaultValue)`
- After save: `form.reset(value, { keepDefaultValues: true })`; On cancel: `form.reset()`
- FormApi type: `ReactFormExtendedApi<Values, any × 12>` (with eslint-disable comments)

---

## File Structure (target)

```
apps/admin-ui-backup/
├── types/
│   └── backup/index.d.ts              ← MODIFY: replace Record<string, any> with typed GlobalConfig
├── src/
│   ├── app.tsx                         ← MODIFY: extract BackupTooltipView to module level
│   ├── constants.ts                    ← MODIFY: add API URL constants (getServer path, etc.)
│   ├── utils/
│   │   ├── check-backup-rights.ts      ← CREATE: pure allowSetBackup function
│   │   └── tests/check-backup-rights.test.ts  ← CREATE
│   ├── services/
│   │   ├── backup-query-keys.ts        ← MODIFY: expand from 2 keys to full factory
│   │   ├── get-server-config.ts        ← CREATE: SOAP getServer (de-duplicated)
│   │   ├── modify-backup.ts            ← EXISTS: keep
│   │   ├── service-start-stop.ts       ← CREATE: SOAP start/stop service
│   │   ├── smart-scan.ts               ← CREATE: SOAP doSmartScan
│   │   ├── purge-backup.ts             ← CREATE: SOAP doPurge
│   │   ├── migrate-volume.ts           ← CREATE: SOAP migrateBackupVolume
│   │   ├── list-buckets.ts             ← CREATE: SOAP listBuckets (absorbs bucket-service.ts)
│   │   ├── dump-global-config.ts       ← EXISTS: keep
│   │   ├── check-ldap.ts               ← EXISTS: keep
│   │   ├── use-server-config.ts        ← CREATE: useQuery hook
│   │   ├── use-modify-backup-config.ts ← CREATE: useMutation (replaces manual promise-chain)
│   │   ├── use-service-start-stop.ts   ← CREATE: useMutation
│   │   ├── use-smart-scan.ts           ← CREATE: useMutation
│   │   ├── use-purge-backup.ts         ← CREATE: useMutation
│   │   ├── use-migrate-volume.ts       ← CREATE: useMutation
│   │   ├── use-global-config.ts        ← EXISTS: rename from use-global-config.ts (keep kebab)
│   │   └── tests/                      ← CREATE: unit tests per service/hook
│   ├── hooks/
│   │   └── use-backup-config.ts        ← RENAME from useBackupConfig.ts; REFACTOR to use useMutation
│   ├── views/
│   │   ├── app-view.tsx                ← MODIFY: named export, remove FC
│   │   ├── backup-page-header.tsx      ← MODIFY: named export, remove FC
│   │   ├── backup/
│   │   │   ├── backup-list-panel.tsx   ← MODIFY: remove FC/useMemo/useCallback
│   │   │   ├── backup-detail-panel.tsx ← MODIFY: remove FC
│   │   │   ├── configuration/
│   │   │   │   ├── backup-configuration.tsx  ← REWRITE: TanStack Form orchestrator (<400 LOC)
│   │   │   │   ├── schema.ts                 ← CREATE: zod schema
│   │   │   │   ├── types.ts                  ← CREATE: form values + form api types
│   │   │   │   ├── sections/
│   │   │   │   │   ├── service-status.tsx        ← CREATE
│   │   │   │   │   ├── general-settings.tsx      ← CREATE
│   │   │   │   │   ├── volume-management.tsx     ← CREATE
│   │   │   │   │   ├── smart-scan-config.tsx     ← CREATE
│   │   │   │   │   └── data-retention.tsx        ← CREATE
│   │   │   │   └── tests/backup-configuration.browser.test.tsx  ← UPDATE
│   │   │   ├── server-advanced/
│   │   │   │   ├── server-advanced.tsx  ← REWRITE: TanStack Form orchestrator (<400 LOC)
│   │   │   │   ├── schema.ts           ← CREATE
│   │   │   │   ├── types.ts            ← CREATE
│   │   │   │   ├── sections/
│   │   │   │   │   ├── backup-options.tsx       ← CREATE
│   │   │   │   │   ├── latency-settings.tsx     ← CREATE
│   │   │   │   │   ├── waiting-time-settings.tsx← CREATE
│   │   │   │   │   ├── metadata-settings.tsx    ← CREATE
│   │   │   │   │   └── other-controls.tsx       ← CREATE
│   │   │   │   └── tests/server-advanced.browser.test.tsx  ← UPDATE
│   │   │   ├── default-setting/
│   │   │   │   ├── backup-advanced.tsx        ← MODIFY: remove FC/useMemo/useCallback
│   │   │   │   ├── backup-server-config.tsx   ← MODIFY: remove data-testid, remove FC/useMemo/useCallback
│   │   │   │   └── backup-servers-list.tsx    ← MODIFY: remove FC/useMemo/useCallback
│   │   │   ├── components/backup/
│   │   │   │   └── backup-config-header.tsx   ← RENAME from BackupConfigHeader.tsx; remove FC
│   │   │   └── actions/import-external-backup.tsx ← MODIFY: remove FC
│   │   └── tests/
│   │       └── app-view.browser.test.tsx      ← UPDATE selectors as needed
│   └── icons/outline/backup-outline.tsx       ← RENAME from BackupOutline.tsx
```

---

## Task Summary (11 tasks across 5 phases)

| # | Task | Phase | Key files | Risk |
|---|---|---|---|---|
| 1 | Foundation: add dep, normalize naming & formatting | Foundation | all files (rename/format) | Low |
| 2 | React Compiler compliance codemod | Foundation | all components | Medium |
| 3 | Type GlobalConfig properly | Types | `types/backup/index.d.ts` + consumers | Medium |
| 4 | Expand query keys + extract SOAP services | Services | `src/services/*` | Medium |
| 5 | Create React Query hooks (useQuery + useMutation) | Services | `src/services/use-*.ts` | Medium |
| 6 | Extract `allowSetBackup` to shared pure function | Services | `src/utils/check-backup-rights.ts` | Low |
| 7 | Refactor `useBackupConfig.ts` → `useMutation` | Services | `src/hooks/use-backup-config.ts` | Medium |
| 8 | Rewrite `backup-configuration.tsx` (TanStack Form + split) | God components | `configuration/*` | **High** |
| 9 | Rewrite `server-advanced.tsx` (TanStack Form + split) | God components | `server-advanced/*` | **High** |
| 10 | Accessibility & test coverage to ≥80% | Polish | `backup-server-config.tsx`, new tests | Medium |
| 11 | Enable full ESLint strict enforcement | Lint | `eslint.config.js` | Low |

**Dependency chain:** 1→2→3, 4→5→7, 6 (after 2), 8 (after 5,6,7), 9 (after 5,6,7), 10 (after 8,9), 11 (after all)

---

## Task 1: Foundation — add dependency, normalize naming & formatting

**Goal:** Add `@tanstack/react-form`, rename files to kebab-case to match COS, normalize indentation (tabs→spaces) via Prettier.

**Files:**
- Modify: `apps/admin-ui-backup/package.json` (add dep)
- Rename: `src/hooks/useBackupConfig.ts` → `src/hooks/use-backup-config.ts`
- Rename: `src/views/backup/components/backup/BackupConfigHeader.tsx` → `backup-config-header.tsx`
- Rename: `src/icons/outline/BackupOutline.tsx` → `backup-outline.tsx`
- Modify: all files with tab indentation (normalize via `pnpm prettier --write`)

- [ ] **Step 1: Add `@tanstack/react-form` dependency**

```bash
pnpm add @tanstack/react-form@^1.32.0 --filter @zextras/admin-ui-backup
```

- [ ] **Step 2: Rename hook file to kebab-case**

```bash
git mv apps/admin-ui-backup/src/hooks/useBackupConfig.ts apps/admin-ui-backup/src/hooks/use-backup-config.ts
git mv apps/admin-ui-backup/src/hooks/tests/useBackupConfig.test.ts apps/admin-ui-backup/src/hooks/tests/use-backup-config.test.ts
```

Update all imports referencing `useBackupConfig` → `use-backup-config` across the module.

- [ ] **Step 3: Rename PascalCase component files to kebab-case**

```bash
git mv apps/admin-ui-backup/src/views/backup/components/backup/BackupConfigHeader.tsx apps/admin-ui-backup/src/views/backup/components/backup/backup-config-header.tsx
git mv apps/admin-ui-backup/src/icons/outline/BackupOutline.tsx apps/admin-ui-backup/src/icons/outline/backup-outline.tsx
```

Update all imports.

- [ ] **Step 4: Normalize indentation via Prettier**

```bash
pnpm prettier --write "apps/admin-ui-backup/src/**/*.{ts,tsx}" --tab-width 2
```

This fixes the tab-indentation issue in `use-backup-config.ts` and any other files.

- [ ] **Step 5: Run type-check + tests to verify nothing broke**

```bash
pnpm type-check && pnpm vitest run apps/admin-ui-backup
```
Expected: PASS (all existing tests pass; only file paths/imports changed)

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "refactor(backup): normalize file naming to kebab-case, add @tanstack/react-form dep"
```

---

## Task 2: React Compiler compliance codemod

**Goal:** Remove all `FC` (14), `useMemo` (16), `useCallback` (26), convert 11 default exports to named, convert 14 arrow-fn components to `function`/arrow+named-export declarations. Fix `BackupTooltipView`-in-`useCallback` anti-pattern.

**NOTE:** This is a large mechanical change across ~20 files. Work file-by-file, running tests after each batch. The React Compiler will handle memoization — inline the `useMemo`/`useCallback` bodies as plain values/functions.

**Files (all components in `src/`):**
- `app.tsx` (lines 15, 29–51), `app-view.tsx`, `backup-page-header.tsx`
- `backup-list-panel.tsx`, `backup-detail-panel.tsx`
- `backup-configuration.tsx`, `server-advanced.tsx`
- `backup-advanced.tsx`, `backup-server-config.tsx`, `backup-servers-list.tsx`
- `import-external-backup.tsx`, `backup-config-header.tsx`
- `backup-outline.tsx`, `hooks/use-backup-config.ts`

**Transformation rules:**
1. `const X: FC<Props> = (props) => {...}` → `type XProps = Props; export const X = (props: XProps) => {...}` (or `export function X(props: XProps) {...}`)
2. `export default X` → `export { X }` (remove default, add named at declaration)
3. `useMemo(() => expr, [deps])` → just `expr` (inline the computation)
4. `useCallback((args) => body, [deps])` → `function handler(args) { body }` (or inline arrow if passed as prop to non-memoized child)
5. In `app.tsx`: extract `BackupTooltipView` from inside `useCallback` to a module-level component that calls `useTranslation()` itself

- [ ] **Step 1: Fix `app.tsx` — extract BackupTooltipView, remove FC, named export**

The `BackupTooltipView` (currently L29–51) is defined inside a `useCallback`. Extract it to a module-level component:

```tsx
const BackupTooltipView = () => {
  const [t] = useTranslation();
  return (
    <PrimaryBarTooltip>
      <p>
        <Trans i18nKey="label.backup_lbl" defaults="<bold>Backup</bold>" components={{ bold: <strong /> }} t={t} />
      </p>
      <p>
        <Trans i18nKey="label.backup_primarybar_tooltip" defaults="Manage your <bold>backup services</bold>..." components={{ bold: <strong /> }} t={t} />
      </p>
    </PrimaryBarTooltip>
  );
};
```

Then pass `tooltip: BackupTooltipView` directly (no `useCallback` wrapper). Remove `FC` from `App`, convert `export default App` → `export { App }`.

**Note:** `app.tsx` is the entry point — confirm whether the bootstrap expects a default export. If so, keep `export default App` as the single documented exception (COS keeps `export default App` in `app.tsx`).

- [ ] **Step 2: Convert all remaining components** — for each file listed above:
  - Replace `FC` with explicit `type XProps = {...}`
  - Replace `export default X` with named export
  - Inline all `useMemo` calls (just compute the value directly)
  - Replace `useCallback` with plain function declarations or inline arrows

**Special handling for `backup-configuration.tsx` and `server-advanced.tsx`:** These files will be fully rewritten in Tasks 8–9, so for now just do the minimum to satisfy lint: remove `FC`, switch to named export, inline `useMemo`/`useCallback`. Don't restructure logic — that comes later.

- [ ] **Step 3: Update `hooks/use-backup-config.ts`** — remove 1 `useMemo` (L49 `allowSetBackup`) and 6 `useCallback` calls. Inline computations and use plain functions.

- [ ] **Step 4: Update all test imports** — change `import X from '...'` (default) to `import { X } from '...'` (named) for all 11 components.

- [ ] **Step 5: Run type-check + lint + tests**

```bash
pnpm type-check && pnpm lint --filter @zextras/admin-ui-backup && pnpm vitest run apps/admin-ui-backup
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "refactor(backup): React Compiler compliance — remove FC/useMemo/useCallback, convert to named exports"
```

---

## Task 3: Type GlobalConfig properly

**Goal:** Replace `GlobalConfig = Record<string, any>` in `types/backup/index.d.ts:12-13` with a proper typed interface matching the backup SOAP response shape. Update all consumers.

**Files:**
- Modify: `apps/admin-ui-backup/types/backup/index.d.ts` (L12–13)
- Modify: `src/hooks/use-backup-config.ts`, `src/services/use-global-config.ts`, `src/views/backup/default-setting/backup-advanced.tsx` (consumers)

- [ ] **Step 1: Read the current `GetServerResponse` / backup config types** to understand the actual SOAP response shape. Inspect `types/backup/index.d.ts` and `types/api/index.d.ts` for existing type definitions, and cross-reference with how fields are accessed in `backup-configuration.tsx` (L191–345 `getServer` response handling) and `server-advanced.tsx` (L63–239).

- [ ] **Step 2: Define a proper `GlobalConfig` interface** replacing the `Record<string, any>`. Include all fields accessed in code (schedules, thresholds, switches, retention, etc.). Example shape (fill in based on actual field access found in Step 1):

```typescript
export type GlobalConfig = {
  backupEnabled?: boolean;
  // ...all fields accessed in backup-configuration.tsx, server-advanced.tsx, backup-advanced.tsx
};
```

Remove the `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comment.

- [ ] **Step 3: Fix any type errors** in consumers that relied on `Record<string, any>`'s implicit indexing. Add proper optional (`?`) markers for fields that may be absent from the SOAP response.

- [ ] **Step 4: Run type-check + tests**

```bash
pnpm type-check && pnpm vitest run apps/admin-ui-backup
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "refactor(backup): replace Record<string, any> GlobalConfig with typed interface"
```

---

## Task 4: Expand query keys + extract SOAP services

**Goal:** Move all inline SOAP calls out of components into typed service files. Expand the `backupQueryKeys` factory. This is the data-access layer that Tasks 5 and 8–9 will consume.

**Files:**
- Modify: `src/services/backup-query-keys.ts` (expand factory)
- Modify: `src/constants.ts` (add URL constants)
- Create: `src/services/get-server-config.ts`, `service-start-stop.ts`, `smart-scan.ts`, `purge-backup.ts`, `migrate-volume.ts`, `list-buckets.ts`
- Existing (keep): `src/services/modify-backup.ts`, `dump-global-config.ts`, `check-ldap.ts`
- Delete/absorb: `src/services/bucket-service.ts` (absorbed into `list-buckets.ts`)

- [ ] **Step 1: Expand `backup-query-keys.ts`** to cover all server-state operations:

```typescript
export const backupQueryKeys = {
  all: ['backup'] as const,
  globalConfig: () => [...backupQueryKeys.all, 'global-config'] as const,
  serverConfig: (serverId?: string) => [...backupQueryKeys.all, 'server-config', serverId ?? 'default'] as const,
  buckets: () => [...backupQueryKeys.all, 'buckets'] as const,
} as const;
```

- [ ] **Step 2: Add URL/path constants** to `src/constants.ts`. Extract the duplicated `/service/extension/zextras_admin/core/getServer/...` path (currently hardcoded at `backup-configuration.tsx:191,772` and `server-advanced.tsx:68`) into a single constant.

- [ ] **Step 3: Create `get-server-config.ts`** — extract the `getServer` SOAP call:

```typescript
import { getSoapFetchRequest } from '@zextras/ui-shared';
import { GET_SERVER_BACKUP_URL } from '../constants';
import type { GetServerResponse } from '../../../../types/backup';

export const getServerConfig = async (serverId?: string): Promise<GetServerResponse> =>
  getSoapFetchRequest<GetServerResponse>(`${GET_SERVER_BACKUP_URL}${serverId ? `&id=${serverId}` : ''}`);
```

- [ ] **Step 4: Create `service-start-stop.ts`** — extract `backup-configuration.tsx:632-668` (`postSoapFetchRequest` for doStartService/doStopService):

```typescript
import { postSoapFetchRequest } from '@zextras/ui-shared';

export type ServiceAction = 'doStartService' | 'doStopService';

export const serviceStartStop = async (action: ServiceAction): Promise<unknown> =>
  postSoapFetchRequest('/service/admin/soap/zextras', { [action]: {} }, 'zextras');
```

- [ ] **Step 5: Create `smart-scan.ts`** — extract L669–710 (`fetchExternalSoap` for `doSmartScan`):

```typescript
import { fetchExternalSoap } from '@zextras/ui-shared';

export const triggerSmartScan = async (): Promise<unknown> =>
  fetchExternalSoap('/service/extension/zextras_admin/backup/doSmartScan', {});
```

- [ ] **Step 6: Create `purge-backup.ts`** — extract L711–746 (`fetchExternalSoap` for `doPurge`):

```typescript
import { fetchExternalSoap } from '@zextras/ui-shared';

export const triggerBackupPurge = async (): Promise<unknown> =>
  fetchExternalSoap('/service/extension/zextras_admin/backup/doPurge', {});
```

- [ ] **Step 7: Create `migrate-volume.ts`** — extract L747–817 (`fetchExternalSoap` for `migrateBackupVolume`):

```typescript
import { fetchExternalSoap } from '@zextras/ui-shared';

export type MigrateVolumeParams = {
  // fill from L750 call params
};

export const migrateVolume = async (params: MigrateVolumeParams): Promise<unknown> =>
  fetchExternalSoap('/service/extension/zextras_admin/backup/migrateBackupVolume', { ...params });
```

- [ ] **Step 8: Create `list-buckets.ts`** — absorb `bucket-service.ts` (`fetchSoap` → `postSoapFetchRequest`). Extract the `getAllBuckets` logic from L818–857.

- [ ] **Step 9: Write unit tests** for each new service file. Follow the COS pattern: mock the soap function via `vi.mock('@zextras/ui-shared', ...)`, assert call args + return value. Place in `src/services/tests/`.

```typescript
// services/tests/get-server-config.test.ts
vi.mock('@zextras/ui-shared', () => ({ getSoapFetchRequest: vi.fn() }));
import { getSoapFetchRequest } from '@zextras/ui-shared';
import { getServerConfig } from '../get-server-config';

it('calls getSoapFetchRequest with the backup getServer URL', async () => {
  vi.mocked(getSoapFetchRequest).mockResolvedValue({} as never);
  await getServerConfig();
  expect(getSoapFetchRequest).toHaveBeenCalledWith(expect.stringContaining('getServer'));
});
```

- [ ] **Step 10: Run type-check + service tests**

```bash
pnpm type-check && pnpm vitest run apps/admin-ui-backup/src/services
```

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "refactor(backup): extract inline SOAP calls to typed service files, expand query-key factory"
```

---

## Task 5: Create React Query hooks (useQuery + useMutation)

**Goal:** Wrap the services from Task 4 in React Query hooks matching the COS mutation/query conventions.

**Files:**
- Create: `src/services/use-server-config.ts`, `use-modify-backup-config.ts`, `use-service-start-stop.ts`, `use-smart-scan.ts`, `use-purge-backup.ts`, `use-migrate-volume.ts`
- Create: unit tests for each in `src/services/tests/`

- [ ] **Step 1: Create `use-server-config.ts`** (useQuery — replaces the inline `getServer` effect):

```typescript
import { useQuery } from '@tanstack/react-query';
import { backupQueryKeys } from './backup-query-keys';
import { getServerConfig } from './get-server-config';

export const useServerConfig = (serverId?: string) =>
  useQuery({
    queryKey: backupQueryKeys.serverConfig(serverId),
    queryFn: () => getServerConfig(serverId),
    enabled: true,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
```

- [ ] **Step 2: Create `use-modify-backup-config.ts`** (useMutation — replaces manual promise-chain in `use-backup-config.ts`):

```typescript
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { flushCache } from '@zextras/ui-shared';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { backupQueryKeys } from './backup-query-keys';
import { modifyBackupRequest } from './modify-backup';
import type { SetCoreAttributesBody } from './modify-backup';

export function useModifyBackupConfig(serverId?: string) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SetCoreAttributesBody) => modifyBackupRequest(body),
    onSuccess: async () => {
      await flushCache('zxbackup', ...);  // confirm flushCache signature from COS usage
      queryClient.invalidateQueries({ queryKey: backupQueryKeys.serverConfig(serverId) });
      createSnackbar({
        key: 'success', severity: 'success',
        label: t('label.the_last_changes_has_been_saved_successfully', 'Changes have been saved successfully'),
        autoHideTimeout: 3000, hideButton: true, replace: true,
      });
    },
    onError: (error) => {
      createSnackbar({
        key: 'error', severity: 'error',
        label: error?.message ?? t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000, hideButton: true, replace: true,
      });
    },
  });
}
```

- [ ] **Step 3: Create remaining useMutation hooks** (`use-service-start-stop.ts`, `use-smart-scan.ts`, `use-purge-backup.ts`, `use-migrate-volume.ts`) following the same pattern — each calls its service function, shows snackbar on success/error, and invalidates `backupQueryKeys.serverConfig()` on success (since these operations change server state).

- [ ] **Step 4: Write unit tests** for each hook. Follow the COS `use-modify-cos.test.tsx` pattern: wrap in `QueryClientProvider`, mock `useSnackbar` + `react-i18next`, mock the service, assert `mutate` calls + snackbar + invalidation.

```typescript
// services/tests/use-modify-backup-config.test.tsx
// Render with QueryClientProvider, mock modifyBackupRequest to resolve,
// call result.current.mutate(body), waitFor onSuccess,
// assert createSnackbar called with severity 'success'
```

- [ ] **Step 5: Run type-check + hook tests**

```bash
pnpm type-check && pnpm vitest run apps/admin-ui-backup/src/services
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(backup): add React Query hooks for server config, mutations with snackbar feedback"
```

---

## Task 6: Extract `allowSetBackup` to shared pure function

**Goal:** De-duplicate the identical `allowSetBackup` logic (currently copied in 3 files) into a single pure function in `utils/check-backup-rights.ts`, matching COS's `utils/check-rights.ts` pattern.

**Files:**
- Create: `src/utils/check-backup-rights.ts`, `src/utils/tests/check-backup-rights.test.ts`
- Modify: `src/hooks/use-backup-config.ts` (L49–52), `src/views/backup/configuration/backup-configuration.tsx` (L109–112), `src/views/backup/server-advanced/server-advanced.tsx` (L58–61)

- [ ] **Step 1: Write the failing test**

```typescript
// utils/tests/check-backup-rights.test.ts
import { checkAllowSetBackup } from '../check-backup-rights';

it('returns true when CONFIG rights have setAttrs.all', () => {
  const rights = [{ type: 'globalConfig', all: [{ setAttrs: [{ all: true }] }] }];
  expect(checkAllowSetBackup(rights)).toBe(true);
});

it('returns false when no CONFIG rights', () => {
  expect(checkAllowSetBackup(undefined)).toBe(false);
  expect(checkAllowSetBackup([])).toBe(false);
});

it('returns false when setAttrs.all is false', () => {
  const rights = [{ type: 'globalConfig', all: [{ setAttrs: [{ all: false }] }] }];
  expect(checkAllowSetBackup(rights)).toBe(false);
});
```

- [ ] **Step 2: Run test — verify it fails** (function doesn't exist)

```bash
pnpm vitest run apps/admin-ui-backup/src/utils/tests/check-backup-rights.test.ts
```

- [ ] **Step 3: Implement the pure function**

```typescript
// utils/check-backup-rights.ts
import { find } from 'lodash-es';

const CONFIG = 'globalConfig'; // confirm exact type string from existing code

type RightEntry = {
  all?: Array<{ setAttrs?: Array<{ all?: boolean }>; getAttrs?: Array<{ all?: boolean }> }>;
  type: string;
};

export function checkAllowSetBackup(rights: Array<RightEntry> | undefined): boolean {
  const rightsConfig = find(rights, { type: CONFIG });
  return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
}
```

**Note:** Verify the exact `type` string (`CONFIG` constant) used in the existing code. It may be imported from `@zextras/ui-shared`.

- [ ] **Step 4: Run test — verify it passes**

- [ ] **Step 5: Replace all 3 duplicated copies** — in `use-backup-config.ts`, `backup-configuration.tsx`, and `server-advanced.tsx`, replace the inline `useMemo(() => { ... find(rights, ...) ... }, [rights])` with:

```typescript
import { useCurrentUserRights } from '@zextras/ui-shared';
import { checkAllowSetBackup } from '../utils/check-backup-rights';

// inside component:
const { data: rights } = useCurrentUserRights();
const allowSetBackup = checkAllowSetBackup(rights);
```

- [ ] **Step 6: Run type-check + all tests**

```bash
pnpm type-check && pnpm vitest run apps/admin-ui-backup
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "refactor(backup): de-duplicate allowSetBackup into shared pure function"
```

---

## Task 7: Refactor `useBackupConfig.ts` → `useMutation`

**Goal:** Replace the manual `.then()/.catch()` promise-chain mutation in `use-backup-config.ts` (L58–115 `onSave`) with the `useModifyBackupConfig` hook from Task 5. This hook is used by `backup-server-config.tsx` and `backup-advanced.tsx`.

**Files:**
- Modify: `src/hooks/use-backup-config.ts`
- Modify: `src/hooks/tests/use-backup-config.test.ts`

- [ ] **Step 1: Read the current `onSave` logic** (L58–115) to understand what it does: calls `modifyBackupRequest()`, then `queryClient.setQueryData` + `queryClient.invalidateQueries`. The `useModifyBackupConfig` hook already handles invalidation + snackbar.

- [ ] **Step 2: Refactor the hook** — replace the manual mutation with `useModifyBackupConfig()`. Wire `isPending` for loading state. Remove the manual `queryClient` manipulation. The hook should expose: `{ backupDetail, isDirty, allowSetBackup, onCancel, onSave, isSaving, changeSwitchOption, changeBackupDetail, changeBackupSchedulerInput, changeBackupSchedulerSwitch }` — keep the same public API so consumers don't need to change.

- [ ] **Step 3: Update tests** — mock `useModifyBackupConfig` instead of `modifyBackupRequest` directly. Verify the same behavior (save success → form clean, save error → error state).

- [ ] **Step 4: Run tests**

```bash
pnpm vitest run apps/admin-ui-backup/src/hooks
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "refactor(backup): replace manual promise-chain in useBackupConfig with useMutation"
```

---

## Task 8: Rewrite `backup-configuration.tsx` — TanStack Form + split into sections

**Goal:** Migrate the 1611-LOC god component to TanStack Form with zod, split into 5 focused section components (<400 LOC each), wire to React Query hooks from Tasks 5–7. This is the highest-risk task.

**Key design principle:** TanStack Form manages the **editable form fields** only (switches, inputs, schedules that participate in dirty-tracking/save). Non-form state (service running/stopped, bucket lists, action-in-flight UI states) is managed via React Query data + local `useState`.

**Files:**
- Create: `src/views/backup/configuration/schema.ts`, `types.ts`
- Create: `src/views/backup/configuration/sections/service-status.tsx`, `general-settings.tsx`, `volume-management.tsx`, `smart-scan-config.tsx`, `data-retention.tsx`
- Rewrite: `src/views/backup/configuration/backup-configuration.tsx` (orchestrator, <400 LOC)
- Update: `src/views/backup/configuration/tests/backup-configuration.browser.test.tsx`

- [ ] **Step 1: Create `schema.ts`** — zod schema for the backup configuration form fields. Read L66–158 of the current component to enumerate all 38 state fields, then classify each as form-field vs. non-form state:

```typescript
import { z } from 'zod';

export const BACKUP_CONFIG_VALIDATION_MESSAGES: Record<string, string> = {
  'backup.validation.schedule_invalid': 'Enter a valid schedule',
  'backup.validation.threshold_invalid': 'Enter a whole number of 0 or more',
};

function isNonNegativeInteger(value: string): boolean {
  return value === '' || /^\d+$/.test(value);
}

const optionalNonNegativeInt = z
  .string()
  .refine(isNonNegativeInteger, { message: 'backup.validation.threshold_invalid' })
  .optional();

export const backupConfigSchema = z.object({
  // Map each editable field from the current 38 useState calls
  // e.g.:
  moduleEnableAtStartup: z.boolean(),
  realtimeScanner: z.boolean(),
  smartScanAtStartup: z.boolean(),
  destinationPath: z.string(),
  spaceThreshold: optionalNonNegativeInt,
  smartScanScheduleEnabled: z.boolean(),
  smartScanSchedule: z.string(),
  dataRetentionScheduleEnabled: z.boolean(),
  dataRetentionSchedule: z.string(),
  keepDeletedItems: optionalNonNegativeInt,
  keepDeletedAccounts: optionalNonNegativeInt,
  // ... enumerate all form fields
});
```

- [ ] **Step 2: Create `types.ts`** — hand-write the form values type + form API type:

```typescript
import type { ReactFormExtendedApi } from '@tanstack/react-form';

export type BackupConfigFormValues = {
  moduleEnableAtStartup: boolean;
  realtimeScanner: boolean;
  // ... mirror schema fields
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BackupConfigFormApi = ReactFormExtendedApi<BackupConfigFormValues, any, any, any, any, any, any, any, any, any, any, any>;
```

- [ ] **Step 3: Create `sections/service-status.tsx`** — extracts L1012–1059 (status display + start/stop button). Uses `useServiceStartStop()` mutation hook.

- [ ] **Step 4: Create `sections/general-settings.tsx`** — extracts L1061–1154 (3 switches + initialize backup button). Uses `allowSetBackup` from `checkAllowSetBackup()`, license gating via rights query.

- [ ] **Step 5: Create `sections/volume-management.tsx`** — extracts L1139–1376 (local volume input, set external, manage external). Uses `useBuckets()` and `useMigrateVolume()` hooks. Form fields: `destinationPath`, `spaceThreshold`.

- [ ] **Step 6: Create `sections/smart-scan-config.tsx`** — extracts L1389–1446 (schedule switch + input + force button). Form fields: `smartScanScheduleEnabled`, `smartScanSchedule`.

- [ ] **Step 7: Create `sections/data-retention.tsx`** — extracts L1459–1603 (schedule switch + input + retention inputs + force purge). Form fields: `dataRetentionScheduleEnabled`, `dataRetentionSchedule`, `keepDeletedItems`, `keepDeletedAccounts`.

- [ ] **Step 8: Rewrite `backup-configuration.tsx` orchestrator** — uses `useForm` + `useServerConfig` + `useModifyBackupConfig`, renders `<FormPageLayout>` with the 5 section components. Target <400 LOC:

```typescript
export function BackupConfiguration() {
  const { data: serverConfig, isPending } = useServerConfig();
  const modifyMutation = useModifyBackupConfig();
  const { data: rights } = useCurrentUserRights();
  const allowSetBackup = checkAllowSetBackup(rights);

  const form = useForm({
    defaultValues: mapServerConfigToFormValues(serverConfig),
    validators: { onChange: backupConfigSchema, onSubmit: backupConfigSchema },
    onSubmit: async ({ value }) => {
      modifyMutation.mutate(mapFormValuesToSetCoreAttributes(value), {
        onSuccess: () => form.reset(value, { keepDefaultValues: true }),
      });
    },
  });

  const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);

  if (isPending) return <ds-page-shimmer />;

  return (
    <FormPageLayout
      title={t('backup.configuration.title', 'Backup Configuration')}
      onSave={() => form.handleSubmit()}
      onCancel={() => form.reset()}
      unsavedChanges={isDirty}
    >
      <ServiceStatus />
      <GeneralSettings form={form} allowSetBackup={allowSetBackup} />
      <VolumeManagement form={form} allowSetBackup={allowSetBackup} />
      <SmartScanConfig form={form} allowSetBackup={allowSetBackup} />
      <DataRetention form={form} allowSetBackup={allowSetBackup} />
    </FormPageLayout>
  );
}
```

**Note:** Create `mapServerConfigToFormValues` and `mapFormValuesToSetCoreAttributes` mapper functions (either in `types.ts` or a `utils.ts`) to convert between SOAP response shape and form values.

- [ ] **Step 9: Update browser tests** — update `backup-configuration.browser.test.tsx` to test the new section-based structure. Tests should use `getByRole`/`getByText`/`getByLabelText` selectors. Mock `useServerConfig` via MSW (SOAP interceptor for `getServer`). Verify: rendering, switch toggling, dirty state (Save button appears/disappears), save submission via SOAP interceptor, start/stop service, initialize backup, smart scan, purge.

- [ ] **Step 10: Run type-check + lint + tests**

```bash
pnpm type-check && pnpm lint --filter @zextras/admin-ui-backup && pnpm vitest run apps/admin-ui-backup
```
Expected: PASS, no file >400 LOC

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "refactor(backup): migrate backup-configuration to TanStack Form, split into 5 section components"
```

---

## Task 9: Rewrite `server-advanced.tsx` — TanStack Form + split into sections

**Goal:** Same approach as Task 8, applied to the 981-LOC `server-advanced.tsx` (18 useState, 14 dirty-tracking useEffects).

**Files:**
- Create: `src/views/backup/server-advanced/schema.ts`, `types.ts`
- Create: `src/views/backup/server-advanced/sections/backup-options.tsx`, `latency-settings.tsx`, `waiting-time-settings.tsx`, `metadata-settings.tsx`, `other-controls.tsx`
- Rewrite: `src/views/backup/server-advanced/server-advanced.tsx` (orchestrator, <400 LOC)
- Update: `src/views/backup/server-advanced/tests/server-advanced.browser.test.tsx`

- [ ] **Step 1: Create `schema.ts`** — enumerate the 18 state fields from L39–56, classify as form-field vs. non-form state. Form fields include: LDAP dump switch, include config switch, purge old switch, include index switch, high/low latency thresholds, max waiting time, max metadata size, append/archive metadata switches, max operations, compression level, threads for items/accounts.

- [ ] **Step 2: Create `types.ts`** — `ServerAdvancedFormValues` + `ServerAdvancedFormApi`.

- [ ] **Step 3: Create `sections/backup-options.tsx`** — extracts L652–716 (4 switches + check LDAP button). Uses `checkLdap` service + `checkAllowSetBackup`.

- [ ] **Step 4: Create `sections/latency-settings.tsx`** — extracts L729–777 (high/low threshold inputs).

- [ ] **Step 5: Create `sections/waiting-time-settings.tsx`** — extracts L779–809 (max waiting time input).

- [ ] **Step 6: Create `sections/metadata-settings.tsx`** — extracts L811–885 (max metadata size + 2 switches).

- [ ] **Step 7: Create `sections/other-controls.tsx`** — extracts L887–974 (max ops, compression, 2 thread inputs).

- [ ] **Step 8: Rewrite `server-advanced.tsx` orchestrator** — same pattern as Task 8 Step 8. Uses `useServerConfig(serverId)` + `useModifyBackupConfig(serverId)`.

- [ ] **Step 9: Update browser tests** — update `server-advanced.browser.test.tsx` for the new structure.

- [ ] **Step 10: Run type-check + lint + tests**

```bash
pnpm type-check && pnpm lint --filter @zextras/admin-ui-backup && pnpm vitest run apps/admin-ui-backup
```

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "refactor(backup): migrate server-advanced to TanStack Form, split into 5 section components"
```

---

## Task 10: Accessibility & test coverage to ≥80%

**Goal:** Remove `data-testid` attributes, add ARIA labels to icon-only/JSX-label controls, remove `getByTestId` usage in tests, add missing tests to push coverage from ~77% to ≥80%.

**Files:**
- Modify: `src/views/backup/default-setting/backup-server-config.tsx` (remove L175, L207 `data-testid`)
- Modify: `src/views/backup/tests/backup-list-panel.browser.test.tsx` (remove L220 `getByTestId`)
- Create: tests for `backup-page-header.tsx`, `backup-config-header.tsx`, `import-external-backup.tsx`
- Create: schema validation tests for both god components' zod schemas

- [ ] **Step 1: Remove `data-testid` attributes** from `backup-server-config.tsx` (L175 `data-testid={'smart-scan-toggle'}`, L207 `data-testid={'backup-purge-toggle'}`). Ensure switches have accessible `label` props so tests can locate them via `getByRole('switch', { name: '...' })`.

- [ ] **Step 2: Add ARIA labels** — audit all Switch/Button/Input components in the module. For any whose `label` is JSX or icon-only, add explicit `aria-label` (COS pattern from `edition-field.tsx`).

- [ ] **Step 3: Fix `getByTestId` in `backup-list-panel.browser.test.tsx`** (L220) — replace `page.getByTestId('icon: CloseOutline')` with the icon-via-attribute selector pattern: `page.locator('ds-icon[icon="CloseOutline"]')`.

- [ ] **Step 4: Write schema validation tests** — for both `backup-configuration/schema.ts` and `server-advanced/schema.ts`, test valid/invalid inputs:

```typescript
import { backupConfigSchema } from '../schema';

it('rejects negative threshold', () => {
  const result = backupConfigSchema.safeParse({ spaceThreshold: '-1', ... });
  expect(result.success).toBe(false);
});

it('accepts empty threshold (inherit)', () => {
  const result = backupConfigSchema.safeParse({ spaceThreshold: '', ... });
  expect(result.success).toBe(true);
});
```

- [ ] **Step 5: Write missing component tests** — add browser/unit tests for `backup-page-header.tsx`, `backup-config-header.tsx`, and `import-external-backup.tsx`.

- [ ] **Step 6: Run coverage report**

```bash
pnpm vitest run apps/admin-ui-backup --coverage
```
Expected: ≥80% coverage for the module

- [ ] **Step 7: Clean up orphaned screenshots directory**

```bash
rm -rf apps/admin-ui-backup/src/views/tests/__screenshots__/backup-page-header.browser.test.tsx/
```

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "refactor(backup): remove data-testid, add ARIA labels, expand test coverage to 80%"
```

---

## Task 11: Enable full ESLint strict enforcement

**Goal:** Add `apps/admin-ui-backup/**` to the full strict ESLint block in `eslint.config.js` (the block at lines 93–101 with all `react-hooks/*` rules). This enforces `react-hooks/use-memo: error`, `react-hooks/preserve-manual-memoization: error`, `react-hooks/static-components: error`, etc.

**Files:**
- Modify: `eslint.config.js` (L93–101)

- [ ] **Step 1: Add backup to the strict files array**

In `eslint.config.js`, the first strict block (L93–101):

```javascript
{
  files: [
    'apps/admin-ui-domains/src/views/domain/domain-list/**',
    'packages/ui-components/src/components/custom/breadcrumb.tsx',
    'apps/admin-ui-domains/src/views/domain/domain-list-panel.tsx',
    'apps/admin-ui-domains/src/views/domain/global-list-panel.tsx',
    'apps/admin-ui-dashboard/**',
    'apps/admin-ui-operations/**',
    'apps/admin-ui-backup/**',          // ← ADD THIS LINE
  ],
```

Since backup is already in the second block (L121–126, partial strict), and both blocks will now match, consider removing backup from the second block to avoid redundancy (rules merge anyway, but cleaner config).

- [ ] **Step 2: Run lint and fix any remaining issues**

```bash
pnpm lint --filter @zextras/admin-ui-backup
```
Expected: zero errors. If errors appear, fix them (shouldn't be any if Tasks 1–10 are complete).

- [ ] **Step 3: Run full type-check + lint + test suite**

```bash
pnpm type-check && pnpm lint && pnpm test
```
Expected: all clean, all pass

- [ ] **Step 4: Verify acceptance criteria**

```bash
# Zero useMemo/useCallback/FC
rg -t ts -t tsx 'useMemo|useCallback|\bFC\b' apps/admin-ui-backup/src/ --stats
# Should show 0 matches (excluding node_modules)

# No file >400 LOC
find apps/admin-ui-backup/src -name '*.tsx' -exec wc -l {} + | sort -rn | head -5
# All should be <400

# No default exports (except app.tsx)
rg "export default" apps/admin-ui-backup/src/ --glob '!app.tsx'
# Should show 0 matches
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore(backup): enable full ESLint strict ruleset for admin-ui-backup"
```

---

## Acceptance Criteria Checklist (from CO-4110)

| Criterion | Task(s) | Verification |
|---|---|---|
| Zero `useMemo`/`useCallback`/`FC`; React Compiler compliant | 2, 8, 9 | `rg` search returns 0 |
| No default exports for components | 2 | `rg "export default"` returns 0 (except `app.tsx`) |
| Expanded query-key factory; `useMutation` hooks replace manual mutations | 4, 5, 7 | All services extracted, hooks in place |
| No component file exceeds ~400 LOC | 8, 9 | `wc -l` check |
| Test coverage ≥80% | 10 | `vitest --coverage` report |
| All existing tests pass; lint and type-check clean | 11 | `pnpm type-check && pnpm lint && pnpm test` |
| Direct API calls moved to service files | 4, 8, 9 | No `fetchExternalSoap`/`getSoapFetchRequest`/`setCoreAttributes` in `.tsx` files |
| `allowSetBackup` de-duplicated | 6 | Single pure function in `utils/` |
| `data-testid` removed; accessible toggles | 10 | `rg "data-testid"` returns 0 |
| ARIA labels on interactive components | 10, 8, 9 | Code review + `jsx-a11y` lint |
| `GlobalConfig` fully typed (no `any`) | 3 | `rg "Record<string, any>"` returns 0 |
| File naming normalized (kebab-case) | 1 | No PascalCase `.tsx` files (except icon dir) |
| ESLint full strict block includes backup | 11 | `eslint.config.js` L93–101 |
