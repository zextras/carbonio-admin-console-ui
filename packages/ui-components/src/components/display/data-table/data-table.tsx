/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { functionalUpdate, type RowData } from '@tanstack/react-table';
import clsx from 'clsx';

import { useDataTable } from './create-data-table';
import styles from './data-table.module.css';
import { buildExpanderColumn } from './expander-column';
import { buildSelectionColumn } from './selection-column';
import { DataTableBody } from './table-body';
import { DataTableFooter } from './table-footer';
import { DataTableHeader } from './table-header';
import type { DataTableColumnDef, DataTableProps } from './types';

function defaultGetRowId<TData extends RowData>(row: TData, index: number): string {
	const maybeId = (row as { id?: unknown }).id;
	return maybeId != null ? String(maybeId) : String(index);
}

function omitUndefined<T extends Record<string, unknown>>(options: T): T {
	return Object.fromEntries(
		Object.entries(options).filter(([, value]) => value !== undefined),
	) as T;
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
	enableColumnVisibility,
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
	onGroupingChange,
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

	const table = useDataTable<TData>(
		omitUndefined({
			data,
			columns: [...builtInColumns, ...columns],
			getRowId: getRowId ?? defaultGetRowId,
			getSubRows,
			enableSorting,
			enableColumnFilters,
			enableGlobalFilter,
			enableRowSelection,
			enableMultiRowSelection,
			enableSubRowSelection,
			enableExpanding,
			enableGrouping,
			enableColumnPinning,
			enableRowPinning,
			enableCellSelection,
			enableCellSpanning,
			defaultColumn: {
				...(enableColumnResizing === false ? { enableResizing: false } : {}),
				...(enableColumnVisibility === false ? { enableHiding: false } : {}),
			},
			globalFilterFn: enableGlobalFilter ? 'includesString' : undefined,
			manualPagination: manualPagination ?? !enablePagination,
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
			onGlobalFilterChange,
			onColumnFiltersChange,
			onColumnOrderChange,
			onColumnVisibilityChange,
			onColumnPinningChange,
			onRowPinningChange,
			onExpandedChange,
			onGroupingChange,
			onCellSelectionChange,
			onRowSelectionChange:
				onRowSelectionChange || onSelectionChange
					? (updater) => {
							if (onRowSelectionChange) {
								onRowSelectionChange(updater);
							} else {
								const atom = table.options.atoms?.rowSelection ?? table.baseAtoms.rowSelection;
								atom.set((old) => functionalUpdate(updater, old));
							}
							if (onSelectionChange) {
								const next =
									typeof updater === 'function'
										? updater(table.state.rowSelection)
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
		}),
	);

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
