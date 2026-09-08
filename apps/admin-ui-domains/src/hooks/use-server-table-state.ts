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

/**
 * Table state for server-mode (manual sorting/pagination/filtering) tables:
 * the view derives its query inputs (offset/limit/search/filters/sorting)
 * from the returned state slices and feeds the controlled slices back to
 * `DataTableRoot`.
 *
 * - Review fix #4: any query-shape change (search, filters, sorting) resets
 *   the page index AND the selection — selected ids from a previous query
 *   would silently leak into the new result set. The reset is a render-time
 *   adjustment keyed on the applied query signature (the documented
 *   derived-state pattern: no refs, no effects), so the query inputs
 *   derived from the returned state never observe a stale page index.
 * - Review fix #5a: a `totalRowCount` option clamps the returned pagination
 *   when the server total shrinks (deletions, changed result sets).
 * - Review fix #5b: a `resetKey` change resets every slice the same way.
 */
export function useServerTableState({
	resetKey,
	pageSize = 25,
	totalRowCount,
	initialSorting = [],
}: UseServerTableStateOptions = {}) {
	const [sorting, setSorting] = useState<SortingState>(initialSorting);
	const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize });
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [searchString, setSearchString] = useState('');
	const [filters, setFilters] = useState<DataTableFiltersState>({});

	// #4: in manual (server) mode any query-shape change must reset the page
	// index and the selection. The applied-signature state makes the guard
	// converge: it runs at most once per signature change.
	const querySignature = JSON.stringify([searchString, filters, sorting]);
	const [appliedQuerySignature, setAppliedQuerySignature] = useState(querySignature);
	if (appliedQuerySignature !== querySignature) {
		setAppliedQuerySignature(querySignature);
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
		setRowSelection({});
	}

	// #5b: reset everything when the reset key changes (e.g. switching
	// entity on a kept-mounted route must not keep stale state).
	const [appliedResetKey, setAppliedResetKey] = useState(resetKey);
	if (appliedResetKey !== resetKey) {
		setAppliedResetKey(resetKey);
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
		setRowSelection({});
		setSearchString('');
		setFilters({});
		setSorting(initialSorting);
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
