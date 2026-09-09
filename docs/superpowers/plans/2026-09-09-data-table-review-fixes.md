# Data-Table Review Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 4 pre-merge blockers and 6 lower-severity bugs from the code review of `update-table-architecture` vs `upgrade-table-tanstack`, including the promised e2e + render-isolation tests.

**Architecture:** All fixes stay inside the established TanStack v9 part/store architecture: state clamps are written back via effects (not render-time derivation), parts read option-derived data exclusively through the `table-ui-store` (never `table.options`), and keyboard events layer modal > row-menu > peek > undo-toast via store flags read at event time.

**Tech Stack:** React 19 + React Compiler, @tanstack/react-table 9.2.4, zustand, Vitest (jsdom + browser/Playwright).

**Baseline:** branch `update-table-architecture`; all paths relative to repo root. Test commands: `pnpm vitest run <file>`. All new source files need the SPDX header; no `useMemo`/`useCallback`; no `eslint-disable`.

---

### Task 1: Phantom page — clamp into state (blocker #1)

**Files:**
- Modify: `apps/admin-ui-domains/src/hooks/use-server-table-state.ts`
- Modify: `apps/admin-ui-domains/src/hooks/tests/use-server-table-state.test.tsx`
- Modify: `apps/admin-ui-domains/src/views/manage/accounts/manage-accounts.tsx`
- Modify: `apps/admin-ui-domains/src/views/global/global-domain-list/global-domain-list.tsx`

- [ ] **Step 1: Write failing tests** in `use-server-table-state.test.tsx` (follow the existing renderHook-style harness in that file):
  - `writes the clamped page back into state when totalRowCount shrinks` — pageSize 25; get to page 3; rerender with `totalRowCount: 100` → page stays 3; rerender with `totalRowCount: 30` → `pagination.pageIndex === 1`.
  - `does not clamp while totalRowCount is undefined` — on page 3, rerender `totalRowCount: undefined` → page stays 3.
  - `does not clamp upward when the total grows` — on page 1, rerender `totalRowCount: 1000` → page stays 1.
- [ ] **Step 2: Run** `pnpm vitest run apps/admin-ui-domains/src/hooks/tests/use-server-table-state.test.tsx` — new cases FAIL.
- [ ] **Step 3: Implement.** In `use-server-table-state.ts`: add `useEffect` import; replace the render-time clamp in the return (`pagination: clampPaginationToRowCount(pagination, totalRowCount)` → `pagination,`) with an effect before the return:

```tsx
// #5: clamp the page index INTO state when the server total shrinks
// (deletions, changed result sets) so the query offset, the table chrome
// and the internal page stay in sync. Undefined total (query loading
// without placeholder data) never clamps.
useEffect(() => {
  if (totalRowCount === undefined) {
    return;
  }
  setPagination((prev) => clampPaginationToRowCount(prev, totalRowCount));
}, [totalRowCount, setPagination]);
```

**Deviation (recorded):** the clamp was implemented with the render-time adjust pattern instead of the effect above (repo lint bans setState-in-effect), and views bridge the raw query total into the hook via a guarded `totalRowCount` state whose undefined window (TDZ — query pending, no data yet) never clamps; tests cover both paths and verify equivalence with the effect-based spec.

Update the `totalRowCount` option JSDoc: clamped into state (self-healing; the clamped page's data is refetched because the query offset changes). Views MUST pass the raw query total (`data?.total`, not `?? 0`) so a pending query without data does not spuriously clamp to page 0.

- [ ] **Step 4: Views.**
  - `manage-accounts.tsx`: `useServerTableState({ resetKey: domainId, pageSize: RECORD_DISPLAY_LIMIT, initialSorting: NAME_SORT, totalRowCount: data?.total })`; rename destructure `pagination: rawPagination` → `pagination`; use it for the query offset; delete the local `const pagination = clampPaginationToRowCount(rawPagination, totalAccount);` + comment; remove unused import.
  - `global-domain-list.tsx`: same with `totalRowCount: data?.searchTotal`.
  - `clampPaginationToRowCount` stays exported (used internally by the hook).
- [ ] **Step 5: Run** hook tests + both views' browser tests — PASS.
- [ ] **Step 6: Commit** `fix(admin-ui-domains): clamp server-table page index into state`

---

### Task 2: Bulk-bar — replace `table.options` read with store slice (blocker #2)

**Files:**
- Modify: `packages/ui-components/src/components/display/data-table/bulk/bulk-bar.tsx`
- Test: `packages/ui-components/src/components/display/data-table/bulk/bulk-bar.test.tsx`

- [ ] **Step 1: Failing test**: render the bar in the existing harness without `totalMatchingCount`; select 2 rows → banner "2"; via store probe `setResolvedRowCount(50)` + `setSelectAllMatching(true)` → banner "50"; then `setResolvedRowCount(60)` (Root republish) → banner "60" without any table interaction (old code fails: frozen `table.options`).
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** in `bulk-bar.tsx`:
  - Delete `resolveFilteredRowCount` and the `Table` type import if unused.
  - Add `const manualRowCount = useTableUi((s) => s.resolvedRowCount);`
  - Replace `currentTotalMatching`:

```tsx
/** Selection count that "select all matching" would act on. */
function currentTotalMatching(): number {
  return (
    totalMatchingCount ??
    manualRowCount ??
    table.getFilteredRowModel().rows.length
  );
}
```

Doc comment: manual-mode count comes from the Root-published store slice (compiler-safe); client mode counts the filtered row model inside the Subscribe (selector already covers `columnFilters`/`globalFilter`).

- [ ] **Step 4: Run** bulk-bar + table-footer tests — PASS.
- [ ] **Step 5: Commit** `fix(data-table): bulk bar counts from the resolvedRowCount store slice`

---

### Task 3: Keyboard layering — Cmd+Z behind modal (blocker #4) + Escape closing two things (bug #9)

**Files:**
- Modify: `packages/ui-components/src/components/display/data-table/table-ui-store.tsx`
- Modify: `packages/ui-components/src/components/display/data-table/row-ui/row-actions.tsx`
- Modify: `packages/ui-components/src/components/display/data-table/table-body.tsx` (peek handler only)
- Modify: `packages/ui-components/src/components/display/data-table/bulk/undo-toast.tsx`
- Modify: `packages/ui-components/src/components/display/data-table/bulk/bulk-bar.tsx` (wire prop)
- Test: `bulk/undo-toast.test.tsx`, `row-ui/row-actions.test.tsx`

- [ ] **Step 1: Failing tests:**
  - `undo-toast.test.tsx`: `ignoreShortcut={() => true}` → Cmd+Z does NOT undo; `() => false` → does (prop optional, existing tests unchanged).
  - `row-actions.test.tsx`: open menu → store `rowMenuOpen === true`; close → false.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement:**
  - Store: add `rowMenuOpen: boolean` + `setRowMenuOpen` (mirror `modalOpen`), JSDoc: parts below the menu layer (peek navigation) must bail while true so a single Escape closes only the topmost layer: modal > row menu > peek.
  - `row-actions.tsx`: publish via effect when `open` changes (set true; cleanup sets false).
  - `table-body.tsx` peek handler early return (read at event time):

```tsx
if (uiStore.getState().modalOpen || uiStore.getState().rowMenuOpen) {
  return;
}
```

  - `undo-toast.tsx`: optional `ignoreShortcut?: () => boolean` prop; latest-callback ref (assign in the existing post-commit effect); in the keydown handler, before preventDefault: `if (ignoreShortcutRef.current?.()) { return; }`.
  - `bulk-bar.tsx`: pass `ignoreShortcut={() => uiStore.getState().modalOpen}` on `<DataTableUndoToast>`.
- [ ] **Step 4: Run** undo-toast + row-actions + table-body tests — PASS.
- [ ] **Step 5: Commit** `fix(data-table): layer keyboard handling modal > row menu > peek`

---

### Task 4: Editing target cleared when its row leaves the page (bug #5)

**Files:**
- Modify: `packages/ui-components/src/components/display/data-table/table-body.tsx`
- Test: `packages/ui-components/src/components/display/data-table/table-body.test.tsx`

- [ ] **Step 1: Failing test**: two-page harness with editable column; start editing a cell on page 1 (`store.setEditing({ rowId, columnId })`); change page; assert `store.getState().editing === null`; navigating back does NOT reopen edit mode.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** — module-level reconciler (S6478), rendered inside the existing `table.Subscribe` callback (wrap `<tbody>` in a fragment). `pageRowIds` changes identity every row-model change so the React Compiler cannot memoize it away (same pattern as `ScrollEdgeEffect`):

```tsx
const EditingReconciler = ({
  pageRowIds,
}: {
  pageRowIds: Array<string>;
}) => {
  const editing = useTableUi((s) => s.editing);
  const setEditing = useTableUi((s) => s.setEditing);
  useEffect(() => {
    if (editing !== null && !pageRowIds.includes(editing.rowId)) {
      setEditing(null);
    }
  }, [editing, pageRowIds, setEditing]);
  return null;
};
```

In the Subscribe callback: `const pageRowIds = pageRows.map((row) => row.id);` and return `<><EditingReconciler pageRowIds={pageRowIds} /><tbody>…</tbody></>`.
- [ ] **Step 4: Run** table-body tests — PASS.
- [ ] **Step 5: Commit** `fix(data-table): clear editing target when its row leaves the page model`

---

### Task 5: Skeleton rows include the actions column (bug #6)

**Files:**
- Modify: `packages/ui-components/src/components/display/data-table/table-states.tsx`
- Modify: `packages/ui-components/src/components/display/data-table/table-body.tsx`
- Test: `packages/ui-components/src/components/display/data-table/table-body.test.tsx`

- [ ] **Step 1: Failing test**: harness with `rowActions` + `status="loading"`: each skeleton `<tr>` must have exactly as many `<td>`s as the header row.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement:**
  - `table-states.tsx`: `showActions?: boolean` on `SkeletonRowsProps`; after the column cells: `{showActions && <td className={`${styles.td} ${styles.tdActions}`} />}`.
  - `table-body.tsx` (inside the Subscribe callback where `stateColSpan` is computed):

```tsx
const showActions = table
  .getVisibleLeafColumns()
  .some((column) => column.id === ACTIONS_COLUMN_ID);
```

pass to `<DataTableSkeletonRows …>` (ACTIONS_COLUMN_ID already imported).
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `fix(data-table): skeleton rows match the actions column count`

---

### Task 6: Date filter — extend bounds after the reversed swap (bug #7)

**Files:**
- Modify: `packages/ui-components/src/components/display/data-table/models/filter-model.ts` (`resolveDateEndpoints` only)
- Test: `packages/ui-components/src/components/display/data-table/models/filter-model.test.ts`

- [ ] **Step 1: Failing test** (follow the `resolveFilterValue` pattern at filter-model.test.tsx:400-407):

```tsx
it('swaps reversed bounds before applying the end-of-day extension', () => {
  const resolved = dateRangeFilterFn.resolveFilterValue?.(['2026-01-10', '2026-01-05']) ?? [];
  expect(resolved).toEqual([
    new Date('2026-01-05T00:00:00.000Z').getTime(),
    new Date('2026-01-10T23:59:59.999Z').getTime(),
  ]);
  expect(dateRangeFilterFn(rowWithValue('2026-01-05T12:00:00.000Z'), 'col', resolved)).toBe(true);
  expect(dateRangeFilterFn(rowWithValue('2026-01-10T20:00:00.000Z'), 'col', resolved)).toBe(true);
  expect(dateRangeFilterFn(rowWithValue('2026-01-04T23:00:00.000Z'), 'col', resolved)).toBe(false);
});
```

- [ ] **Step 2: Run** — FAIL (old code yields `[Jan-5 23:59:59.999, Jan-10 00:00]`).
- [ ] **Step 3: Implement:**

```tsx
function endOfDayTimestamp(bound: unknown): number | null {
  if (typeof bound === 'string' && DATE_ONLY_PATTERN.test(bound.trim())) {
    // A date-only upper bound means "through that day": a bare
    // `YYYY-MM-DD` parses to UTC midnight and would otherwise exclude
    // the rest of the day.
    return new Date(`${bound.trim()}T23:59:59.999Z`).getTime();
  }
  return coerceDateTimestamp(bound);
}

function resolveDateEndpoints(val: unknown): Array<number | null> {
  const [unsafeFrom, unsafeTo] = Array.isArray(val) ? val : [undefined, undefined];
  const from = coerceDateTimestamp(unsafeFrom);
  const to = coerceDateTimestamp(unsafeTo);
  if (from !== null && to !== null && from > to) {
    // Normalize order FIRST, then extend whichever raw input is now the
    // upper bound so date-only semantics survive the swap.
    return [to, endOfDayTimestamp(unsafeFrom)];
  }
  return [from, endOfDayTimestamp(unsafeTo)];
}
```

- [ ] **Step 4: Run** filter-model tests — PASS.
- [ ] **Step 5: Commit** `fix(data-table): extend date bounds after the reversed swap`

---

### Task 7: Live region re-announces identical messages (bug #8)

**Files:**
- Modify: `packages/ui-components/src/components/display/data-table/table-ui-store.tsx` (`announce` action only)
- Create: `packages/ui-components/src/components/display/data-table/live-region.test.tsx`

- [ ] **Step 1: Failing test** (jsdom, mock `react-i18next` like `bulk-bar.test.tsx`): render `<TableUiProvider><DataTableLiveRegion /></TableUiProvider>` + probe button calling `store.getState().announce('Copied')`; click twice with `vi.useFakeTimers()` + `advanceTimersByTime(1100)` between; assert region text cycles `'' → 'Copied' → '' → 'Copied'`.
- [ ] **Step 2: Run** — FAIL (message never clears).
- [ ] **Step 3: Implement** — timed clear scoped to the store closure inside `createDataTableUiStore`:

```tsx
let liveMessageClear: ReturnType<typeof setTimeout> | undefined;
// …inside the creator:
announce: (liveMessage) => {
  set({ liveMessage });
  if (liveMessageClear !== undefined) {
    clearTimeout(liveMessageClear);
  }
  // Clear after the announcement so an identical follow-up message is a
  // real content change assistive tech re-announces.
  liveMessageClear = setTimeout(() => {
    set({ liveMessage: '' });
    liveMessageClear = undefined;
  }, 1000);
},
```

- [ ] **Step 4: Run** new test + `table-ui-store.test.tsx` — PASS (adjust store test only if its liveMessage assertions need fake timers).
- [ ] **Step 5: Commit** `fix(data-table): clear live message so repeats re-announce`

---

### Task 8: Deselecting a row breaks select-all-matching (bug #10)

**Files:**
- Modify: `packages/ui-components/src/components/display/data-table/data-table-root.tsx` (`buildSelectColumn` only)
- Test: `packages/ui-components/src/components/display/data-table/data-table-root.test.tsx`

- [ ] **Step 1: Failing test**: harness with `enableRowSelection`, 12 rows (client mode, pageSize 5); activate select-all-matching (store probe `setSelectAllMatching(true)` after selecting the page); assert every row checkbox checked; uncheck ONE row → assert `selectAllMatching === false`, that row unchecked, other page rows stay checked, banner count = page size − 1. FAILS today (row stays visually selected).
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** — module-level store-aware checkbox components (S6478). `buildSelectColumn` gains `uiStore: DataTableUiStore` in its options (Root shell already holds `uiStore`; pass it at the call site ~line 327):

```tsx
type SelectRowCellProps<TData extends RowData> = {
  row: Row<TData>;
  table: Table<DataTableFeatures, TData>;
  uiStore: DataTableUiStore;
  selectRowLabel: string;
};

/**
 * Store-aware row checkbox: while "select all matching" is active every
 * row renders checked (the flag spans pages the selection state has
 * never seen), and unchecking any row breaks the flag down to an
 * explicit selection of the remaining page rows.
 */
const SelectRowCell = <TData extends RowData>({
  row,
  table,
  uiStore,
  selectRowLabel,
}: SelectRowCellProps<TData>) => {
  const selectAllMatching = useTableUi((s) => s.selectAllMatching);
  return (
    <SelectionCheckbox
      aria-label={selectRowLabel}
      checked={row.getIsSelected() || selectAllMatching}
      disabled={!row.getCanSelect()}
      onChange={(event) => {
        const checked = event.target.checked;
        if (selectAllMatching && !checked) {
          const next: RowSelectionState = {};
          table.getRowModel().rows.forEach((pageRow) => {
            if (pageRow.id !== row.id) {
              next[pageRow.id] = true;
            }
          });
          table.setRowSelection(next);
          uiStore.getState().setSelectAllMatching(false);
          return;
        }
        row.getToggleSelectedHandler()(event);
      }}
    />
  );
};
```

Mirror for the header (`SelectAllCell`): `checked={table.getIsAllPageRowsSelected() || selectAllMatching}`; on uncheck while flag on → `table.resetRowSelection()` + `setSelectAllMatching(false)`; else `table.getToggleAllPageRowsSelectedHandler()(event)`. Update `buildSelectColumn`'s `header`/`cell` to render these, taking `table` from the render context. Import `RowSelectionState`, `Table`, `Row` types, `DataTableFeatures`, `useTableUi`, `DataTableUiStore` as needed. `table-body.tsx` row styling (`row.getIsSelected() || selectAllMatching`) stays as-is.
- [ ] **Step 4: Run** root + body + bulk-bar tests — PASS.
- [ ] **Step 5: Commit** `fix(data-table): unchecking a row breaks select-all-matching`

---

### Task 9: Package e2e rewrite (blocker #3a — design doc Task 13 Step 1)

**Files:**
- Create: `packages/ui-components/src/components/display/data-table/tests/data-table.browser.test.tsx` (path of the deleted suite)

- [ ] **Step 1: Build the harnesses.** Port `ALL_ROWS` (25 accounts), `columns`, `STATUS_FILTER_DEFS` verbatim from `git show upgrade-table-tanstack:packages/ui-components/src/components/display/data-table/tests/data-table.browser.test.tsx` (lines 21-72). Replace the four `DataTable` orchestrator harnesses with composable equivalents (structural change only; scenario bodies port nearly verbatim since they were role/label-based):

```tsx
function ClientDataTable({ status = 'idle' as const, onRetry }: {
  status?: 'idle' | 'loading' | 'empty' | 'error';
  onRetry?: () => void;
}) {
  return (
    <DataTableRoot
      data={ALL_ROWS}
      columns={columns}
      getRowId={(row) => row.id}
      manualSorting={false}
      manualPagination={false}
      manualFiltering={false}
      enableRowSelection
      primaryColumnId="account"
    >
      <DataTableLiveRegion />
      <DataTableToolbar>
        <DataTableSearch value="" onSearchChange={() => {}} />
        <DataTableFilters filterDefs={STATUS_FILTER_DEFS} filters={{}} onFiltersChange={() => {}} />
        <DataTableCustomize />
      </DataTableToolbar>
      <DataTableBulkBar enableSelectAllMatching totalMatchingCount={ALL_ROWS.length} />
      <DataTableTable aria-label="Manage Accounts" status={status} onRetry={onRetry}
        emptyTitle="No accounts yet" emptyDescription="Create the first one."
        errorTitle="Failed to load accounts" errorDescription="Please try again." retryLabel="Retry" />
      <DataTablePagination pageSizeOptions={[10, 25, 50, 100]} />
      <DataTablePeekPanel title={(row) => row.account} />
    </DataTableRoot>
  );
}
```

Add `FilteringDataTable` (controlled `useState` filters + search, `manualFiltering={false}`, `searchColumnIds={['account', 'displayName']}`, use `DataTableTableFooter paginationThreshold={100}` below threshold), `CustomizeDataTable` (no selection), `ChromeDataTable` (`enablePeek`, `rowActions`, `onCellEditCommit`, `onRowAction`, 5 rows, `onCopyCell`), and a `ServerDataTable` variant for stale-banner/bulk-job (controlled `useState` slices + `bulkJob` prop on `DataTableBulkBar`, stale via shrinking data swap — mirror old lines 557+ wiring). Use `render` from `vitest-browser-react`, `page`/`userEvent` from `vitest/browser`, `afterEach(() => { document.body.replaceChildren(); })`, `testTimeout: 10_000`.

- [ ] **Step 2: Port the 22 scenarios** (names + bodies from the old file, lines 198-598, via `git show upgrade-table-tanstack:…tests/data-table.browser.test.tsx`): renders headers and rows; cycles column sorting (3 clicks + `aria-sort`); selection banner + clear; select-all-matching prompt; result-count footer below threshold; pagination above threshold; skeleton rows; empty state; error + retry; filters panel apply (badge + chip); clear draft without applying; remove chip + Clear all; density via Customize; hide column + primary locked; reorder + Reset; inline edit Enter/Escape; copy cell (assert live region announces "Copied to clipboard"); row actions fire onRowAction; peek open/arrows/escape; bulk variant A (toolbar↔banner swap); bulk variant B + danger confirm; stale banner + bulk job chrome. Selector deltas: search input via `getByRole('textbox', { name: 'Search accounts' })`; customize/filters panels per `toolbar/customize.tsx` / `toolbar/filters.tsx` rendered roles; undo toast via `getByRole('status')` + `getByRole('button', { name: 'Undo' })`. Never `getByTestId`.
- [ ] **Step 3: Run** `pnpm vitest run packages/ui-components/src/components/display/data-table/tests/data-table.browser.test.tsx --reporter=verbose` — all 22 green.
- [ ] **Step 4: Commit** `test(data-table): composable e2e suite`

---

### Task 10: Render-isolation lock (blocker #3b — design doc Task 13 Step 3)

**Files:**
- Create: `packages/ui-components/src/components/display/data-table/tests/render-isolation.browser.test.tsx`

- [ ] **Step 1: Write the test** (module-level probes + counters, S6478-safe; counters must not contain the substring "render" — lint quirk):

```tsx
let bodyPaints = 0;
let toolbarPaints = 0;
function BodyProbe(props: React.ComponentProps<typeof DataTableTable>) {
  bodyPaints += 1;
  return <DataTableTable {...props} />;
}
function ToolbarProbe({ children }: { children: React.ReactNode }) {
  toolbarPaints += 1;
  return <DataTableToolbar>{children}</DataTableToolbar>;
}

it('pagination change does not re-paint the toolbar', async () => {
  await render(
    <DataTableRoot data={ALL_ROWS} columns={columns} getRowId={(r) => r.id}
      manualPagination={false} enableRowSelection primaryColumnId="account">
      <ToolbarProbe><DataTableSearch value="" onSearchChange={() => {}} /></ToolbarProbe>
      <BodyProbe aria-label="T" status="idle" emptyTitle="E" emptyDescription="D"
        errorTitle="E" errorDescription="D" retryLabel="R" editRequiredMessage="R"
        editSaveLabel="S" editCancelLabel="C" copiedAnnounceLabel="Copied" />
      <DataTablePagination pageSizeOptions={[10, 25]} />
    </DataTableRoot>,
  );
  const before = toolbarPaints;
  await userEvent.click(page.getByRole('button', { name: 'Go to next page' }));
  expect(bodyPaints).toBeGreaterThan(0);
  expect(toolbarPaints).toBe(before);
});

it('typing in search re-paints only the toolbar part', async () => {
  // controlled search state via useState; assert bodyPaints unchanged while
  // toolbarPaints increases (search state lives outside the table atoms)
});
```

Follow `docs/browser-test-conventions.md`; "Next page" aria-label from `pagination.tsx:182`.
- [ ] **Step 2: Run** — green (if the toolbar counter changes on pagination, the architecture regressed — investigate before proceeding).
- [ ] **Step 3: Commit** `test(data-table): render-isolation lock`

---

### Task 11: View browser-test scenarios (#4, #5)

**Files:**
- Modify: `apps/admin-ui-domains/src/views/manage/accounts/tests/manage-accounts.browser.test.tsx`
- Modify: `apps/admin-ui-domains/src/views/global/global-domain-list/tests/global-domain-list.browser.test.tsx`

- [ ] **Step 1:** In `manage-accounts.browser.test.tsx` add two scenarios using the existing SOAP interceptor harness (`createBrowserSoapAPIInterceptor`, `buildAccount`):
  - **search clears selection (#4):** select a row → banner visible; type in search → filtered list served; assert banner gone, rows still render.
  - **last-page clamp (#5):** serve 60 accounts (pageSize 25 → 3 pages), navigate to page 3; switch interceptor to a 30-account response (simulating deletions) and trigger the refetch; assert the table auto-returns to a valid page (page 2) and rows render — not the empty state with a stale footer. Asserts Task 1 end-to-end.
- [ ] **Step 2:** Mirror the clamp scenario in `global-domain-list.browser.test.tsx` (shrinking `searchTotal`).
- [ ] **Step 3: Run** both suites — green. Commit `test(admin-ui-domains): selection reset and page clamp scenarios`.

---

### Task 12: Design-doc reconciliation + final verification

**Files:**
- Modify: `docs/superpowers/plans/2026-09-08-data-table-create-table-hook.md`

- [ ] **Step 1:** Tick Task 13 Steps 1-3 checkboxes; append a "Post-review outcomes" note under Task 13: #5 upgraded from display-only stopgap to state clamp (Task 1 of this plan); bulk-bar `resolveFilteredRowCount` removed (follow-up ticket at line 862 done).
- [ ] **Step 2: Verification:** `pnpm type-check` clean; `pnpm lint` clean; `pnpm vitest run packages/ui-components/src/components/display/data-table apps/admin-ui-domains` green; `pnpm build` green.
- [ ] **Step 3: Commit** `docs(data-table): record post-review outcomes`.

---

## Notes and trade-offs

- **Undo-toast stays decoupled** via an optional `ignoreShortcut` prop (wired to `modalOpen` by bulk-bar) instead of reading the store directly — its standalone tests and any future standalone use keep working.
- **`totalRowCount` must be the raw `data?.total`**, never `?? 0` — a pending query without placeholder data (`useDomainSearch`) would otherwise clamp to page 0 on every refetch. Called out in the hook JSDoc and tests.
- **Out of scope (follow-ups from the review's minor list):** `coerceNumber`/draft-setter edge disagreement, customize Reset order, `aria-valuemax={0}`, menu ARIA ancestors, multi-sort rank indicator, skeleton index keys, peek stale-data residual, render-phase store writes migration.
