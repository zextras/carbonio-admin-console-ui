/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type {
  ColumnOrderState,
  ColumnVisibilityState,
  RowData,
} from '@tanstack/react-table';

import type { DataTableColumnDef, DataTableColumnMeta } from './types';

export const SELECT_COLUMN_ID = '_select';
export const ACTIONS_COLUMN_ID = '_actions';

export type CustomizeColumnItem = {
  id: string;
  label: string;
  locked: boolean;
};

function isInternalColumnId(id: string): boolean {
  return id === SELECT_COLUMN_ID || id === ACTIONS_COLUMN_ID;
}

export function resolveColumnId<TData extends RowData>(
  column: DataTableColumnDef<TData>,
): string | undefined {
  if (column.id) {
    return column.id;
  }
  if ('accessorKey' in column && column.accessorKey !== undefined) {
    return String(column.accessorKey);
  }
  return undefined;
}

export function resolveColumnLabel<TData extends RowData>(
  column: DataTableColumnDef<TData>,
  fallbackId: string,
): string {
  if (typeof column.header === 'string') {
    return column.header;
  }
  return fallbackId;
}

export function isColumnLocked<TData extends RowData>(
  column: DataTableColumnDef<TData>,
  columnId: string,
  primaryColumnId: string | undefined,
): boolean {
  const meta = column.meta as DataTableColumnMeta | undefined;
  return meta?.locked === true || columnId === primaryColumnId;
}

export function buildCustomizeColumnItems<TData extends RowData>(
  columns: Array<DataTableColumnDef<TData>>,
  primaryColumnId: string | undefined,
): Array<CustomizeColumnItem> {
  return columns.flatMap((column) => {
    const id = resolveColumnId(column);
    if (!id || isInternalColumnId(id)) {
      return [];
    }
    return [
      {
        id,
        label: resolveColumnLabel(column, id),
        locked: isColumnLocked(column, id, primaryColumnId),
      },
    ];
  });
}

export function buildDefaultColumnOrder(
  columnIds: Array<string>,
  primaryColumnId: string | undefined,
  includeSelectColumn: boolean,
  includeActionsColumn = false,
): ColumnOrderState {
  const dataOrder = normalizePrimaryFirst(columnIds, primaryColumnId);
  const withSelect = includeSelectColumn ? [SELECT_COLUMN_ID, ...dataOrder] : dataOrder;
  if (includeActionsColumn) {
    return [...withSelect, ACTIONS_COLUMN_ID];
  }
  return withSelect;
}

export function normalizePrimaryFirst(
  columnOrder: ColumnOrderState,
  primaryColumnId: string | undefined,
): ColumnOrderState {
  const hasActions = columnOrder.includes(ACTIONS_COLUMN_ID);
  const hasSelect = columnOrder[0] === SELECT_COLUMN_ID || columnOrder.includes(SELECT_COLUMN_ID);
  const dataOnly = columnOrder.filter((id) => !isInternalColumnId(id));
  let next = [...dataOnly];
  if (primaryColumnId) {
    const primaryIndex = next.indexOf(primaryColumnId);
    if (primaryIndex > 0) {
      next.splice(primaryIndex, 1);
      next.unshift(primaryColumnId);
    }
  }
  if (hasSelect) {
    next = [SELECT_COLUMN_ID, ...next];
  }
  if (hasActions) {
    next = [...next, ACTIONS_COLUMN_ID];
  }
  return next;
}

export function reorderColumnIds(
  columnOrder: ColumnOrderState,
  fromId: string,
  toId: string,
  primaryColumnId: string | undefined,
): ColumnOrderState {
  if (
    fromId === toId ||
    isInternalColumnId(fromId) ||
    isInternalColumnId(toId) ||
    fromId === primaryColumnId
  ) {
    return columnOrder;
  }
  const next = [...columnOrder];
  const fromIndex = next.indexOf(fromId);
  const toIndex = next.indexOf(toId);
  if (fromIndex < 0 || toIndex < 0) {
    return columnOrder;
  }
  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, fromId);
  return normalizePrimaryFirst(next, primaryColumnId);
}

export function moveColumnId(
  columnOrder: ColumnOrderState,
  columnId: string,
  direction: 'up' | 'down',
  primaryColumnId: string | undefined,
): ColumnOrderState {
  if (isInternalColumnId(columnId) || columnId === primaryColumnId) {
    return columnOrder;
  }
  const index = columnOrder.indexOf(columnId);
  if (index < 0) {
    return columnOrder;
  }
  const step = direction === 'up' ? -1 : 1;
  for (
    let targetIndex = index + step;
    targetIndex >= 0 && targetIndex < columnOrder.length;
    targetIndex += step
  ) {
    const targetId = columnOrder[targetIndex];
    if (!targetId || isInternalColumnId(targetId) || targetId === primaryColumnId) {
      continue;
    }
    return reorderColumnIds(columnOrder, columnId, targetId, primaryColumnId);
  }
  return columnOrder;
}

export function isCustomizeDirty(
  columnVisibility: ColumnVisibilityState,
  columnOrder: ColumnOrderState,
  defaultOrder: ColumnOrderState,
  customizeColumnIds: Array<string>,
): boolean {
  const orderDirty = columnOrder.join() !== defaultOrder.join();
  const visibilityDirty = customizeColumnIds.some((id) => columnVisibility[id] === false);
  return orderDirty || visibilityDirty;
}

export function buildResetVisibility(
  customizeColumnIds: Array<string>,
): ColumnVisibilityState {
  const next: ColumnVisibilityState = {};
  customizeColumnIds.forEach((id) => {
    next[id] = true;
  });
  return next;
}

export function isColumnVisible(
  columnVisibility: ColumnVisibilityState,
  columnId: string,
): boolean {
  return columnVisibility[columnId] !== false;
}

export function setColumnVisible(
  columnVisibility: ColumnVisibilityState,
  columnId: string,
  visible: boolean,
  locked: boolean,
): ColumnVisibilityState {
  if (locked) {
    return columnVisibility;
  }
  return { ...columnVisibility, [columnId]: visible };
}

export function orderCustomizeItems(
  items: Array<CustomizeColumnItem>,
  columnOrder: ColumnOrderState,
): Array<CustomizeColumnItem> {
  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered: Array<CustomizeColumnItem> = [];
  columnOrder.forEach((id) => {
    if (isInternalColumnId(id)) {
      return;
    }
    const item = byId.get(id);
    if (item) {
      ordered.push(item);
      byId.delete(id);
    }
  });
  byId.forEach((item) => {
    ordered.push(item);
  });
  return ordered;
}
