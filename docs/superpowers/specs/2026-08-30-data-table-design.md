# DataTable for @zextras/ui-components — Design

Date: 2026-08-30
Status: Approved

## Goal

Create a TanStack Table v9–based table component in `packages/ui-components` exposing the full
TanStack feature set, following repo conventions, coexisting with the legacy factory-based
`Table` component (no call-site migrations).

## Decisions (approved via brainstorming)

1. **New component, coexists** with legacy `Table` — named `DataTable`.
2. **API shape: hook + ready component** — a pre-bound TanStack v9 `createTableHook` instance
   (`useDataTable`, `createDataTableColumnHelper`, `useDataTableContext`, toolbar parts) for
   power users, plus a batteries-included `<DataTable>` component for simple use.
3. **All stock TanStack features** bundled (opt-in per feature via props): sorting, column
   filtering, global filtering, pagination, row selection, expanding, grouping, aggregation,
   column pinning, row pinning, column resizing, column visibility, column ordering, faceting,
   cell selection, cell spanning.
4. **Visual style: match legacy Table** — gray header (`--color-gray3-regular`), odd-row striping
   (`--color-gray6-regular`), hover, selected rows (`--color-highlight-regular`), theme padding
   tokens, implemented as fresh CSS modules.
5. **Composable toolbar** — exported toolbar parts (global filter input, column visibility
   dropdown, pagination controls) built on existing `Input`/`Dropdown`/`Paging`/
   `TrackNumberPerPage`/`Select` components; `DataTable` renders them via an optional `toolbar`
   slot. Nothing rendered unless requested.
6. **Built-in states + slots** — `isLoading`, `emptyState?`, `errorState?` props with built-in
   defaults (spinner/empty message/error text), overridable via ReactNode slots.

## Architecture

Location: `packages/ui-components/src/components/display/data-table/`

```
features.ts                    # tableFeatures({ all stock features }) + row model factories
data-table.tsx                 # ready-made <DataTable> — thin orchestrator
data-table.module.css          # legacy-look styles
table-header.tsx               # thead: sortable/resizable/pinned headers, grouping
table-body.tsx                 # tbody: rows, expanded sub-rows, pinned columns
selection-column.tsx           # display column def: row checkbox + select-all
expander-column.tsx            # display column def: expand/collapse chevron
sort-indicator.tsx / column-resizer.tsx
toolbar/global-filter.tsx      # Input bound to globalFilter state
toolbar/column-visibility.tsx  # Dropdown toggling column visibility
toolbar/pagination.tsx         # Paging + TrackNumberPerPage wired to table state
table-states.tsx               # loading skeleton / empty / error overlays
types.ts                       # public types
tests/                         # *.browser.test.tsx (Playwright) + *.test.ts unit tests
```

Built on TanStack v9 `createTableHook`: a module-level instance pre-binds Carbonio components
(`SortIndicator`, `SelectionCheckbox`, `PaginationToolbar`) as `tableComponents`/
`cellComponents`/`headerComponents` — same pattern the repo uses with TanStack Form's
`createFormHook`.

## Public API

```tsx
type DataTableProps<TData> = {
  data: Array<TData>;
  columns: Array<ColumnDef<TableFeatures, TData>>; // via createDataTableColumnHelper
  // feature toggles, all opt-in:
  enableSorting?; enableColumnFilters?; enableGlobalFilter?; enablePagination?;
  enableRowSelection?; enableExpanding?; enableGrouping?; enableColumnPinning?;
  enableColumnResizing?; enableRowPinning?; enableColumnOrdering?; enableColumnVisibility?;
  enableFaceting?; enableCellSelection?; enableCellSpanning?;
  getRowId?: (row: TData, index: number) => string;
  onRowClick?: (row: TData) => void;
  onSelectionChange?: (rows: Array<TData>) => void;
  // TanStack pass-throughs (controlled + server-side):
  state?; initialState?; onSortingChange?; onPaginationChange?; onRowSelectionChange?;
  onGlobalFilterChange?; onColumnFiltersChange?; onExpandedChange?; onColumnOrderChange?;
  onColumnVisibilityChange?; onColumnPinningChange?; onRowPinningChange?; onCellSelectionChange?;
  manualPagination?; manualSorting?; manualFiltering?; manualGrouping?; pageCount?;
  // states + slots:
  isLoading?; emptyState?: React.ReactNode; errorState?: React.ReactNode;
  toolbar?: React.ReactNode;
  className?: string; style?: React.CSSProperties;
};
```

Exported from `@zextras/ui-components`:
- `DataTable`, `DataTableProps`
- `useDataTable`, `createDataTableColumnHelper`, `useDataTableContext` (pre-bound hook parts)
- `DataTableGlobalFilter`, `DataTableColumnVisibility`, `DataTablePagination` (toolbar parts)
- Shared types

## Data flow & state

- Uncontrolled by default — TanStack store owns state; `Subscribe` for fine-grained re-renders
  (pagination controls re-render on page change without re-rendering the whole table).
- Controlled mode — `state` + `on*Change` props pass straight through to TanStack options;
  `manual*` flags enable server-side sorting/filtering/pagination.
- Selection keyed by `getRowId` (default `row.id ?? String(index)`); convenience
  `onSelectionChange(rows)` maps ids back to data objects.
- No `useMemo`/`useCallback` — React Compiler handles memoization.

## Rendering & styling

- Semantic `<table>` markup (`table`/`rowgroup`/`columnheader`/`row`/`cell` roles).
- CSS module with theme variables; sticky pinned columns via offsets from
  `column.getStart()/getAfter()`; sortable `th` has button semantics + `aria-sort`; resizer is a
  4px `col-resize` handle; grouped rows render group headers + aggregation footers.

## i18n

`useTranslation()` with fallback defaults (`t('label.empty_table', 'Empty Table')`, …), reusing
the same keys as existing `Paging`/`TrackNumberPerPage`.

## Testing

- Browser tests (`.browser.test.tsx`, Playwright, `getByRole` only, `testTimeout: 10_000`):
  rendering, sorting interaction, pagination, selection + select-all, global filter, column
  visibility dropdown, expansion, empty/loading/error states.
- Unit tests for pure helpers.

## Out of scope

- Migrating legacy `Table` call sites (domains, operations, legalhold).
- Row virtualization (no `@tanstack/react-virtual` dependency).
- Lit/web-component variant.
