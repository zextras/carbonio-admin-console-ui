# admin-ui-operations Refactor — Implementation Plan (CO-3770 alignment)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Run the verification command at the end of each phase before committing.

**Goal:** Refactor `apps/admin-ui-operations` to match the architecture/conventions of the refactored `admin-ui-cos` module — React Compiler compliant, fully typed, consolidated, accessible, and lint/type/test clean.

**Architecture:** Thin typed SOAP services → React Query hooks (query-key factory, `useMutation` for writes) → arrow-function components with `type` props and named exports. Zod `safeParse` guards only the fragile double-`JSON.parse` paths; the rest trusts typed interfaces like `cos`.

**Tech Stack:** React 19 + React Compiler, TypeScript, TanStack React Query, Zod, Vitest (jsdom + Playwright browser), `@zextras/ui-components`, `soapFetch`.

**Reference anchor:** `apps/admin-ui-cos` (CO-3770). Key reference facts established by research:

- `cos` components: arrow consts, named exports, `type` props, no `FC`/`useMemo`/`useCallback`.
- `cos` services: one thin `soapFetch` wrapper each, typed `Promise<TypedResponse>`, **no Zod on SOAP responses**.
- `cos` hooks: `useMutation<Response, Error, Variables>` with `onSuccess` (invalidate + snackbar) / `onError` (snackbar).
- **ESLint strict block already includes `apps/admin-ui-operations/**`** (`eslint.config.js:100`) — that task is **already done**; this is why the current lint fails.
- Indentation target: **2 spaces** (Prettier default; the refactored cos style).

---

## File Structure (target)

| Path | Responsibility | Action |
|---|---|---|
| `src/types/operations.ts` | Shared SOAP response/request types | **Expand** (add typed response + content-payload types) |
| `src/types/operations-schemas.ts` | Zod schemas for the fragile `content` payloads | **Create** |
| `src/services/get-all-operations.ts` | SOAP wrapper | **Type** return (`Promise<OperationsSoapResponse>`) |
| `src/services/get-all-done-operation.ts` | SOAP wrapper | **Type** return |
| `src/services/stop-operation.ts` | SOAP wrapper | **Type** return |
| `src/services/operation-query-keys.ts` | Query-key factory | **Add** `stopOperation` key |
| `src/services/use-all-operations.ts` | `useQuery` | **Add** try/catch + Zod `safeParse` |
| `src/services/use-done-operations.ts` | `useQuery` | **Add** try/catch + Zod `safeParse` |
| `src/services/use-stop-operation.ts` | hand-rolled → **`useMutation`** | **Rewrite** |
| `src/constants.ts` | string constants | **Rename** `TRUE_OPERTION`→`TRUE_OPERATION`, `FALSE_OPERTION`→`FALSE_OPERATION` |
| `src/views/operations/functions/miliSecondToDate.tsx` | util | **Rename file** → `milliSecondToDate.ts`; **Rename** `MiliSecondToDate`→`MilliSecondToDate` |
| `src/views/operations/delete-operations-model.tsx` | modal | **Rename file** → `delete-operations-modal.tsx`; **Rename** `DeleteOpearationsModel`→`DeleteOperationsModal` |
| `src/views/operations/running-detail-panel.tsx` | panel | **Merge** with queued → `operation-state-detail-panel.tsx` |
| `src/views/operations/queued-detail-panel.tsx` | panel | **Delete** (merged) |
| `src/views/operations/done-detail-panel.tsx` | panel | Keep (different: search/pagination/no-stop) |
| `src/views/operations/operations-table.tsx` | table | **Refactor** (extract row builder, type props, drop `useMemo`) |
| `src/views/operations/operations-wizard-detail-panel.tsx` | detail | **Type** `selectedData`, add `aria-label` |
| `src/app.tsx` | entry | **Hoist** `OperationTooltipView`, drop `FC`/`useMemo`/`useCallback` |
| All component files | — | **Convert** arrow-const `FC` → function decls + named exports |
| All test files | — | **Fix** `getByTestId`; expand coverage |
| All files | — | **Normalize** to 2-space indent |

---

## Phase 1 — Foundation: Types & Service Layer

### Task 1.1: Define shared SOAP response + content-payload types

**Files:** Modify `src/types/operations.ts`.

- [ ] **Step 1:** Inspect current `src/types/operations.ts` and the three hooks to capture the exact parsed shapes:
  - `use-all-operations.ts:20` → `res?.response?.[serverName]?.ok` and the array at `res?.operations`/`response?.[server]`.
  - `use-done-operations.ts:17` → `res?.ok` and done-operation list.
  - `use-stop-operation.ts:44` → `result?.response?.[serverName]?.ok`.
- [ ] **Step 2:** Add typed interfaces to `src/types/operations.ts`:

```ts
// Wraps the SOAP envelope around the double-encoded content string
export type SoapContentResponse = {
  Body?: { response?: { content?: string } };
};

// Shape of JSON.parse(content) for getAllOperations / getOperationLog
export type OperationServerResult = { ok?: boolean };
export type OperationsContent = {
  response?: Record<string, OperationServerResult>;
  operations?: Array<OperationItem>;
  ok?: boolean;
};

// A single operation row (consolidate any existing partial Operation type)
export type OperationItem = {
  id?: string;
  name?: string;
  module?: string;
  state?: string;
  serverName?: string;
  type?: string;
  startTime?: number;
  humanStartTime?: string;
  parameters?: {
    requesterAddress?: string;
    additionalNotificationAddresses?: Array<string>;
    createFakeBlob?: boolean;
    isDeep?: boolean;
  };
};
```

  (Reconcile with any existing `OperationItem`/`Operation` in the file — merge, don't duplicate.)

- [ ] **Step 3:** `pnpm type-check` (expect new types to compile; no behavior change yet).

### Task 1.2: Type the three service files (remove `Promise<any>`)

**Files:** Modify `src/services/get-all-operations.ts`, `src/services/get-all-done-operation.ts`, `src/services/stop-operation.ts`.

- [ ] **Step 1:** Replace each `Promise<any>` with `Promise<SoapContentResponse>` (imported from `../../types/operations`). Example for `get-all-operations.ts`:

```ts
import { SoapContentResponse } from '../../types/operations';
export const getAllOperations = async (): Promise<SoapContentResponse> =>
  postSoapFetchRequest(`/service/admin/soap/zextras`, { /* unchanged */ }, 'zextras');
```

  Apply identically to `get-all-done-operation.ts` and `stop-operation.ts`.

- [ ] **Step 2:** `rg -n "Promise<any>" src/services` → expect **0 matches**.
- [ ] **Step 3:** `pnpm type-check`.

### Task 1.3: Add Zod schemas for fragile content payloads

**Files:** Create `src/types/operations-schemas.ts`.

- [ ] **Step 1:** Create the file with `safeParse`-friendly schemas matching the typed payloads:

```ts
import { z } from 'zod';

export const operationsContentSchema = z.object({
  response: z.record(z.string(), z.object({ ok: z.boolean().optional() })).optional(),
  operations: z.array(z.any()).optional(),
  ok: z.boolean().optional(),
}).passthrough();

export const doneOperationsContentSchema = z.object({
  ok: z.boolean().optional(),
}).passthrough();
```

  (`.passthrough()` keeps unknown keys; refine arrays once item shape is confirmed in 1.1.)

- [ ] **Step 2:** `pnpm type-check`.

### Task 1.4: Add stop-operation mutation key to the query-key factory

**Files:** Modify `src/services/operation-query-keys.ts`.

- [ ] **Step 1:** Add a mutation-key entry:

```ts
export const operationQueryKeys = {
  all: ['operation'] as const,
  allOperations: () => [...operationQueryKeys.all, 'all-operations'] as const,
  doneOperations: () => [...operationQueryKeys.all, 'done-operations'] as const,
  stopOperation: () => [...operationQueryKeys.all, 'stop-operation'] as const,
} as const;
```

- [ ] **Phase 1 commit:**

```bash
git add -A && git commit -m "refactor(operations): type SOAP services and add response schemas (CO-3770)"
```

---

## Phase 2 — Hooks: Mutation & Query Hardening

### Task 2.1: Convert `use-stop-operation.ts` to `useMutation`

**Files:** Rewrite `src/services/use-stop-operation.ts`. Reference: `cos` `services/use-create-cos.ts` pattern.

- [ ] **Step 1:** Rewrite as a `useMutation` returning `{ mutate, isPending, isError }`. Keep the same side effects (snackbar success/error, `setOpen(false)`, `setWizardDetailToggle(false)`, invalidate `allOperations`), but move them into `onSuccess`/`onError`. Wrap the `JSON.parse(res?.Body?.response?.content)` in try/catch + `operationsContentSchema.safeParse`:

```ts
type StopOperationVariables = { id: string; serverName?: string };

export function useStopOperation(onSuccessClose: () => void, successI18nKey: string, successDefault: string) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, StopOperationVariables>({
    mutationKey: operationQueryKeys.stopOperation(),
    mutationFn: ({ id }) => stopOperations(id),
    onSuccess: async (_data, vars) => {
      let ok = false;
      try {
        const raw = JSON.parse((_data as SoapContentResponse)?.Body?.response?.content ?? '{}');
        const parsed = operationsContentSchema.safeParse(raw);
        ok = parsed.success
          ? Boolean(parsed.data.response?.[vars.serverName ?? '']?.ok)
          : false;
      } catch { ok = false; }
      if (ok) {
        createSnackbar({ key: 'success', severity: 'success', label: t(successI18nKey, { name: vars.id, defaultValue: successDefault }), autoHideTimeout: 3000, hideButton: true, replace: true });
        await queryClient.invalidateQueries({ queryKey: operationQueryKeys.allOperations() });
      } else {
        createSnackbar({ key: 'error', severity: 'error', label: t('label.operation.stop_operation_error', 'Stop operation failed'), autoHideTimeout: 3000, hideButton: true, replace: true });
      }
      onSuccessClose();
    },
    onError: (error) => {
      createSnackbar({ key: 'error', severity: 'error', label: error?.message || t('label.operation.stop_operation_error', 'Stop operation failed'), autoHideTimeout: 3000, hideButton: true, replace: true });
      onSuccessClose();
    },
  });
}
```

  (Confirm exact `name` interpolation from the old code; preserve the success message variable substitution.)

- [ ] **Step 2:** Update call sites in `running-detail-panel.tsx` and `queued-detail-panel.tsx` (these will be merged in Phase 4, so this is provisional): call `const stopMutation = useStopOperation(() => { setOpen(false); setWizardDetailToggle(false); }, key, default)` and invoke `stopMutation.mutate({ id: selectedData?.id, serverName })`.
- [ ] **Step 3:** `rg -n "\.then\(|\.catch\(" src/services/use-stop-operation.ts` → expect **0 matches** (no hand-rolled promise chain).

### Task 2.2: Harden the two query hooks (try/catch + Zod)

**Files:** Modify `src/services/use-all-operations.ts`, `src/services/use-done-operations.ts`.

- [ ] **Step 1:** Wrap each `JSON.parse(response?.Body?.response?.content)` in try/catch returning a typed empty fallback, and run the matching schema `safeParse`. Example for `use-all-operations.ts`:

```ts
let parsed: OperationsContent = {};
try {
  const raw = JSON.parse(response?.Body?.response?.content ?? '{}');
  const result = operationsContentSchema.safeParse(raw);
  if (result.success) parsed = result.data as OperationsContent;
} catch { parsed = {}; }
```

  Keep the existing `select`/filter logic operating on `parsed`.

- [ ] **Step 2:** Apply the same to `use-done-operations.ts` using `doneOperationsContentSchema`.
- [ ] **Step 3:** `rg -n "JSON.parse" src/services` → confirm all 3 occurrences are now inside try/catch.
- [ ] **Phase 2 commit:**

```bash
git add -A && git commit -m "refactor(operations): convert stop hook to useMutation and validate responses (CO-3770)"
```

---

## Phase 3 — Spelling & Rename Cleanup

> Mechanical renames. Do these before structural changes so later edits use final names. Each rename = update declaration + all imports + all usages + the relevant test files.

### Task 3.1: Rename boolean constants

**Files:** `src/constants.ts` + every import/usage site.

- [ ] **Step 1:** In `constants.ts`: `TRUE_OPERTION` → `TRUE_OPERATION`, `FALSE_OPERTION` → `FALSE_OPERATION`.
- [ ] **Step 2:** Update import + 4 usages in `operations-wizard-detail-panel.tsx`.
- [ ] **Step 3:** `rg -n "OPERTION" src` → expect **0 matches**.

### Task 3.2: Rename `MiliSecondToDate` → `MilliSecondToDate` + file extension `.tsx` → `.ts`

**Files:** `src/views/operations/functions/`.

- [ ] **Step 1:** `git mv src/views/operations/functions/miliSecondToDate.tsx src/views/operations/functions/milliSecondToDate.ts`.
- [ ] **Step 2:** In the new file: rename function `MiliSecondToDate` → `MilliSecondToDate`; convert to named export (`export function MilliSecondToDate(...)` or `export const MilliSecondToDate = (...) =>`). Remove `export default`.
- [ ] **Step 3:** Update `miliSecondToDate.test.ts` → rename to `milliSecondToDate.test.ts`; update all references (7 sites).
- [ ] **Step 4:** Update imports/usages in `operations-table.tsx` (3 sites) and `operations-wizard-detail-panel.tsx` (2 sites) to named import.
- [ ] **Step 5:** `rg -n "MiliSecond" src` → expect **0 matches**.

### Task 3.3: Rename `delete-operations-model` → `delete-operations-modal` (file + identifier)

**Files:** `src/views/operations/`.

- [ ] **Step 1:** `git mv src/views/operations/delete-operations-model.tsx src/views/operations/delete-operations-modal.tsx`.
- [ ] **Step 2:** Rename `DeleteOpearationsModel` → `DeleteOperationsModal`; switch to named export (drop `export default`).
- [ ] **Step 3:** Update imports/usages in `running-detail-panel.tsx` (2 sites) and `queued-detail-panel.tsx` (2 sites) — these become the merged panel in Phase 4, so just keep imports valid.
- [ ] **Step 4:** `rg -n "Opearation|operations-model" src` → expect **0 matches**.

### Task 3.4: Fix misspelled i18n keys (source only)

**Files:** `operations-wizard-detail-panel.tsx`, `running-detail-panel.tsx`, `queued-detail-panel.tsx`.

- [ ] **Step 1:** `stop_opearation_btn` → `stop_operation_btn` (`operations-wizard-detail-panel.tsx:118`).
- [ ] **Step 2:** `cancel_opearation_btn` → `cancel_operation_btn` (`operations-wizard-detail-panel.tsx:119`).
- [ ] **Step 3:** `cancel_operation_sucess` → `cancel_operation_success` (`queued-detail-panel.tsx:52`).
- [ ] **Step 4:** `stop_operation_sucess` → `stop_operation_success` (`running-detail-panel.tsx:52`).
- [ ] **Step 5:** `rg -n "opearation|sucess" src` → expect **0 matches**. (Note: external translation repos keyed by old names will fall back to inline defaults — recorded as known follow-up.)
- [ ] **Phase 3 commit:**

```bash
git add -A && git commit -m "refactor(operations): fix spelling in identifiers, files, and i18n keys (CO-3770)"
```

---

## Phase 4 — Structural Consolidation & Refactor

### Task 4.1: Merge `running-detail-panel.tsx` + `queued-detail-panel.tsx` → `operation-state-detail-panel.tsx`

> Research shows the two files are ~95% identical; only 4 differences: state filter (`STARTED` vs `QUEUED`), stop i18n key/default, heading key/text, and indentation.

**Files:** Create `src/views/operations/operation-state-detail-panel.tsx`; delete the two originals; update route imports.

- [ ] **Step 1:** Create `operation-state-detail-panel.tsx` as a named-export function component parameterized by:

```ts
type OperationStateDetailPanelProps = {
  state: string;                 // STARTED | QUEUED
  headingKey: string;            // 'operations.running_panel_heading' | 'operations.queued_panel_heading'
  headingDefault: string;        // 'Running Operations' | 'Queued Operations'
  stopSuccessI18nKey: string;    // 'label.stop_operation_success' | 'label.cancel_operation_success'
  stopSuccessDefault: string;
};
```

  Body = the shared structure (query + `select` filter by `state`, header memo, state, `useStopOperation`, `closeHandler`, `handleClick`, JSX). Use the `useStopOperation` mutation from Phase 2.
- [ ] **Step 2:** Update `operations-section-routes.ts` to render `<OperationStateDetailPanel state={STARTED} ... />` for the running route and `<OperationStateDetailPanel state={QUEUED} ... />` for the queued route.
- [ ] **Step 3:** `git rm src/views/operations/running-detail-panel.tsx src/views/operations/queued-detail-panel.tsx`.
- [ ] **Step 4:** Merge their browser tests into `operation-state-detail-panel.browser.test.tsx` (parameterized), or keep two thin test files importing the same component with different props. Delete the old test files.
- [ ] **Step 5:** `pnpm type-check`.

### Task 4.2: Refactor `operations-table.tsx` — extract row builder, type props, drop `useMemo`

**Files:** `src/views/operations/operations-table.tsx`.

- [ ] **Step 1:** Replace the 3 `useMemo` row-builder blocks (lines 30–210) with a pure helper `function buildOperationRows(operations, onClick, donePanel)` defined at module scope (not inside the component). Call it directly in render: `const tableRows = buildOperationRows(operations, onClick, donePanel);`. React Compiler memoizes automatically.
- [ ] **Step 2:** Replace `headers: any; selectedRows: any; onSelectionChange: any` (lines 22–25) with concrete types:

```ts
type OperationsTableProps = {
  operations: Array<OperationItem> | undefined;
  onClick: (index: number) => void;
  donePanel?: boolean;
  headers: Array<{ id: string; label: string }>;
  selectedRows: Array<string>;
  onSelectionChange: (rows: Array<string>) => void;
};
```

  (Confirm exact `headers` element shape from call sites before finalizing.)
- [ ] **Step 3:** Remove the now-unused `useMemo` import.
- [ ] **Step 4:** `rg -n "useMemo" src/views/operations/operations-table.tsx` → **0 matches**.
- [ ] **Phase 4 commit:**

```bash
git add -A && git commit -m "refactor(operations): consolidate detail panels and refactor table (CO-3770)"
```

---

## Phase 5 — React Compiler Compliance Sweep

> Apply to the **post-Phase-4** file set. Remove all `FC`, `useMemo`, `useCallback`, convert all components to function declarations with named exports.

### Task 5.1: Hoist `OperationTooltipView` out of `App` (`app.tsx`)

**Files:** `src/app.tsx`.

- [ ] **Step 1:** Move `OperationTooltipView` to module scope as a normal component (it calls `useTranslation()` internally for `t`). Remove the `useCallback` wrapper and `FC` annotation:

```tsx
function OperationTooltipView() {
  const [t] = useTranslation();
  return (<PrimaryBarTooltip> ... </PrimaryBarTooltip>);
}
```

- [ ] **Step 2:** Replace `logAndQueuesSection = useMemo(...)` with a plain object computed in render (or inline at the `addRoute` call). Drop `useEffect` deps that referenced it — keep the `useEffect` for `addRoute` but with a stable deps array `[isAdvanced, t]` (and `OperationTooltipView` now stable since it's module-scoped).

### Task 5.2: Remove `FC` + convert all components to function declarations + named exports

**Files:** All 11 component declarations:
`app.tsx` (App — keep default export only here if framework requires; **verify** whether the shell needs default — `cos` keeps `export default App` in `app.tsx` only), `app-view.tsx`, `operations-layout.tsx`, `operations-list-panel.tsx`, `operations-table.tsx`, `operations-wizard-detail-panel.tsx`, `operation-state-detail-panel.tsx` (Phase 4), `done-detail-panel.tsx`, `delete-operations-modal.tsx` (Phase 3), plus inline `FunnelSearchIcon` in `done-detail-panel.tsx`.

> **Note on `app.tsx`:** `cos` keeps `export default App` because the Carbonio shell mounts it. Keep the default export **only** in `app.tsx`. Every other file → named exports. Confirm the bootstrap expects a default from `app.tsx` before removing it.

- [ ] **Step 1:** For each component, transform:
  - `const Foo: FC<Props> = ({ a }: Props) => {` → `function Foo({ a }: Props) {` (for props, define a `type FooProps = {...}` if an inline `FC<{...}>` was used).
  - Remove `FC` from the React import.
  - Replace bottom `export default Foo;` with adding `export` to the declaration (`export function Foo(...)`), and update all import sites to named imports.
- [ ] **Step 2:** Transform the inline `FunnelSearchIcon` arrow const in `done-detail-panel.tsx` to a function declaration at module scope.
- [ ] **Step 3:** Update every consumer import across the module + tests to named imports.
- [ ] **Step 4:** `rg -n ": FC|React\.FC|export default" src` → expect matches **only** in `app.tsx` (default) and `custom.d.ts`/`globals.d.ts` (legitimate). `rg -n "FC" src` excluding those → **0**.

### Task 5.3: Remove all remaining `useMemo` / `useCallback`

**Files:** `app.tsx`, `operations-list-panel.tsx` (2), `done-detail-panel.tsx` (1), `operation-state-detail-panel.tsx` (1, from merged header memo), any others.

- [ ] **Step 1:** Convert each `useMemo(() => X, [deps])` to a plain `const X = ...` computed in render (React Compiler memoizes). For `operationsHeader`/`operationsDoneHeader` memoized helpers, call the function directly: `const operationsHeader = OperationsHeader(t);`.
- [ ] **Step 2:** Remove `useMemo`/`useCallback` from React imports everywhere.
- [ ] **Step 3:** `rg -n "useMemo|useCallback" src` → **0 matches**.
- [ ] **Step 4:** `pnpm lint --filter @zextras/admin-ui-operations` → clean (the strict rules already enforce this).
- [ ] **Phase 5 commit:**

```bash
git add -A && git commit -m "refactor(operations): React Compiler compliance — remove FC/useMemo/useCallback, named exports (CO-3770)"
```

---

## Phase 6 — Accessibility

### Task 6.1: Add accessible names to icon-only interactive components

**Files:** `operations-wizard-detail-panel.tsx` (close button), sweep others.

- [ ] **Step 1:** Add `aria-label` to the close button (`operations-wizard-detail-panel.tsx:95`):

```tsx
<Button type="ghost" color="text" icon="CloseOutline" aria-label={t('label.close', 'Close')} onClick={() => setWizardDetailToggle(false)} />
```

  (Confirm `Button` forwards `aria-label`; if not, wrap with a visually-hidden label or use the `label` prop with a visually-hidden style — check `@zextras/ui-components` Button API as `cos` does.)
- [ ] **Step 2:** Sweep all components for icon-only `<Button icon=...>` without `label`/`aria-label` (use `rg -n 'icon="' src/**/*.tsx` and inspect); add accessible names consistent with `cos` (`edition-field.tsx` `aria-label` pattern).
- [ ] **Step 3:** `pnpm lint --filter @zextras/admin-ui-operations` (jsx-a11y recommended rules now enforced).

---

## Phase 7 — Testing

### Task 7.1: Replace all `getByTestId` with user-facing selectors

**Files:** `done-detail-panel.browser.test.tsx:191`, `operation-state-detail-panel.browser.test.tsx` (merged, 4 sites), `running/queued` (now merged).

- [ ] **Step 1:** Replace `page.getByTestId('icon: CloseOutline').click()` → `page.getByRole('button', { name: /close/i }).click()` (works once the close button has `aria-label="Close"` from Task 6.1).
- [ ] **Step 2:** Replace `page.getByTestId('modal').getByRole('button', { name: 'STOP OPERATION' })` → `page.getByRole('dialog').getByRole('button', { name: 'STOP OPERATION' })` (confirm the `Modal` renders with `role="dialog"`; if not, target by the heading or the button by name at page scope).
- [ ] **Step 3:** `rg -n "getByTestId" src` → **0 matches** (except mock stubs that legitimately use `data-testid` to stand in for framework components — those are allowed per `cos` convention).
- [ ] **Step 4:** `pnpm vitest run apps/admin-ui-operations --reporter=verbose`.

### Task 7.2: Expand `operations-table` coverage to >= 80%

**Files:** `tests/operations-table.browser.test.tsx` (or unit test).

- [ ] **Step 1:** Add tests for the newly-extracted `buildOperationRows` helper (pure function — ideal unit test): both `donePanel` and non-done branches, empty `operations`, and that each row's `onClick(index)` fires with the correct index.
- [ ] **Step 2:** Add a test asserting typed `headers` render in order.
- [ ] **Step 3:** `pnpm test:ci --filter @zextras/admin-ui-operations` and confirm `operations-table.tsx` >= 80%.

---

## Phase 8 — Consistency: Indentation

### Task 8.1: Normalize all files to 2-space indentation

**Files:** All `src/**/*.{ts,tsx}` (16 tab-indented + 1 mixed per research).

- [ ] **Step 1:** Run Prettier across the module: `pnpm exec prettier --write "apps/admin-ui-operations/src/**/*.{ts,tsx}"` (Prettier config is already 2-space per repo config).
- [ ] **Step 2:** Spot-check that no unintended semantic changes occurred: `git diff --stat` then review the diff for non-whitespace changes (should be whitespace-only).
- [ ] **Step 3:** `pnpm lint --filter @zextras/admin-ui-operations` and `pnpm type-check`.

---

## Phase 9 — Final Verification

- [ ] **Step 1:** `pnpm turbo run lint --force` → **15/15 pass**.
- [ ] **Step 2:** `pnpm type-check` → clean.
- [ ] **Step 3:** `pnpm test:ci` (or `pnpm vitest run apps/admin-ui-operations --coverage`) → all green, module coverage >= 80%.
- [ ] **Step 4:** Acceptance-criteria grep sweep (all expect **0** unless noted):
  - `rg -n "useMemo|useCallback|: FC|React\.FC" apps/admin-ui-operations/src` → 0
  - `rg -n "any" apps/admin-ui-operations/src` → 0
  - `rg -n "export default" apps/admin-ui-operations/src` → only `app.tsx` (+ `.d.ts`)
  - `rg -n "getByTestId" apps/admin-ui-operations/src` → only mock stubs
  - `rg -n "Opearation|OPERTION|MiliSecond|opearation|sucess" apps/admin-ui-operations/src` → 0
- [ ] **Step 5:** Final commit:

```bash
git add -A && git commit -m "refactor(operations): finalize CO-3770 alignment — lint/type/test clean"
```

---

## Self-Review (spec coverage)

| Spec requirement | Task |
|---|---|
| Remove FC (11) | 5.2 |
| Remove useMemo (9) / useCallback (remaining) | 4.2, 5.1, 5.3 |
| Fix component-in-`useCallback` in `app.tsx` | 5.1 |
| Convert 9 default exports → named | 3.2, 3.3, 5.2 |
| Convert arrow components → function declarations | 5.2 |
| Eliminate 7 `any` (typed service returns + props) | 1.2, 4.2, 5.2 (`selectedData`) |
| Zod/runtime validation for `JSON.parse` | 1.3, 2.1, 2.2 (hybrid) |
| `useMutation` replaces hand-rolled mutation | 2.1 |
| try/catch around `JSON.parse` in query hooks | 2.2 |
| aria-label on close button + ARIA sweep | 6.1 |
| Fix 5 `getByTestId` | 7.1 |
| Expand operations-table coverage | 7.2 |
| Spelling: `DeleteOpearationsModel`→`DeleteOperationsModal` | 3.3 |
| `TRUE_OPERTION`/`FALSE_OPERTION` rename | 3.1 |
| `MiliSecondToDate`→`MilliSecondToDate` | 3.2 |
| i18n key typos | 3.4 |
| `miliSecondToDate.tsx` → `.ts` | 3.2 |
| Deduplicate running/queued panels | 4.1 |
| Normalize indentation | 8.1 |
| ESLint strict `{GLOB}` | **Already done** (`eslint.config.js:100`) — no task needed |

**Gaps/notes:**

- ESLint config is already in place — flagged.
- `done-detail-panel.tsx` kept separate (genuinely different: search/pagination/no-stop) — confirmed in spec scope.
- i18n key renames are source-only; external-translation mismatch recorded as a known follow-up.

---

## Acceptance Criteria

- Zero `useMemo`/`useCallback`/`FC` usage; React Compiler compliant.
- No default exports for components (except framework-required `app.tsx`).
- Zero `any` in source; service responses properly typed and validated.
- `useMutation` replaces hand-rolled mutation; duplicated detail panels consolidated.
- Test coverage >= 80% with zero `getByTestId` in browser tests (except mock stubs).
- All spelling typos in exported identifiers and i18n keys fixed.
- All existing tests pass; lint and type-check clean.
