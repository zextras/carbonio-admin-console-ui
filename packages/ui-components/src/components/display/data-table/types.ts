/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ColumnDef, RowData } from '@tanstack/react-table';

import type { DataTableFeatures } from './data-table-features';

/**
 * Pure model types live in `./models/types` (canonical home) and are
 * re-exported here for the parts' direct imports and the public barrel.
 */
export type {
  DataTableBulkAction,
  DataTableBulkJobState,
  DataTableBulkVariant,
  DataTableCellEditCommit,
  DataTableColumnMeta,
  DataTableDateFilterValue,
  DataTableEditingState,
  DataTableEnumFilterValue,
  DataTableFilterChip,
  DataTableFilterDef,
  DataTableFilterOption,
  DataTableFiltersState,
  DataTableFilterValue,
  DataTablePeekField,
  DataTableRangeFilterValue,
  DataTableRowAction,
  DataTableStatus,
} from './models/types';

/**
 * Column definition accepted by every composable part slot (Root columns,
 * Table/config overrides). TValue is erased to the interchange format
 * TanStack's own `columnHelper.columns()` produces: `ColumnDef` is invariant
 * in TValue, so a helper-produced `ColumnDef<Features, TData, string>` does
 * not assign to a `ColumnDef<Features, TData, unknown>` slot (the render-prop
 * contexts expose the value type contravariantly). Authoring via
 * `createDataTableColumnHelper` keeps full TValue inference inside
 * `cell`/`header` callbacks regardless of this erasure.
 */
export type DataTableColumnDef<TData extends RowData> = ColumnDef<DataTableFeatures, TData, any>;
