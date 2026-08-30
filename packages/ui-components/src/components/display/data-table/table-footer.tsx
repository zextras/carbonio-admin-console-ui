/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useDataTableContext } from './data-table-contexts';
import { getStickyColumnStyle } from './sticky';

const DataTableFooter = () => {
	const table = useDataTableContext();

	return (
		<table.Subscribe selector={(state) => state}>
			{() => {
				const hasFooters = table
					.getAllLeafColumns()
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
										scope="col"
										colSpan={header.colSpan}
										style={{
											width: header.getSize(),
											...getStickyColumnStyle(header.column),
										}}
										data-pinned={header.column.getIsPinned() || undefined}
									>
										{header.isPlaceholder ? null : <table.FlexRender footer={header} />}
									</th>
								))}
							</tr>
						))}
					</tfoot>
				);
			}}
		</table.Subscribe>
	);
};

export { DataTableFooter };
