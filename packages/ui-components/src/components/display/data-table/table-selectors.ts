/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { TableState } from '@tanstack/react-table';

import type { dataTableFeatures } from './data-table-features';

type DataTableState = TableState<typeof dataTableFeatures>;

/**
 * Table state slices the rendered row model and cell layout depend on. The
 * body part must subscribe to all of them: `getRowModel()` /
 * `getVisibleCells()` recompute from pagination, sorting, filtering, column
 * order/visibility and pinning, so missing a slice leaves stale rows on
 * screen. TanStack compares the selected tuple shallowly, so returning a
 * fresh tuple per call is safe.
 */
export const ROW_MODEL_SLICES = (state: DataTableState) =>
  [
    state.rowSelection,
    state.pagination,
    state.sorting,
    state.columnFilters,
    state.globalFilter,
    state.columnOrder,
    state.columnVisibility,
    state.columnPinning,
  ] as const;

/**
 * State slices the header layout depends on: which columns render, in which
 * order, their sort state and their pinning. Row-model slices (pagination,
 * filtering, selection) do not affect the header.
 */
export const COLUMN_LAYOUT_SLICES = (state: DataTableState) =>
  [state.columnOrder, state.columnVisibility, state.sorting, state.columnPinning] as const;
