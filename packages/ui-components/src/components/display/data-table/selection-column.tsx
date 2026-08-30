/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RowData } from '@tanstack/react-table';

import { createDataTableColumnHelper } from './create-data-table';
import styles from './data-table.module.css';

const SELECTION_COLUMN_ID = 'data-table-select';

const helper = createDataTableColumnHelper();

function setIndeterminate(element: HTMLInputElement | null, indeterminate: boolean): void {
	if (element) {
		element.indeterminate = indeterminate;
	}
}

function buildSelectionColumn<TData extends RowData>(i18n?: {
	selectAllLabel?: string;
	selectRowLabel?: string;
}) {
	return helper.display({
		id: SELECTION_COLUMN_ID,
		size: 40,
		meta: { align: 'center' },
		header: ({ table }) => (
			<input
				type="checkbox"
				className={styles.selectCheckbox}
				aria-label={i18n?.selectAllLabel ?? 'Select all rows'}
				checked={table.getIsAllPageRowsSelected()}
				ref={(element) => {
					setIndeterminate(
						element,
						!table.getIsAllPageRowsSelected() && table.getIsSomeRowsSelected(),
					);
				}}
				onChange={table.getToggleAllPageRowsSelectedHandler()}
			/>
		),
		cell: ({ row }) => (
			<input
				type="checkbox"
				className={styles.selectCheckbox}
				aria-label={`${i18n?.selectRowLabel ?? 'Select row'} ${row.index + 1}`}
				checked={row.getIsSelected()}
				disabled={!row.getCanSelect()}
				onClick={(event) => {
					event.stopPropagation();
				}}
				onChange={row.getToggleSelectedHandler()}
			/>
		),
	});
}

export { SELECTION_COLUMN_ID, buildSelectionColumn };
