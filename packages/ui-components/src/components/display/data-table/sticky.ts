/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Column, RowData } from '@tanstack/react-table';
import type { CSSProperties } from 'react';

import type { DataTableFeatures } from './features';

function getStickyColumnStyle<TData extends RowData>(
	column: Column<DataTableFeatures, TData>,
): CSSProperties {
	const pinnedPosition = column.getIsPinned();
	if (!pinnedPosition) {
		return {};
	}
	return pinnedPosition === 'start'
		? { left: column.getStart('start') }
		: { right: column.getAfter('end') };
}

export { getStickyColumnStyle };
