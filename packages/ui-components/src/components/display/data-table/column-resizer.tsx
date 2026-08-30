/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Header, RowData } from '@tanstack/react-table';
import clsx from 'clsx';

import type { DataTableFeatures } from './features';
import styles from './data-table.module.css';

type ColumnResizerProps<TData extends RowData> = {
	header: Header<DataTableFeatures, TData, any>;
};

const ColumnResizer = <TData extends RowData,>({ header }: ColumnResizerProps<TData>) => (
	<span
		role="separator"
		aria-orientation="vertical"
		aria-label={`Resize ${String(header.column.id)}`}
		className={clsx(styles.resizer, header.column.getIsResizing() && styles.resizerActive)}
		onMouseDown={header.getResizeHandler()}
		onTouchStart={header.getResizeHandler()}
		onClick={(event) => {
			event.stopPropagation();
		}}
	/>
);

export { ColumnResizer };
