# DataTable Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a TanStack Table v9–based `DataTable` component (all stock features) in `packages/ui-components`, coexisting with the legacy `Table`.

**Architecture:** A `data-table/` directory with a features bundle (`tableFeatures` + all stock features), isolated React contexts (`createTableHookContexts`), a pre-bound hook (`createTableHook` → `useDataTable`), module-level presentational subcomponents (header/body/footer/states/toolbar), a thin orchestrator (`<DataTable>`), and CSS modules matching the legacy Table look.

**Tech Stack:** React 19 + React Compiler (no `useMemo`/`useCallback`), `@tanstack/react-table@9.2.4`, CSS modules with theme vars, Vitest browser tests (Playwright), `react-i18next`.

**Conventions (apply to EVERY file):** SPDX header (`2026 Zextras`); named arrow-function components; `type` for props; `Array<T>` not `T[]`; no comments unless requested; imports auto-sorted (external first); no `Container`/`Row`/`Padding` imports; no `eslint-disable`; no `console.*` (except `console.error`); tests: browser tests in `tests/*.browser.test.tsx` importing `../../../../web-components`, locators via `getByRole` only.

**Working directory:** repo root `/home/airarch/zextras/carbonio-admin-console-ui-1`. Run tests from repo root with `pnpm vitest run <path> --project browser` (browser project name is auto-configured by `vitest.config.base.ts`; if the project filter fails, run without it). Timeouts are pre-configured globally (10s local / 20s CI).

---

### Task 1: Features bundle

**Files:**
- Create: `packages/ui-components/src/components/display/data-table/features.ts`
- Test: `packages/ui-components/src/components/display/data-table/tests/features.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { dataTableFeatures } from '../features';

describe('dataTableFeatures', () => {
  it('registers all stock feature flags', () => {
    expect(dataTableFeatures.rowSortingFeature).toBeDefined();
    expect(dataTableFeatures.rowSelectionFeature).toBeDefined();
    expect(dataTableFeatures.rowPaginationFeature).toBeDefined();
    expect(dataTableFeatures.rowExpandingFeature).toBeDefined();
    expect(dataTableFeatures.rowPinningFeature).toBeDefined();
    expect(dataTableFeatures.rowAggregationFeature).toBeDefined();
    expect(dataTableFeatures.columnFilteringFeature).toBeDefined();
    expect(dataTableFeatures.columnGroupingFeature).toBeDefined();
    expect(dataTableFeatures.columnOrderingFeature).toBeDefined();
    expect(dataTableFeatures.columnPinningFeature).toBeDefined();
    expect(dataTableFeatures.columnResizingFeature).toBeDefined();
    expect(dataTableFeatures.columnSizingFeature).toBeDefined();
    expect(dataTableFeatures.columnVisibilityFeature).toBeDefined();
    expect(dataTableFeatures.columnFacetingFeature).toBeDefined();
    expect(dataTableFeatures.globalFilteringFeature).toBeDefined();
    expect(dataTableFeatures.cellSelectionFeature).toBeDefined();
    expect(dataTableFeatures.cellSpanningFeature).toBeDefined();
  });

  it('registers all row models and fn registries', () => {
    expect(dataTableFeatures.coreRowModel).toBeTypeOf('function');
    expect(dataTableFeatures.sortedRowModel).toBeTypeOf('function');
    expect(dataTableFeatures.filteredRowModel).toBeTypeOf('function');
    expect(dataTableFeatures.paginatedRowModel).toBeTypeOf('function');
    expect(dataTableFeatures.groupedRowModel).toBeTypeOf('function');
    expect(dataTableFeatures.expandedRowModel).toBeTypeOf('function');
    expect(dataTableFeatures.facetedRowModel).toBeTypeOf('function');
    expect(dataTableFeatures.sortFns).toBeTypeOf('object');
    expect(dataTableFeatures.filterFns).toBeTypeOf('object');
    expect(dataTableFeatures.aggregationFns).toBeTypeOf('object');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/tests/features.test.ts`
Expected: FAIL — cannot resolve `../features`

- [ ] **Step 3: Write the implementation**

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  aggregationFns,
  cellSelectionFeature,
  cellSpanningFeature,
  columnFacetingFeature,
  columnFilteringFeature,
  columnGroupingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createCoreRowModel,
  createExpandedRowModel,
  createFacetedMinMaxValues,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createGroupedRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  globalFilteringFeature,
  rowAggregationFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowPinningFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
} from '@tanstack/react-table';

export type DataTableColumnMeta = {
  align?: 'left' | 'center' | 'right';
};

const dataTableFeatures = tableFeatures({
  cellSelectionFeature,
  cellSpanningFeature,
  columnFacetingFeature,
  columnFilteringFeature,
  columnGroupingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowAggregationFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowPinningFeature,
  rowSelectionFeature,
  rowSortingFeature,
  coreRowModel: createCoreRowModel(),
  expandedRowModel: createExpandedRowModel(),
  facetedMinMaxValues: createFacetedMinMaxValues(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  filteredRowModel: createFilteredRowModel(),
  groupedRowModel: createGroupedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  aggregationFns,
  filterFns,
  sortFns,
  columnMeta: {} as DataTableColumnMeta,
});

export { dataTableFeatures };
export type DataTableFeatures = typeof dataTableFeatures;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/tests/features.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/ui-components/src/components/display/data-table/features.ts packages/ui-components/src/components/display/data-table/tests/features.test.ts
git commit -m "feat(ui-components): add data-table feature bundle"
```

---

### Task 2: Isolated contexts + pre-bound hook

**Files:**
- Create: `packages/ui-components/src/components/display/data-table/data-table-contexts.tsx`
- Create: `packages/ui-components/src/components/display/data-table/create-data-table.tsx`
- Test: `packages/ui-components/src/components/display/data-table/tests/create-data-table.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from 'vitest-browser-react';
import { describe, expect, it } from 'vitest';

import { createDataTableColumnHelper, useDataTable } from '../create-data-table';
import { dataTableContexts } from '../data-table-contexts';

type Person = { id: string; name: string };

const helper = createDataTableColumnHelper<Person>();

function HookProbe() {
  const table = useDataTable({
    data: [{ id: '1', name: 'Ada' }],
    columns: [helper.accessor('name', { header: 'Name' })],
  });
  return <div data-table-id={table.options.data.length}>{table.getRowModel().rows[0]?.id}</div>;
}

describe('create-data-table', () => {
  it('builds a working table instance with the bundled features', async () => {
    render(<HookProbe />);
    await expect.element(page.getByText('0')).toBeVisible();
  });

  it('exposes isolated contexts', () => {
    expect(dataTableContexts.tableContext).toBeDefined();
    expect(dataTableContexts.cellContext).toBeDefined();
    expect(dataTableContexts.headerContext).toBeDefined();
    expect(dataTableContexts.useTableContext).toBeTypeOf('function');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/tests/create-data-table.test.tsx`
Expected: FAIL — cannot resolve `../create-data-table`

- [ ] **Step 3: Write the implementation**

`data-table-contexts.tsx`:

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createTableHookContexts } from '@tanstack/react-table';

import type { dataTableFeatures } from './features';

const dataTableContexts = createTableHookContexts<typeof dataTableFeatures>();

const useDataTableContext = dataTableContexts.useTableContext;

export { dataTableContexts, useDataTableContext };
```

`create-data-table.tsx`:

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createTableHook } from '@tanstack/react-table';

import { dataTableContexts } from './data-table-contexts';
import { dataTableFeatures } from './features';

const { useAppTable, createAppColumnHelper } = createTableHook({
  features: dataTableFeatures,
  tableContext: dataTableContexts.tableContext,
  cellContext: dataTableContexts.cellContext,
  headerContext: dataTableContexts.headerContext,
});

const useDataTable = useAppTable;

const createDataTableColumnHelper = createAppColumnHelper;

export { createDataTableColumnHelper, useDataTable };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/tests/create-data-table.test.tsx`
Expected: PASS (2 tests). If the row renders `0` instead of `1`, `getRowId` defaults to index — the probe div shows `data.length` as attribute and row id as text; adjust assertion to the actual default row id (index-based) — the goal of this test is only that the instance builds.

- [ ] **Step 5: Commit**

```bash
git add packages/ui-components/src/components/display/data-table/data-table-contexts.tsx packages/ui-components/src/components/display/data-table/create-data-table.tsx packages/ui-components/src/components/display/data-table/tests/create-data-table.test.tsx
git commit -m "feat(ui-components): add pre-bound tanstack hook for data-table"
```

---

### Task 3: Public types

**Files:**
- Create: `packages/ui-components/src/components/display/data-table/types.ts`

No test here — types only, compiled by `type-check` in Task 12.

- [ ] **Step 1: Write the implementation**

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type {
  CellSelectionState,
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnVisibilityState,
  ExpandedState,
  OnChangeFn,
  PaginationState,
  RowData,
  RowPinningState,
  RowSelectionState,
  SortingState,
  TableState,
} from '@tanstack/react-table';
import type React from 'react';

import type { DataTableFeatures } from './features';

export type DataTableColumnDef<TData extends RowData> = ColumnDef<DataTableFeatures, TData, any>;

export type DataTableState = TableState<DataTableFeatures>;

type DataTableProps<TData extends RowData> = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onError'
> & {
  data: Array<TData>;
  columns: Array<DataTableColumnDef<TData>>;
  enableSorting?: boolean;
  enableColumnFilters?: boolean;
  enableGlobalFilter?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean | ((row: TData) => boolean);
  enableMultiRowSelection?: boolean;
  enableSubRowSelection?: boolean;
  enableExpanding?: boolean;
  enableGrouping?: boolean;
  enableColumnPinning?: boolean;
  enableRowPinning?: boolean;
  enableColumnResizing?: boolean;
  enableColumnOrdering?: boolean;
  enableColumnVisibility?: boolean;
  enableFaceting?: boolean;
  enableCellSelection?: boolean;
  enableCellSpanning?: boolean;
  getRowId?: (row: TData, index: number) => string;
  getSubRows?: (originalRow: TData, index: number) => Array<TData> | undefined;
  onRowClick?: (row: TData) => void;
  onSelectionChange?: (rows: Array<TData>) => void;
  state?: Partial<DataTableState>;
  initialState?: Partial<DataTableState>;
  onSortingChange?: OnChangeFn<SortingState>;
  onPaginationChange?: OnChangeFn<PaginationState>;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  onGlobalFilterChange?: OnChangeFn<any>;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  onColumnOrderChange?: OnChangeFn<ColumnOrderState>;
  onColumnVisibilityChange?: OnChangeFn<ColumnVisibilityState>;
  onColumnPinningChange?: OnChangeFn<ColumnPinningState>;
  onRowPinningChange?: OnChangeFn<RowPinningState>;
  onExpandedChange?: OnChangeFn<ExpandedState>;
  onCellSelectionChange?: OnChangeFn<CellSelectionState>;
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  manualGrouping?: boolean;
  manualExpanding?: boolean;
  pageCount?: number;
  autoResetPageIndex?: boolean;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  errorState?: React.ReactNode;
  toolbar?: React.ReactNode;
};

export type { DataTableProps };
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui-components/src/components/display/data-table/types.ts
git commit -m "feat(ui-components): add data-table public types"
```

---

### Task 4: Styles

**Files:**
- Create: `packages/ui-components/src/components/display/data-table/data-table.module.css`

- [ ] **Step 1: Write the implementation**

```css
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

.tableContainer {
  position: relative;
  display: block;
  width: 100%;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--padding-size-small);
  padding: 0 0 var(--padding-size-small) 0;
}

.toolbarGroup {
  display: flex;
  align-items: center;
  gap: var(--padding-size-small);
}

.globalFilter {
  flex: 0 1 16rem;
  min-width: 10rem;
}

.table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
}

.table thead {
  background-color: var(--color-gray3-regular);
}

.table th {
  background-color: var(--color-gray3-regular);
  position: sticky;
  top: 0;
  z-index: 2;
  height: 1.875rem;
  padding: 0 0.5rem;
  text-align: left;
  font-weight: bold;
  position: sticky;
}

.table td {
  height: 1.875rem;
  padding: 0 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bodyRow {
  transition: background-color 0.2s ease-out;
}

.bodyRow:nth-child(odd) {
  background-color: var(--color-gray6-regular);
}

.bodyRow:nth-child(odd):hover {
  background-color: var(--color-gray6-hover);
}

.bodyRow:nth-child(even) {
  background-color: var(--color-gray5-regular);
}

.bodyRow:nth-child(even):hover {
  background-color: var(--color-gray5-hover);
}

.bodyRow[data-selected='true'] {
  background-color: var(--color-highlight-regular) !important;
}

.bodyRow[data-pinned='top'],
.bodyRow[data-pinned='bottom'] {
  background-color: var(--color-gray4-regular) !important;
}

.clickable {
  cursor: pointer;
}

th[data-pinned='left'],
td[data-pinned='left'] {
  position: sticky;
  z-index: 1;
  box-shadow: 4px 0 6px -4px rgb(0 0 0 / 25%);
}

th[data-pinned='left'] {
  z-index: 3;
}

th[data-pinned='right'],
td[data-pinned='right'] {
  position: sticky;
  z-index: 1;
  box-shadow: -4px 0 6px -4px rgb(0 0 0 / 25%);
}

th[data-pinned='right'] {
  z-index: 3;
}

td[data-cell-selected='true'] {
  background-color: var(--color-highlight-regular);
  outline: 1px solid var(--color-primary-regular);
}

.sortButton {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  padding: 0;
  background: none;
  border: none;
  font: inherit;
  font-weight: bold;
  color: inherit;
  text-align: inherit;
  cursor: pointer;
}

.resizer {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  user-select: none;
  touch-action: none;
  background: transparent;
}

.resizer:hover,
.resizerActive {
  background: var(--color-primary-regular);
}

.selectCheckbox {
  accent-color: var(--color-primary-regular);
  cursor: pointer;
}

.stateCell {
  text-align: center;
  color: var(--color-gray1-regular);
  padding: var(--padding-size-large) 0 !important;
  height: auto;
}

.paginationInfo {
  min-width: 3rem;
  text-align: center;
}

.pageSizeLabel {
  font-size: var(--font-size-small);
}
```

Note: if `--color-primary-regular` or `--color-gray4-regular` do not exist in `src/theme/theme.css`, replace with the closest existing tokens (`grep -oE '\-\-color-[a-z0-9]+-regular' packages/ui-components/src/theme/theme.css | sort -u` to list).

- [ ] **Step 2: Commit**

```bash
git add packages/ui-components/src/components/display/data-table/data-table.module.css
git commit -m "feat(ui-components): add data-table styles"
```

---

### Task 5: Sticky column helpers

**Files:**
- Create: `packages/ui-components/src/components/display/data-table/sticky.ts`
- Test: `packages/ui-components/src/components/display/data-table/tests/sticky.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { getStickyColumnStyle } from '../sticky';

const unpinnedColumn = { getIsPinned: () => false } as never;
const leftColumn = {
  getIsPinned: () => 'left' as const,
  getStart: (position?: string) => (position === 'left' ? 120 : 0),
  getAfter: () => 0,
} as never;
const rightColumn = {
  getIsPinned: () => 'right' as const,
  getStart: () => 0,
  getAfter: (position?: string) => (position === 'right' ? 80 : 0),
} as never;

describe('getStickyColumnStyle', () => {
  it('returns an empty style for unpinned columns', () => {
    expect(getStickyColumnStyle(unpinnedColumn)).toEqual({});
  });

  it('returns the start offset for left-pinned columns', () => {
    expect(getStickyColumnStyle(leftColumn)).toEqual({ left: 120 });
  });

  it('returns the after offset for right-pinned columns', () => {
    expect(getStickyColumnStyle(rightColumn)).toEqual({ right: 80 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/tests/sticky.test.ts`
Expected: FAIL — cannot resolve `../sticky`

- [ ] **Step 3: Write the implementation**

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { CSSProperties } from 'react';
import type { Column, RowData } from '@tanstack/react-table';

import type { DataTableFeatures } from './features';

function getStickyColumnStyle<TData extends RowData>(
  column: Column<DataTableFeatures, TData>,
): CSSProperties {
  const pinnedPosition = column.getIsPinned();
  if (!pinnedPosition) {
    return {};
  }
  return pinnedPosition === 'left'
    ? { left: column.getStart('left') }
    : { right: column.getAfter('right') };
}

export { getStickyColumnStyle };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/tests/sticky.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/ui-components/src/components/display/data-table/sticky.ts packages/ui-components/src/components/display/data-table/tests/sticky.test.ts
git commit -m "feat(ui-components): add sticky column style helper"
```

---

### Task 6: Sort indicator + column resizer

**Files:**
- Create: `packages/ui-components/src/components/display/data-table/sort-indicator.tsx`
- Create: `packages/ui-components/src/components/display/data-table/column-resizer.tsx`

Rendering is covered by Task 9 header tests.

- [ ] **Step 1: Write `sort-indicator.tsx`**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { SortDirection } from '@tanstack/react-table';

type SortIndicatorProps = {
  direction: false | SortDirection;
};

const SORT_ICONS = {
  asc: 'ChevronSortUpOutline',
  desc: 'ChevronSortDownOutline',
  none: 'ChevronSortEmptyOutline',
} as const;

const SortIndicator = ({ direction }: SortIndicatorProps) => (
  <ds-icon
    icon={direction ? SORT_ICONS[direction] : SORT_ICONS.none}
    size="small"
    aria-hidden="true"
  />
);

export { SortIndicator };
```

- [ ] **Step 2: Write `column-resizer.tsx`**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Header, RowData } from '@tanstack/react-table';
import clsx from 'clsx';

import type { DataTableFeatures } from './features';
import styles from './data-table.module.css';

type ColumnResizerProps<TData extends RowData> = {
  header: Header<DataTableFeatures, TData, any>;
};

const ColumnResizer = <TData extends RowData,>({ header }: ColumnResizerProps<TData>) => (
  <span
    role="separator"
    aria-orientation="vertical"
    aria-label={`Resize ${String(header.column.id)}`}
    className={clsx(styles.resizer, header.column.getIsResizing() && styles.resizerActive)}
    onMouseDown={header.getResizeHandler()}
    onTouchStart={header.getResizeHandler()}
    onClick={(event) => {
      event.stopPropagation();
    }}
  />
);

export { ColumnResizer };
```

- [ ] **Step 3: Run type-check on the package**

Run: `pnpm --filter @zextras/ui-components type-check`
Expected: exit 0 (or only pre-existing errors)

- [ ] **Step 4: Commit**

```bash
git add packages/ui-components/src/components/display/data-table/sort-indicator.tsx packages/ui-components/src/components/display/data-table/column-resizer.tsx
git commit -m "feat(ui-components): add sort indicator and column resizer"
```

---

### Task 7: Selection + expander columns

**Files:**
- Create: `packages/ui-components/src/components/display/data-table/selection-column.tsx`
- Create: `packages/ui-components/src/components/display/data-table/expander-column.tsx`
- Test: `packages/ui-components/src/components/display/data-table/tests/built-in-columns.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { buildExpanderColumn } from '../expander-column';
import { buildSelectionColumn } from '../selection-column';

describe('buildSelectionColumn', () => {
  it('builds a display column def with the selection id', () => {
    const column = buildSelectionColumn();
    expect(column.id).toBe('data-table-select');
    expect(column.size).toBe(40);
  });
});

describe('buildExpanderColumn', () => {
  it('builds a display column def with the expander id', () => {
    const column = buildExpanderColumn();
    expect(column.id).toBe('data-table-expander');
    expect(column.size).toBe(40);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/tests/built-in-columns.test.ts`
Expected: FAIL — cannot resolve `../selection-column`

- [ ] **Step 3: Write `selection-column.tsx`**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RowData } from '@tanstack/react-table';

import { createDataTableColumnHelper } from './create-data-table';
import styles from './data-table.module.css';

const SELECTION_COLUMN_ID = 'data-table-select';

const helper = createDataTableColumnHelper();

function setIndeterminate(element: HTMLInputElement | null, indeterminate: boolean): void {
  if (element) {
    element.indeterminate = indeterminate;
  }
}

function buildSelectionColumn<TData extends RowData>(i18n?: {
  selectAllLabel?: string;
  selectRowLabel?: string;
}) {
  return helper.display({
    id: SELECTION_COLUMN_ID,
    size: 40,
    meta: { align: 'center' },
    header: ({ table }) => (
      <input
        type="checkbox"
        className={styles.selectCheckbox}
        aria-label={i18n?.selectAllLabel ?? 'Select all rows'}
        checked={table.getIsAllPageRowsSelected()}
        ref={(element) => {
          setIndeterminate(
            element,
            !table.getIsAllPageRowsSelected() && table.getIsSomeRowsSelected() === true,
          );
        }}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        className={styles.selectCheckbox}
        aria-label={`${i18n?.selectRowLabel ?? 'Select row'} ${row.index + 1}`}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  });
}

export { SELECTION_COLUMN_ID, buildSelectionColumn };
```

Note: verify `table.getIsSomeRowsSelected()` exists on `Table_RowSelection`; if not, replace the indeterminate expression with `table.getState().rowSelection` size check: `Object.keys(table.getState().rowSelection).length > 0`.

- [ ] **Step 4: Write `expander-column.tsx`**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RowData } from '@tanstack/react-table';

import { Button } from '../../basic/button/Button';
import { createDataTableColumnHelper } from './create-data-table';

const EXPANDER_COLUMN_ID = 'data-table-expander';

const helper = createDataTableColumnHelper();

function buildExpanderColumn<TData extends RowData>(i18n?: {
  expandLabel?: string;
  collapseLabel?: string;
}) {
  return helper.display({
    id: EXPANDER_COLUMN_ID,
    size: 40,
    meta: { align: 'center' },
    header: () => '',
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <Button
          type="ghost"
          size="medium"
          icon={row.getIsExpanded() ? 'ChevronDown' : 'ChevronRight'}
          aria-label={
            row.getIsExpanded()
              ? `${i18n?.collapseLabel ?? 'Collapse row'} ${row.index + 1}`
              : `${i18n?.expandLabel ?? 'Expand row'} ${row.index + 1}`
          }
          aria-expanded={row.getIsExpanded()}
          onClick={row.getToggleExpandedHandler()}
        />
      ) : null,
  });
}

export { EXPANDER_COLUMN_ID, buildExpanderColumn };
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/tests/built-in-columns.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add packages/ui-components/src/components/display/data-table/selection-column.tsx packages/ui-components/src/components/display/data-table/expander-column.tsx packages/ui-components/src/components/display/data-table/tests/built-in-columns.test.ts
git commit -m "feat(ui-components): add selection and expander built-in columns"
```

---

### Task 8: Body + state rows

**Files:**
- Create: `packages/ui-components/src/components/display/data-table/table-states.tsx`
- Create: `packages/ui-components/src/components/display/data-table/table-body.tsx`
- Test: `packages/ui-components/src/components/display/data-table/tests/table-body.browser.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../../web-components';

import type { RowData } from '@tanstack/react-table';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { describe, expect, it } from 'vitest';

import { createDataTableColumnHelper, useDataTable } from '../create-data-table';
import { buildSelectionColumn } from '../selection-column';
import { DataTableBody } from '../table-body';

type Person = { id: string; name: string; age: number };

const data: Array<Person> = [
  { id: '1', name: 'Ada Lovelace', age: 36 },
  { id: '2', name: 'Alan Turing', age: 41 },
  { id: '3', name: 'Grace Hopper', age: 85 },
];

const helper = createDataTableColumnHelper<Person>();

const columns = [
  buildSelectionColumn<Person>(),
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('age', { header: 'Age' }),
];

function BodyHarness<TData extends RowData>({
  options,
  onRowClick,
}: {
  options: Record<string, unknown>;
  onRowClick?: (row: TData) => void;
}) {
  const table = useDataTable<TData>({
    ...(options as object),
  } as never);
  return (
    <table.AppTable>
      <table className="dt-table">
        <DataTableBody onRowClick={onRowClick} />
      </table>
    </table.AppTable>
  );
}

describe('DataTableBody', () => {
  it('renders one row per data item with cell values', async () => {
    render(<BodyHarness options={{ data, columns, enableRowSelection: true }} />);
    await expect.element(page.getByRole('cell', { name: 'Ada Lovelace' })).toBeVisible();
    await expect.element(page.getByRole('cell', { name: 'Grace Hopper' })).toBeVisible();
    expect((await page.getByRole('row').all()).length).toBe(3);
  });

  it('marks selected rows via data attribute when checkbox toggles', async () => {
    render(<BodyHarness options={{ data, columns, enableRowSelection: true }} />);
    await userEvent.click(page.getByRole('checkbox', { name: 'Select row 2' }));
    const row = page.getByRole('row').nth(1);
    await expect.element(row).toHaveAttribute('data-selected', 'true');
  });

  it('calls onRowClick with the row data', async () => {
    let clicked: Person | undefined;
    render(
      <BodyHarness<Person>
        options={{ data, columns }}
        onRowClick={(row) => {
          clicked = row;
        }}
      />,
    );
    await userEvent.click(page.getByRole('cell', { name: 'Alan Turing' }));
    expect(clicked?.id).toBe('2');
  });

  it('renders the default empty state when there are no rows', async () => {
    render(<BodyHarness options={{ data: [], columns }} />);
    await expect.element(page.getByText('Empty Table')).toBeVisible();
  });

  it('renders a spinner row when loading without rows', async () => {
    render(<BodyHarness options={{ data: [], columns, isLoading: true }} />);
    await expect.element(page.getByRole('table').locator('ds-spinner')).toBeVisible();
  });
});
```

Note: `isLoading`/`emptyState` are consumed by the body from table options? NO — they are React props, not TanStack options. For the harness, pass them as TanStack options would be wrong. Instead the harness renders `<DataTableBody onRowClick={...} isLoading emptyState errorState />`. Update the harness props and last two tests accordingly:

```tsx
function BodyHarness<TData extends RowData>({
  options,
  onRowClick,
  isLoading,
  emptyState,
}: {
  options: Record<string, unknown>;
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}) {
  const table = useDataTable<TData>({ ...(options as object) } as never);
  return (
    <table.AppTable>
      <table className="dt-table">
        <DataTableBody
          onRowClick={onRowClick}
          isLoading={isLoading}
          emptyState={emptyState}
        />
      </table>
    </table.AppTable>
  );
}
```

and the tests pass `isLoading`/`emptyState` as harness props.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/tests/table-body.browser.test.tsx`
Expected: FAIL — cannot resolve `../table-body`

- [ ] **Step 3: Write `table-states.tsx`**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './data-table.module.css';

type DataTableStateRowProps = {
  colSpan: number;
  hasRows: boolean;
  isLoading?: boolean;
  emptyState?: ReactNode;
  errorState?: ReactNode;
};

const DataTableStateRow = ({
  colSpan,
  hasRows,
  isLoading,
  emptyState,
  errorState,
}: DataTableStateRowProps) => {
  const { t } = useTranslation();
  if (errorState !== undefined) {
    return (
      <tr>
        <td colSpan={colSpan} className={styles.stateCell}>
          {errorState}
        </td>
      </tr>
    );
  }
  if (!hasRows && isLoading) {
    return (
      <tr>
        <td colSpan={colSpan} className={styles.stateCell}>
          <ds-spinner />
        </td>
      </tr>
    );
  }
  if (!hasRows) {
    return (
      <tr>
        <td colSpan={colSpan} className={styles.stateCell}>
          {emptyState ?? t('label.empty_table', 'Empty Table')}
        </td>
      </tr>
    );
  }
  return null;
};

export { DataTableStateRow };
```

- [ ] **Step 4: Write `table-body.tsx`**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode, RowData } from '@tanstack/react-table';
import clsx from 'clsx';

import { useDataTableContext } from './data-table-contexts';
import styles from './data-table.module.css';
import { getStickyColumnStyle } from './sticky';
import { DataTableStateRow } from './table-states';

type DataTableBodyProps<TData extends RowData> = {
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
  emptyState?: ReactNode;
  errorState?: ReactNode;
};

const DataTableBody = <TData extends RowData,>({
  onRowClick,
  isLoading,
  emptyState,
  errorState,
}: DataTableBodyProps<TData>) => {
  const table = useDataTableContext<TData>();
  const rows = table.getRowModel().rows;
  const columnCount = table.getVisibleLeafColumns().length;

  return (
    <tbody>
      {rows.map((row) => (
        <tr
          key={row.id}
          className={clsx(styles.bodyRow, onRowClick && styles.clickable)}
          data-selected={row.getIsSelected() ? 'true' : undefined}
          data-pinned={row.getIsPinned() || undefined}
          onClick={onRowClick ? () => onRowClick(row.original) : undefined}
        >
          {row.getVisibleCells().map((cell) =>
            cell.getIsCovered?.() ? null : (
              <td
                key={cell.id}
                colSpan={cell.getColSpan?.()}
                rowSpan={cell.getRowSpan?.()}
                style={getStickyColumnStyle(cell.column)}
                data-pinned={cell.column.getIsPinned() || undefined}
                data-cell-selected={cell.getIsSelected?.() ? 'true' : undefined}
              >
                {cell.getIsPlaceholder() ? null : (
                  <table.FlexRender cell={cell} />
                )}
              </td>
            ),
          )}
        </tr>
      ))}
      <DataTableStateRow
        colSpan={columnCount}
        hasRows={rows.length > 0}
        isLoading={isLoading}
        emptyState={emptyState}
        errorState={errorState}
      />
    </tbody>
  );
};

export { DataTableBody };
```

Note: `cell.getIsCovered`, `cell.getColSpan`, `cell.getRowSpan`, `cell.getIsSelected` come from the spanning/selection features bundled in `dataTableFeatures`, so they are always present; the optional-call syntax is unnecessary — call them directly. Remove `?.` if types allow.

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/tests/table-body.browser.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add packages/ui-components/src/components/display/data-table/table-states.tsx packages/ui-components/src/components/display/data-table/table-body.tsx packages/ui-components/src/components/display/data-table/tests/table-body.browser.test.tsx
git commit -m "feat(ui-components): add data-table body with state rows"
```

---

### Task 9: Header + footer

**Files:**
- Create: `packages/ui-components/src/components/display/data-table/table-header.tsx`
- Create: `packages/ui-components/src/components/display/data-table/table-footer.tsx`
- Test: `packages/ui-components/src/components/display/data-table/tests/table-header.browser.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../../web-components';

import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { describe, expect, it } from 'vitest';

import { createDataTableColumnHelper, useDataTable } from '../create-data-table';
import { DataTableBody } from '../table-body';
import { DataTableHeader } from '../table-header';

type Person = { id: string; name: string; age: number };

const data: Array<Person> = [
  { id: '1', name: 'Ada Lovelace', age: 36 },
  { id: '2', name: 'Alan Turing', age: 41 },
  { id: '3', name: 'Grace Hopper', age: 85 },
];

const helper = createDataTableColumnHelper<Person>();

const columns = helper.columns([
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('age', { header: 'Age' }),
]);

function HeaderHarness({ options }: { options?: Record<string, unknown> }) {
  const table = useDataTable<Person>({
    data,
    columns,
    enableSorting: true,
    enableColumnResizing: true,
    ...(options as object),
  } as never);
  return (
    <table.AppTable>
      <table className="dt-table">
        <DataTableHeader />
        <DataTableBody />
      </table>
    </table.AppTable>
  );
}

describe('DataTableHeader', () => {
  it('renders column headers with sort buttons', async () => {
    render(<HeaderHarness />);
    await expect.element(page.getByRole('button', { name: /Name/ })).toBeVisible();
    await expect.element(page.getByRole('button', { name: /Age/ })).toBeVisible();
    await expect.element(page.getByRole('columnheader', { name: /Name/ })).toBeVisible();
  });

  it('sorts ascending then descending on header click and sets aria-sort', async () => {
    render(<HeaderHarness />);
    const sortButton = page.getByRole('button', { name: /Name/ });
    await userEvent.click(sortButton);
    await expect
      .element(page.getByRole('columnheader', { name: /Name/ }))
      .toHaveAttribute('aria-sort', 'ascending');
    expect(await page.getByRole('cell', { name: 'Ada Lovelace' }).all()).toHaveLength(1);
    await userEvent.click(sortButton);
    await expect
      .element(page.getByRole('columnheader', { name: /Name/ }))
      .toHaveAttribute('aria-sort', 'descending');
  });

  it('renders a resize handle for resizable columns', async () => {
    render(<HeaderHarness />);
    await expect.element(
      page.getByRole('separator', { name: 'Resize name' }),
    ).toBeVisible();
  });
});
```

Note: the resizer `aria-label` uses `header.column.id`, which for `accessor('name')` is `name`. Assert `Resize name`.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/tests/table-header.browser.test.tsx`
Expected: FAIL — cannot resolve `../table-header`

- [ ] **Step 3: Write `table-header.tsx`**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RowData } from '@tanstack/react-table';

import { ColumnResizer } from './column-resizer';
import { useDataTableContext } from './data-table-contexts';
import styles from './data-table.module.css';
import { getStickyColumnStyle } from './sticky';
import { SortIndicator } from './sort-indicator';

const DataTableHeader = () => {
  const table = useDataTableContext();

  return (
    <thead>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const sorted = header.column.getIsSorted();
            return (
              <th
                key={header.id}
                colSpan={header.colSpan}
                style={{ width: header.getSize(), ...getStickyColumnStyle(header.column) }}
                data-pinned={header.column.getIsPinned() || undefined}
                aria-sort={
                  sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
                }
              >
                {header.isPlaceholder ? null : (
                  <>
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        className={styles.sortButton}
                        onClick={header.column.getToggleSortingHandler() ?? undefined}
                      >
                        <table.FlexRender header={header} />
                        <SortIndicator direction={sorted} />
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                    {header.column.getCanResize() && <ColumnResizer header={header} />}
                  </>
                )}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
};

export { DataTableHeader };
```

- [ ] **Step 4: Write `table-footer.tsx`**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useDataTableContext } from './data-table-contexts';
import { getStickyColumnStyle } from './sticky';

const DataTableFooter = () => {
  const table = useDataTableContext();
  const hasFooters = table
    .getEnabledLeafColumns()
    .some((column) => column.columnDef.footer != null);
  if (!hasFooters) {
    return null;
  }
  return (
    <tfoot>
      {table.getFooterGroups().map((footerGroup) => (
        <tr key={footerGroup.id}>
          {footerGroup.headers.map((header) => (
            <th
              key={header.id}
              colSpan={header.colSpan}
              style={{ width: header.getSize(), ...getStickyColumnStyle(header.column) }}
              data-pinned={header.column.getIsPinned() || undefined}
            >
              {header.isPlaceholder ? null : <table.FlexRender footer={header} />}
            </th>
          ))}
        </tr>
      ))}
    </tfoot>
  );
};

export { DataTableFooter };
```

Note: `table.FlexRender footer={header}` — TanStack footers are rendered from `Header` objects; check the `FlexRenderProps` for the footer prop name (`footer?: Header<...>`). If `footer` prop does not exist, use `header={header}` instead.

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/tests/table-header.browser.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add packages/ui-components/src/components/display/data-table/table-header.tsx packages/ui-components/src/components/display/data-table/table-footer.tsx packages/ui-components/src/components/display/data-table/tests/table-header.browser.test.tsx
git commit -m "feat(ui-components): add data-table header and footer"
```

---

### Task 10: Toolbar parts

**Files:**
- Create: `packages/ui-components/src/components/display/data-table/toolbar/global-filter.tsx`
- Create: `packages/ui-components/src/components/display/data-table/toolbar/column-visibility.tsx`
- Create: `packages/ui-components/src/components/display/data-table/toolbar/pagination.tsx`
- Test: `packages/ui-components/src/components/display/data-table/tests/toolbar.browser.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../../web-components';

import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { describe, expect, it } from 'vitest';

import { createDataTableColumnHelper, useDataTable } from '../create-data-table';
import { DataTableBody } from '../table-body';
import { DataTableColumnVisibility } from '../toolbar/column-visibility';
import { DataTableGlobalFilter } from '../toolbar/global-filter';
import { DataTablePagination } from '../toolbar/pagination';

type Person = { id: string; name: string; age: number };

const data: Array<Person> = Array.from({ length: 12 }, (_, index) => ({
  id: String(index + 1),
  name: index === 0 ? 'Ada Lovelace' : `Person ${index + 1}`,
  age: 30 + index,
}));

const helper = createDataTableColumnHelper<Person>();

const columns = helper.columns([
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('age', { header: 'Age', enableHiding: true }),
]);

function ToolbarHarness() {
  const table = useDataTable<Person>({
    data,
    columns,
    enableGlobalFilter: true,
    enablePagination: true,
    enableColumnVisibility: true,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  });
  return (
    <table.AppTable>
      <div>
        <DataTableGlobalFilter />
        <DataTableColumnVisibility />
        <DataTablePagination />
      </div>
      <table className="dt-table">
        <DataTableBody />
      </table>
    </table.AppTable>
  );
}

describe('data-table toolbar parts', () => {
  it('filters rows globally while typing', async () => {
    render(<ToolbarHarness />);
    await expect.element(page.getByRole('cell', { name: 'Person 2' })).toBeVisible();
    await userEvent.fill(page.getByRole('textbox', { name: 'Search' }), 'Ada');
    await expect.element(page.getByRole('cell', { name: 'Person 2' })).toHaveCount(0);
    await expect.element(page.getByRole('cell', { name: 'Ada Lovelace' })).toBeVisible();
  });

  it('paginates with next/previous controls', async () => {
    render(<ToolbarHarness />);
    expect((await page.getByRole('row').all()).length).toBe(5);
    await userEvent.click(page.getByRole('button', { name: 'Next page' }));
    await expect.element(page.getByText('2 of 3')).toBeVisible();
    expect((await page.getByRole('row').all()).length).toBe(5);
    await userEvent.click(page.getByRole('button', { name: 'Last page' }));
    await expect.element(page.getByText('3 of 3')).toBeVisible();
    expect((await page.getByRole('row').all()).length).toBe(2);
  });

  it('toggles column visibility from the dropdown', async () => {
    render(<ToolbarHarness />);
    await expect.element(page.getByRole('columnheader', { name: 'Age' })).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Columns' }));
    await userEvent.click(page.getByText('Age'));
    await expect.element(page.getByRole('columnheader', { name: 'Age' })).toHaveCount(0);
  });
});
```

Notes:
- The global-filter `Input` must be labelable via `getByRole('textbox', { name: 'Search' })` — pass `label` (visible label). If Input's label renders non-associated text, prefer `getByPlaceholder` with the `placeholder`-less Input → then add an explicit `aria-label` support check on Input props (Container spreads HTMLAttributes, so `aria-label` works).
- Dropdown trigger is a `Button` with `aria-label="Columns"` and icon `Options`.
- The pagination info text is `"{pageIndex + 1} of {pageCount}"` (i18n key `label.of`).

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/tests/toolbar.browser.test.tsx`
Expected: FAIL — cannot resolve `../toolbar/global-filter`

- [ ] **Step 3: Write `toolbar/global-filter.tsx`**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import { Input } from '../../inputs/Input';
import { useDataTableContext } from '../data-table-contexts';
import styles from '../data-table.module.css';

type DataTableGlobalFilterProps = {
  label?: string;
};

const DataTableGlobalFilter = ({ label }: DataTableGlobalFilterProps) => {
  const table = useDataTableContext();
  const { t } = useTranslation();
  const globalFilter = table.getState().globalFilter;
  return (
    <div className={styles.globalFilter}>
      <Input
        label={label ?? t('label.search', 'Search')}
        value={typeof globalFilter === 'string' ? globalFilter : ''}
        onChange={(event) => {
          table.setGlobalFilter(event.target.value);
        }}
      />
    </div>
  );
};

export { DataTableGlobalFilter };
```

- [ ] **Step 4: Write `toolbar/column-visibility.tsx`**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import { Button } from '../../basic/button/Button';
import { Dropdown } from '../../display/Dropdown';
import type { DropdownItem } from '../../display/Dropdown';
import { useDataTableContext } from '../data-table-contexts';

const DataTableColumnVisibility = () => {
  const table = useDataTableContext();
  const { t } = useTranslation();
  const items: Array<DropdownItem> = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide())
    .map((column) => ({
      id: column.id,
      label:
        typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id,
      selected: column.getIsVisible(),
      keepOpen: true,
      onClick: () => {
        column.toggleVisibility();
      },
    }));

  return (
    <Dropdown items={items}>
      <Button
        type="ghost"
        size="medium"
        icon="Options"
        aria-label={t('label.columns', 'Columns')}
      />
    </Dropdown>
  );
};

export { DataTableColumnVisibility };
```

- [ ] **Step 5: Write `toolbar/pagination.tsx`**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import { Button } from '../../basic/button/Button';
import { Select } from '../../inputs/Select';
import { useDataTableContext } from '../data-table-contexts';
import styles from '../data-table.module.css';

const PAGE_SIZE_ITEMS = [10, 25, 50, 100].map((value) => ({
  label: String(value),
  value,
}));

const DataTablePagination = () => {
  const table = useDataTableContext();
  const { t } = useTranslation();

  return (
    <table.Subscribe selector={(state) => state.pagination}>
      {(pagination) => {
        const pageCount = Math.max(1, table.getPageCount());
        return (
          <div className={styles.toolbarGroup}>
            <Select
              items={PAGE_SIZE_ITEMS}
              background="gray5"
              defaultSelection={PAGE_SIZE_ITEMS[0]}
              showCheckbox={false}
              itemTextSize="medium"
              style={{ minWidth: '4rem' }}
              onChange={(value) => {
                table.setPageSize(Number(value ?? 10));
              }}
              aria-label={t('label.items_per_page', 'items per page')}
            />
            <span className={styles.pageSizeLabel}>{t('label.items_per_page', 'items per page')}</span>
            <Button
              type="ghost"
              size="medium"
              icon="GoFirstOutline"
              aria-label={t('label.first_page', 'First page')}
              disabled={!table.getCanPreviousPage()}
              onClick={() => {
                table.setPageIndex(0);
              }}
            />
            <Button
              type="ghost"
              size="medium"
              icon="ChevronLeft"
              aria-label={t('label.previous_page', 'Previous page')}
              disabled={!table.getCanPreviousPage()}
              onClick={() => {
                table.previousPage();
              }}
            />
            <span className={styles.paginationInfo}>
              {pagination.pageIndex + 1} {t('label.of', 'of')} {pageCount}
            </span>
            <Button
              type="ghost"
              size="medium"
              icon="ChevronRight"
              aria-label={t('label.next_page', 'Next page')}
              disabled={!table.getCanNextPage()}
              onClick={() => {
                table.nextPage();
              }}
            />
            <Button
              type="ghost"
              size="medium"
              icon="GoLastOutline"
              aria-label={t('label.last_page', 'Last page')}
              disabled={!table.getCanNextPage()}
              onClick={() => {
                table.setPageIndex(pageCount - 1);
              }}
            />
          </div>
        );
      }}
    </table.Subscribe>
  );
};

export { DataTablePagination };
```

Note: the harness in Step 1 uses `initialState.pagination.pageSize = 5`, but `PAGE_SIZE_ITEMS` starts at 10 — set the Select `defaultSelection` from `pagination.pageSize` if it matches an item, else `PAGE_SIZE_ITEMS[0]`. Keep the two in sync in the harness by using pageSize 10 and 12 data rows (2 pages: 10 + 2). Adjust the harness numbers accordingly: `pageSize: 10`, page 2 has 2 rows, pageCount 2, expectations `2 of 2`.

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/tests/toolbar.browser.test.tsx`
Expected: PASS (3 tests). Iterate on locator/label details until green; keep locators `getByRole`-based.

- [ ] **Step 7: Commit**

```bash
git add packages/ui-components/src/components/display/data-table/toolbar packages/ui-components/src/components/display/data-table/tests/toolbar.browser.test.tsx
git commit -m "feat(ui-components): add data-table toolbar parts"
```

---

### Task 11: DataTable orchestrator

**Files:**
- Create: `packages/ui-components/src/components/display/data-table/data-table.tsx`
- Test: `packages/ui-components/src/components/display/data-table/tests/data-table.browser.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../../web-components';

import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { describe, expect, it } from 'vitest';

import { DataTable } from '../data-table';
import { createDataTableColumnHelper } from '../create-data-table';
import { DataTableGlobalFilter } from '../toolbar/global-filter';
import { DataTablePagination } from '../toolbar/pagination';

const helper = createDataTableColumnHelper<Person>();

type Person = { id: string; name: string; age: number };

const data: Array<Person> = Array.from({ length: 12 }, (_, index) => ({
  id: String(index + 1),
  name: index === 0 ? 'Ada Lovelace' : `Person ${index + 1}`,
  age: 30 + index,
}));

const columns = helper.columns([
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('age', { header: 'Age' }),
]);

describe('DataTable', () => {
  it('renders headers and rows with sorting enabled by default', async () => {
    render(<DataTable data={data} columns={columns} />);
    await expect.element(page.getByRole('columnheader', { name: /Name/ })).toBeVisible();
    await expect.element(page.getByRole('cell', { name: 'Person 12' })).toBeVisible();
  });

  it('injects the selection column and reports selected rows via onSelectionChange', async () => {
    const selected: Array<Person> = [];
    render(
      <DataTable
        data={data}
        columns={columns}
        enableRowSelection
        onSelectionChange={(rows) => {
          selected.splice(0, selected.length, ...rows);
        }}
      />,
    );
    await userEvent.click(page.getByRole('checkbox', { name: 'Select row 1' }));
    expect(selected).toHaveLength(1);
    expect(selected[0]?.name).toBe('Ada Lovelace');
    await expect.element(page.getByRole('row').nth(0)).toHaveAttribute('data-selected', 'true');
  });

  it('renders the toolbar slot with working pagination', async () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        enablePagination
        initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
        toolbar={
          <>
            <DataTableGlobalFilter />
            <DataTablePagination />
          </>
        }
      />,
    );
    expect((await page.getByRole('row').all()).length).toBe(10);
    await userEvent.click(page.getByRole('button', { name: 'Next page' }));
    expect((await page.getByRole('row').all()).length).toBe(2);
  });

  it('supports expansion of sub rows via getSubRows', async () => {
    render(
      <DataTable
        data={data.slice(0, 2)}
        columns={columns}
        enableExpanding
        getSubRows={(row) =>
          row.id === '1' ? [{ id: '1-child', name: 'Child row', age: 1 }] : undefined
        }
      />,
    );
    await expect.element(page.getByRole('cell', { name: 'Child row' })).toHaveCount(0);
    await userEvent.click(page.getByRole('button', { name: 'Expand row 1' }));
    await expect.element(page.getByRole('cell', { name: 'Child row' })).toBeVisible();
  });

  it('honours controlled sorting state', async () => {
    render(
      <DataTable
        data={data.slice(0, 3)}
        columns={columns}
        state={{ sorting: [{ id: 'name', desc: true }] }}
      />,
    );
    const firstName = await page.getByRole('row').nth(0).textContent();
    expect(firstName).toContain('Person 3');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/tests/data-table.browser.test.tsx`
Expected: FAIL — cannot resolve `../data-table`

- [ ] **Step 3: Write the implementation**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { OnChangeFn, RowData, RowSelectionState } from '@tanstack/react-table';
import clsx from 'clsx';

import { buildExpanderColumn } from './expander-column';
import { useDataTable } from './create-data-table';
import styles from './data-table.module.css';
import { buildSelectionColumn } from './selection-column';
import { DataTableBody } from './table-body';
import { DataTableFooter } from './table-footer';
import { DataTableHeader } from './table-header';
import type { DataTableColumnDef, DataTableProps } from './types';

function defaultGetRowId<TData extends RowData>(row: TData, index: number): string {
  const maybeId = (row as { id?: unknown }).id;
  return maybeId != null ? String(maybeId) : String(index);
}

const DataTable = <TData extends RowData,>({
  data,
  columns,
  enableSorting,
  enableColumnFilters,
  enableGlobalFilter,
  enablePagination,
  enableRowSelection,
  enableMultiRowSelection,
  enableSubRowSelection,
  enableExpanding,
  enableGrouping,
  enableColumnPinning,
  enableRowPinning,
  enableColumnResizing,
  enableColumnOrdering,
  enableColumnVisibility,
  enableFaceting,
  enableCellSelection,
  enableCellSpanning,
  getRowId,
  getSubRows,
  onRowClick,
  onSelectionChange,
  state,
  initialState,
  onSortingChange,
  onPaginationChange,
  onRowSelectionChange,
  onGlobalFilterChange,
  onColumnFiltersChange,
  onColumnOrderChange,
  onColumnVisibilityChange,
  onColumnPinningChange,
  onRowPinningChange,
  onExpandedChange,
  onCellSelectionChange,
  manualPagination,
  manualSorting,
  manualFiltering,
  manualGrouping,
  manualExpanding,
  pageCount,
  autoResetPageIndex,
  isLoading,
  emptyState,
  errorState,
  toolbar,
  className,
  ...rest
}: DataTableProps<TData>) => {
  const builtInColumns: Array<DataTableColumnDef<TData>> = [];
  if (enableRowSelection) {
    builtInColumns.push(buildSelectionColumn<TData>());
  }
  if (enableExpanding || enableGrouping) {
    builtInColumns.push(buildExpanderColumn<TData>());
  }

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> | undefined =
    onSelectionChange || onRowSelectionChange
      ? (updater) => {
          onRowSelectionChange?.(updater);
          if (onSelectionChange) {
            const next =
              typeof updater === 'function'
                ? updater(table.getState().rowSelection)
                : updater;
            const allRows = table.getPrePaginatedRowModel().rows;
            onSelectionChange(
              allRows.filter((row) => next[row.id] === true).map((row) => row.original),
            );
          }
        }
      : undefined;

  const table = useDataTable<TData>({
    data,
    columns: [...builtInColumns, ...columns],
    getRowId: getRowId ?? defaultGetRowId,
    getSubRows,
    enableSorting,
    enableColumnFilters,
    enableGlobalFilter,
    enablePagination,
    enableRowSelection,
    enableMultiRowSelection,
    enableSubRowSelection,
    enableExpanding,
    enableGrouping,
    enableColumnPinning,
    enableRowPinning,
    enableColumnResizing,
    enableColumnOrdering,
    enableColumnVisibility,
    enableFaceting,
    enableCellSelection,
    enableCellSpanning,
    globalFilterFn: enableGlobalFilter ? 'includesString' : undefined,
    manualPagination,
    manualSorting,
    manualFiltering,
    manualGrouping,
    manualExpanding,
    pageCount,
    autoResetPageIndex,
    state,
    initialState,
    onSortingChange,
    onPaginationChange,
    onRowSelectionChange: handleRowSelectionChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
    onColumnOrderChange,
    onColumnVisibilityChange,
    onColumnPinningChange,
    onRowPinningChange,
    onExpandedChange,
    onCellSelectionChange,
  });

  return (
    <div className={clsx(styles.tableContainer, className)} {...rest}>
      <table.AppTable>
        {toolbar ? <div className={styles.toolbar}>{toolbar}</div> : null}
        <table className={styles.table}>
          <DataTableHeader />
          <DataTableBody<TData>
            onRowClick={onRowClick}
            isLoading={isLoading}
            emptyState={emptyState}
            errorState={errorState}
          />
          <DataTableFooter />
        </table>
      </table.AppTable>
    </div>
  );
};

export { DataTable };
```

Note: `handleRowSelectionChange` references `table` before its declaration — hoisting problem! Restructure: create the table FIRST with `onRowSelectionChange` referencing a stable function that reads `table` lazily via a closure over a `let` binding, OR compute the wrapper INSIDE the options object using a function declared after. Simplest correct version:

```tsx
const table = useDataTable<TData>({
  ...
  onRowSelectionChange:
    onSelectionChange || onRowSelectionChange
      ? (updater) => {
          onRowSelectionChange?.(updater);
          if (onSelectionChange) {
            const next =
              typeof updater === 'function'
                ? updater(table.getState().rowSelection)
                : updater;
            onSelectionChange(
              table
                .getPrePaginatedRowModel()
                .rows.filter((row) => next[row.id] === true)
                .map((row) => row.original),
            );
          }
        }
      : undefined,
  ...
});
```

The closure references `table` only when invoked (after creation), which is safe since the arrow function body executes later. Declare `const table = useDataTable<TData>({ ... })` with the inline updater referencing `table` — TDZ applies only at call time, and calls happen after initialization. TypeScript may complain "Block-scoped variable 'table' used before its declaration" — if so, extract via `useRef` indirection or wrap the access: `const selectionRows = (next) => ...` after `table` and pass a two-step: use `let tableRef: ReturnType<typeof useDataTable<TData>> | undefined` then `onRowSelectionChange` closure reads `tableRef` — assign `tableRef = table` after creation. Prefer whichever passes type-check cleanly.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run packages/ui-components/src/components/display/data-table/tests/data-table.browser.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/ui-components/src/components/display/data-table/data-table.tsx packages/ui-components/src/components/display/data-table/tests/data-table.browser.test.tsx
git commit -m "feat(ui-components): add DataTable orchestrator component"
```

---

### Task 12: Public exports + full verification

**Files:**
- Create: `packages/ui-components/src/components/display/data-table/index.ts`
- Modify: `packages/ui-components/src/index.ts` (add one export line)

- [ ] **Step 1: Write `index.ts`**

```ts
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export { createDataTableColumnHelper, useDataTable } from './create-data-table';
export { dataTableContexts, useDataTableContext } from './data-table-contexts';
export { dataTableFeatures, type DataTableColumnMeta, type DataTableFeatures } from './features';
export { DataTable } from './data-table';
export {
  type DataTableColumnDef,
  type DataTableProps,
  type DataTableState,
} from './types';
export { DataTableColumnVisibility } from './toolbar/column-visibility';
export { DataTableGlobalFilter } from './toolbar/global-filter';
export { DataTablePagination } from './toolbar/pagination';
```

- [ ] **Step 2: Add to `src/index.ts`** (next to the existing Table export, in the display components section):

```ts
export * from './components/display/data-table';
```

- [ ] **Step 3: Run the full package test suite**

Run: `pnpm vitest run packages/ui-components --changed` or simply `pnpm --filter @zextras/ui-components test`
Expected: all data-table tests pass, no regressions

- [ ] **Step 4: Run type-check + lint**

Run: `pnpm --filter @zextras/ui-components type-check && pnpm --filter @zextras/ui-components lint`
Expected: both clean (fix any issues found; no `eslint-disable` allowed)

- [ ] **Step 5: Run the whole workspace type-lint as a smoke check**

Run: `pnpm type-check`
Expected: exit 0

- [ ] **Step 6: Commit**

```bash
git add packages/ui-components/src/components/display/data-table/index.ts packages/ui-components/src/index.ts
git commit -m "feat(ui-components): export data-table public API"
```

---

## Self-Review Checklist (run after writing, before executing)

1. **Spec coverage**: all features bundled ✓ (Task 1), hook + ready component ✓ (Tasks 2, 11), legacy look ✓ (Task 4 CSS copies legacy tokens), composable toolbar ✓ (Task 10), built-in states + slots ✓ (Task 8 `DataTableStateRow`), exports ✓ (Task 12), tests ✓ (per-task TDD).
2. **Type consistency**: `DataTableColumnDef` used in Task 3 and Task 11; `buildSelectionColumn`/`buildExpanderColumn` signatures match Task 7 and Task 11 usage; `useDataTableContext` exported from contexts module (Task 2) and consumed in Tasks 8, 9, 10.
3. **Known implementation risks** (resolve during execution, noted inline): `getIsSomeRowsSelected` existence; FlexRender footer prop name; `table` TDZ in orchestrator; Input label association for `getByRole('textbox', { name })`; PAGE_SIZE default sync with harness.
