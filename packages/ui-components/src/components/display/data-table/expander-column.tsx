/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RowData } from '@tanstack/react-table';

import { Button } from '../../basic/button/Button';
import { createDataTableColumnHelper } from './create-data-table';
import type { DataTableColumnDef } from './types';

const EXPANDER_COLUMN_ID = 'data-table-expander';

function buildExpanderColumn<TData extends RowData>(i18n?: {
	expandLabel?: string;
	collapseLabel?: string;
}): DataTableColumnDef<TData> {
	const helper = createDataTableColumnHelper<TData>();
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

export { buildExpanderColumn,EXPANDER_COLUMN_ID };
