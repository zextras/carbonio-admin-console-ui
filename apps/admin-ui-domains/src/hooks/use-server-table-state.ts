/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PaginationState, RowSelectionState, SortingState } from '@tanstack/react-table';
import type { DataTableFiltersState } from '@zextras/ui-components';
import { useState } from 'react';

export type UseServerTableStateOptions = {
  /** Change of this key resets ALL table state (e.g. a domain id on a kept-mounted route). */
  resetKey?: string;
  /** Initial page size. Default: 25 */
  pageSize?: number;
  /**
   * Server-reported total row count used to clamp the returned pagination
   * after the result set shrinks (review fix #5a). The clamp only adjusts
   * the table chrome: the clamped page's data is not refetched until the
   * next pagination or query-shape change. Only usable when the total is
   * known before this hook runs (e.g. supplied by a parent); a total
   * produced by a query that depends on this hook's pagination must be
   * clamped via `clampPaginationToRowCount` at the call site instead.
   */
  totalRowCount?: number;
  /** Sorting applied on mount and restored after a resetKey change. */
  initialSorting?: SortingState;
};

/**
 * Clamp the page index against the server total. Pure: the clamped value is
 * derived during render and never written back, so the state self-heals on
 * the next pagination change without extra renders.
 */
export function clampPaginationToRowCount(
  pagination: PaginationState,
  totalRowCount: number | undefined,
): PaginationState {
  if (totalRowCount === undefined) {
    return pagination;
  }
  const maxPageIndex = Math.max(0, Math.ceil(totalRowCount / pagination.pageSize) - 1);
  return pagination.pageIndex > maxPageIndex
    ? { ...pagination, pageIndex: maxPageIndex }
    : pagination;
}

type Updater<T> = T | ((prev: T) => T);

/**
 * Table state for server-mode (manual sorting/pagination/filtering) tables,
 * following TanStack's controlled-state pattern: the view owns the state
 * slices, derives its query inputs (offset/limit/search/filters/sorting)
 * from them and feeds them back to `DataTableRoot` via `state`/`onXxxChange`.
 *
 * - Review fix #4 (event-driven): applying a new query shape (search,
 *   filters, sorting) resets the page index AND the selection in the same
 *   batched event — selected ids from a previous query would silently leak
 *   into the new result set. TanStack cannot do this itself in manual mode
 *   (the data array is opaque to it), so the reset composes into the
 *   setters. Applying a value that is unchanged does not reset.
 * - Review fix #5a: a `totalRowCount` option clamps the returned pagination
 *   when the server total shrinks (deletions, changed result sets).
 * - Review fix #5b: a `resetKey` change resets every slice. This is a
 *   prop-driven adjustment (not an event), applied during render with a
 *   convergence guard — React's documented "adjust state when props
 *   change" pattern.
 */
export function useServerTableState({
  resetKey,
  pageSize = 25,
  totalRowCount,
  initialSorting = [],
}: UseServerTableStateOptions = {}) {
  const [sorting, setSortingState] = useState<SortingState>(initialSorting);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchString, setSearchStringState] = useState('');
  const [filters, setFiltersState] = useState<DataTableFiltersState>({});

  function resetPageAndSelection(): void {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setRowSelection({});
  }

  /**
   * Resolve an updater-or-value against the current slice and apply it.
   * Returns whether the resolved value differs from the current one, so
   * query-shape setters can reset page+selection only on real changes
   * (re-applying an identical filter draft must not drop a selection).
   */
  function applyQueryShapeValue<T>(
    current: T,
    next: Updater<T>,
    apply: (value: T) => void,
  ): boolean {
    const value = typeof next === 'function' ? (next as (prev: T) => T)(current) : next;
    apply(value);
    return JSON.stringify(value) !== JSON.stringify(current);
  }

  // #4: query-shape setters — apply, then reset page + selection atomically.
  const setSorting = (next: Updater<SortingState>): void => {
    if (applyQueryShapeValue(sorting, next, setSortingState)) {
      resetPageAndSelection();
    }
  };
  const setSearchString = (next: Updater<string>): void => {
    if (applyQueryShapeValue(searchString, next, setSearchStringState)) {
      resetPageAndSelection();
    }
  };
  const setFilters = (next: Updater<DataTableFiltersState>): void => {
    if (applyQueryShapeValue(filters, next, setFiltersState)) {
      resetPageAndSelection();
    }
  };

  // #5b: reset everything when the reset key changes (e.g. switching
  // entity on a kept-mounted route must not keep stale state).
  const [appliedResetKey, setAppliedResetKey] = useState(resetKey);
  if (appliedResetKey !== resetKey) {
    setAppliedResetKey(resetKey);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setRowSelection({});
    setSearchStringState('');
    setFiltersState({});
    setSortingState(initialSorting);
  }

  return {
    sorting,
    setSorting,
    pagination: clampPaginationToRowCount(pagination, totalRowCount),
    setPagination,
    rowSelection,
    setRowSelection,
    searchString,
    setSearchString,
    filters,
    setFilters,
  };
}
