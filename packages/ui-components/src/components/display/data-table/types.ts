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
