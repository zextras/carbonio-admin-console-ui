/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ColumnResizer } from './column-resizer';
import { useDataTableContext } from './data-table-contexts';
import styles from './data-table.module.css';
import { getStickyColumnStyle } from './sticky';
import { SortIndicator } from './sort-indicator';

const DataTableHeader = () => {
	const table = useDataTableContext();

	return (
		<table.Subscribe>
			{() => (
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								const sorted = header.column.getIsSorted();
								return (
									<th
										key={header.id}
										scope="col"
										colSpan={header.colSpan}
										style={{
											width: header.getSize(),
											...getStickyColumnStyle(header.column),
										}}
										data-pinned={header.column.getIsPinned() || undefined}
										aria-sort={
											sorted === 'asc'
												? 'ascending'
												: sorted === 'desc'
													? 'descending'
													: undefined
										}
									>
										{header.isPlaceholder ? null : (
											<>
												{header.column.getCanSort() ? (
													<button
														type="button"
														className={styles.sortButton}
														onClick={
															header.column.getToggleSortingHandler() ?? undefined
														}
													>
														<table.FlexRender header={header} />
														<SortIndicator direction={sorted} />
													</button>
												) : (
													<table.FlexRender header={header} />
												)}
												{header.column.getCanResize() && (
													<ColumnResizer header={header} />
												)}
											</>
										)}
									</th>
								);
							})}
						</tr>
					))}
				</thead>
			)}
		</table.Subscribe>
	);
};

export { DataTableHeader };
