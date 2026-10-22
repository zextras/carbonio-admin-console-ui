# DataTable Re-architecture on `createTableHook` — Design

## Context

The `upgrade-table-tanstack` branch introduced a TanStack Table v9–based `DataTable`
suite in `packages/ui-components` with a rich admin product feature set (bulk
actions, structured filters, inline edit, peek panel, server-first pagination,
etc.), built on a single ~1,144-line orchestrator component owning ~20 `useState`
hooks and ~100 props. Every state change re-renders the entire table tree.

The sibling branch `tanstack-table-explore` prototyped the headless
`createTableHook` architecture: pre-bound hook + contexts + independently
subscribing parts (`table.Subscribe selector`), giving fine-grained re-render
isolation, but with no product UI.

This design merges the two: the product feature set of
`upgrade-table-tanstack` rebuilt on the `createTableHook` architecture.

## Decisions (approved)

1. **Full composable API** — the two production views are rewritten to compose
   their layout from parts; the old ~100-prop `<DataTable>` entry point is
   replaced by a compound-component API.
2. **Fix review findings during the refactor** (findings 1, 3–12 from the branch
   review; see mapping below).
3. **Bulk actions: architecture only** — parts keep the full contract; views keep
   their current no-op handlers; real SOAP wiring lands in a follow-up.
4. **Testing: rewritten e2e + targeted part tests** for fixed behaviors, plus a
   render-isolation test.
5. **Total Accounts header stays deleted**; its tests are rewritten accordingly.
6. The API break is branch-internal (never merged to main), so no deprecation
   layer is needed.

## Architecture

### Composition model

Compound-component pattern. `DataTableRoot` creates the table instance via
`useDataTable` and provides all contexts; every feature is an independently
composable part:

```tsx
<DataTableRoot
  data={accounts}
  columns={columns}
  manualSorting manualPagination manualFiltering
  rowCount={total}
  state={{ sorting, pagination, rowSelection }}
  onSortingChange={setSorting}
  onPaginationChange={setPagination}
  ...
>
  <DataTableStaleBanner ... />
  <DataTableToolbar>
    <DataTableSearch />
    <DataTableFilters filterDefs={...} onFiltersChange={...} />
    <DataTableCustomize />
  </DataTableToolbar>
  <DataTableFilterChips ... />
  <DataTableBulkBar actions={bulkActions} onAction={...} />
  <DataTableSelectAllMatchingPrompt totalMatchingCount={total} />
  <DataTableBulkJob job={job} ... />
  <DataTableTable aria-label="Accounts" onRowClick={...} enablePeek />
  <DataTablePagination pageSizeOptions={[...]} />
  <DataTablePeekPanel fields={...} renderPeek={...} />
  <DataTableConfirmDialog ... />
  <DataTableUndoToast ... />
  <DataTableLiveRegion />
</DataTableRoot>
```

`DataTableTable` renders the `<table>` element plus header/body/states parts.

### State ownership — three tiers

Rule: *state lives as close to its consumers as possible.*

| Tier | Mechanism | State |
|---|---|---|
| Table state | TanStack store via `createTableHook`; parts subscribe with `table.Subscribe(selector)` | sorting, pagination, rowSelection, columnFilters/globalFilter, columnVisibility, columnOrder, columnPinning |
| Cross-part UI | Per-instance Zustand store created by Root; parts subscribe with `useTableUi(selector)` | peekRowId, editing, selectAllMatching, density, openPanel (`'filters' \| 'customize' \| null`), undoToast, liveMessage, scrollEdge |
| Part-local | plain `useState` inside the part | filter draft values, confirm-pending action, row-menu open state |

### File structure (`packages/ui-components/src/components/display/data-table/`)

- `create-data-table.ts` — `createTableHook` binding (ported from explore)
- `data-table-contexts.tsx` — `createTableHookContexts` + `useDataTableContext`
- `data-table-features.ts` — `tableFeatures({...})` with this branch's feature
  set: rowSorting, rowSelection, rowPagination, columnFiltering,
  globalFiltering, columnVisibility, columnOrdering, columnPinning, columnSizing
- `table-ui-store.tsx` — Zustand factory, `TableUiProvider`, `useTableUi(selector)`
- `data-table-root.tsx`, `table-header.tsx`, `table-body.tsx`,
  `table-footer.tsx`, `table-states.tsx`
- `toolbar/` — `toolbar.tsx`, `search.tsx`, `filters.tsx`, `customize.tsx`
- `bulk/` — `bulk-bar.tsx`, `select-all-matching.tsx`, `confirm-dialog.tsx`,
  `undo-toast.tsx`, `bulk-job.tsx`
- `row-ui/` — `selection-checkbox.tsx`, `row-actions.tsx`,
  `decorated-cell.tsx`, `inline-edit.tsx`, `copy-cell.tsx`
- `peek-panel.tsx`, `stale-banner.tsx`, `live-region.tsx`
- `models/` — pure logic (filter-model, customize-model, row-ui, types)
- `data-table.module.css` — carried over
- `index.ts` — public exports

The old `data-table.tsx` orchestrator and its ~100-prop `DataTableProps` are
deleted at the end of the migration.

### Render isolation guarantees

- Typing in search → only the search input re-renders.
- Page change → body + pagination re-render; toolbar/bulk/peek do not.
- Open peek → peek panel + the highlighted row (selector scoped to `peekRowId`)
  re-render; header/toolbar do not.
- Selection checkbox click → that row + bulk bar re-render.
- Row-menu open, filter drafts, confirm dialog → zero re-renders outside their
  own part.

## Review-findings fix mapping

| # | Finding | Fix / location |
|---|---|---|
| 1 | Broken Total Accounts tests | Tests rewritten with view migration; count header stays deleted |
| 2 | No-op bulk actions report success | Out of scope (follow-up wires real SOAP); ids contract documented: `selectedRowIds` valid only when `!selectAllMatching` |
| 3 | Keyboard a11y in interactive rows | `stopPropagation` on keydown in selection-checkbox, row-actions, copy-cell, inline-edit |
| 4 | Selection leaks across search/sort (server mode) | View effect: search/filters/sorting change → reset pageIndex, rowSelection, selectAllMatching |
| 5 | Phantom page on domain switch / after delete | Clamp effect (`pageIndex*pageSize >= rowCount` → last valid page) + reset effect on domain change |
| 6 | Global Cmd+Z hijack | Undo keydown ignores events targeted at input/textarea/contenteditable |
| 7 | Confirm dialog Escape/focus | Document-level keydown, initial focus + restore |
| 8 | Undo timer bugs | Toast keyed per action id (timer always restarts); countdown stops at 0 |
| 9 | Filter model strictness | Filter fns coerce ISO date strings / numeric strings; open-ended chips render without false bound |
| 10 | `61–60 of 60` | Pagination part clamps from/to to rowCount |
| 11 | Fixed DOM ids break multi-instance | `useId()` per Root instance |
| 12 | Peek arrows hijack inputs | Same target check as #6 |
| 13 | i18n gaps | All part labels via `useTranslation()` with English defaults |
| 14 | Dead code | Delete `use-count-account.ts`, `count-account-service.ts` |
| 15 | Duplicated helpers | `resolveTableStatus` et al. moved to `@zextras/ui-shared` |

## View migration

`apps/admin-ui-domains` views `global-domain-list.tsx` and `manage-accounts.tsx`
are rewritten as Root + parts composition. The React Query / SOAP layer is
untouched. Views gain the reset/clamp effects (#4, #5). View-level labels move
from DataTable props to i18n. No-op bulk handlers remain (decision 3).

## Testing

1. Rewrite the 23-scenario e2e `data-table.browser.test.tsx` against the new
   API — same user-facing behavior.
2. Targeted part tests: undo-toast (timer restart, Cmd+Z target check),
   confirm-dialog (Escape/focus), selection reset on search, pagination clamp,
   filter-model coercion.
3. Render-isolation test: render counters on body vs toolbar during pagination
   change.

## Out of scope

- Real bulk-action SOAP wiring (follow-up PR).
- Explore-only features not used by product views (grouping, aggregation, cell
  spanning, expander rows, column resizing UI).
- Dashboard showcase (no consumer on this branch).
