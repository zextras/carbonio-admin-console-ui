/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Header, RowData } from '@tanstack/react-table';
import clsx from 'clsx';

import styles from './data-table.module.css';
import type { DataTableFeatures } from './features';

const KEYBOARD_RESIZE_STEP = 8;
const MIN_COLUMN_SIZE = 40;

type ColumnResizerProps<TData extends RowData> = {
	header: Header<DataTableFeatures, TData, any>;
};

const ColumnResizer = <TData extends RowData,>({ header }: ColumnResizerProps<TData>) => {
	const resizeWithKeyboard = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
			return;
		}
		event.preventDefault();
		const delta = event.key === 'ArrowRight' ? KEYBOARD_RESIZE_STEP : -KEYBOARD_RESIZE_STEP;
		header.table.setColumnSizing((old) => ({
			...old,
			[header.column.id]: Math.max(
				MIN_COLUMN_SIZE,
				(old[header.column.id] ?? header.column.columnDef.size ?? MIN_COLUMN_SIZE) + delta
			),
		}));
	};

	return (
		<button
			type="button"
			aria-label={`Resize ${String(header.column.id)}`}
			className={clsx(styles.resizer, header.column.getIsResizing() && styles.resizerActive)}
			onMouseDown={header.getResizeHandler()}
			onTouchStart={header.getResizeHandler()}
			onKeyDown={resizeWithKeyboard}
			onClick={(event) => {
				event.stopPropagation();
			}}
		/>
	);
};

export { ColumnResizer };
