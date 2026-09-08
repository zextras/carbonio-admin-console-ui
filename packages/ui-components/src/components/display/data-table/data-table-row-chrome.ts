/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RowData } from '@tanstack/react-table';

import { resolveColumnId, resolveColumnLabel } from './data-table-customize-model';
import type {
  DataTableColumnDef,
  DataTableColumnMeta,
  DataTableEditingState,
  DataTablePeekField,
} from './types';

export function getCellDisplayValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

export function startEditing(
  rowId: string,
  columnId: string,
  currentValue: unknown,
): DataTableEditingState {
  return {
    rowId,
    columnId,
    value: getCellDisplayValue(currentValue),
    error: null,
  };
}

export function validateEditValue(
  value: string,
  requiredMessage: string,
): string | null {
  if (value.trim() === '') {
    return requiredMessage;
  }
  return null;
}

export async function copyTextToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function navigatePeekRowId(
  pageRowIds: Array<string>,
  currentId: string | null,
  direction: 'up' | 'down',
): string | null {
  if (pageRowIds.length === 0) {
    return currentId;
  }
  if (!currentId) {
    return pageRowIds[0] ?? null;
  }
  const index = pageRowIds.indexOf(currentId);
  if (index < 0) {
    return pageRowIds[0] ?? null;
  }
  if (direction === 'down') {
    return pageRowIds[Math.min(index + 1, pageRowIds.length - 1)] ?? null;
  }
  return pageRowIds[Math.max(index - 1, 0)] ?? null;
}

export function buildDefaultPeekFields<TData extends RowData>(
  row: TData,
  columns: Array<DataTableColumnDef<TData>>,
  primaryColumnId: string | undefined,
): Array<DataTablePeekField> {
  return columns.flatMap((column) => {
    const id = resolveColumnId(column);
    if (!id) {
      return [];
    }
    const meta = column.meta as DataTableColumnMeta | undefined;
    if (meta?.excludeFromPeek || id === primaryColumnId || meta?.primary) {
      return [];
    }
    const raw =
      'accessorKey' in column && typeof column.accessorKey === 'string'
        ? (row as Record<string, unknown>)[column.accessorKey]
        : (row as Record<string, unknown>)[id];
    const value = getCellDisplayValue(raw);
    return [
      {
        label: resolveColumnLabel(column, id),
        value: value === '' ? '—' : value,
      },
    ];
  });
}
