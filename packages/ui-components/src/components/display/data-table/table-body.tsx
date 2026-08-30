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

	return (
		<table.Subscribe>
			{() => {
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
									cell.getIsCovered() ? null : (
										<td
											key={cell.id}
											colSpan={cell.getColSpan()}
											rowSpan={cell.getRowSpan()}
											style={getStickyColumnStyle(cell.column)}
											data-pinned={cell.column.getIsPinned() || undefined}
											data-cell-selected={cell.getIsSelected() ? 'true' : undefined}
										>
											{cell.getIsPlaceholder() ? null : <table.FlexRender cell={cell} />}
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
			}}
		</table.Subscribe>
	);
};

export { DataTableBody };
