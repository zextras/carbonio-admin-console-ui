/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { TableState } from '@tanstack/react-table';
import type { ReactNode } from 'react';

import type { DataTableFeatures } from '../data-table-features';

export type DataTableStatus = 'idle' | 'loading' | 'empty' | 'error';

/** Full TanStack table state for the pre-bound DataTable feature set. */
export type DataTableState = TableState<DataTableFeatures>;

export type DataTableColumnMeta = {
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  /** Marks the sticky primary / identity column when `primaryColumnId` is not set */
  primary?: boolean;
  /** Cannot hide or reorder; primary column is always locked */
  locked?: boolean;
  /** Show inline edit affordance on hover */
  editable?: boolean;
  /** Show copy-to-clipboard affordance on hover */
  copyable?: boolean;
  /** Omit from default peek field list */
  excludeFromPeek?: boolean;
};

export type DataTableRowAction = {
  id: string;
  label: string;
  danger?: boolean;
};

/** A = replace toolbar when selecting; B = keep toolbar and show bulk bar below. */
export type DataTableBulkVariant = 'A' | 'B';

export type DataTableBulkAction = {
  id: string;
  label: string;
  danger?: boolean;
  /** When true (or when `danger`), show the confirm dialog before invoking `onBulkAction`. */
  requireConfirm?: boolean;
  /** Hint for consumers; reversible actions typically return an undo payload. */
  reversible?: boolean;
};

export type DataTableBulkJobState = {
  label: string;
  done: number;
  total: number;
  result: { ok: number; failed: number } | null;
} | null;

export type DataTableCellEditCommit<TData> = {
  rowId: string;
  columnId: string;
  value: string;
  row: TData;
};

/**
 * Inline-edit draft: the cell being edited, its current draft value and a
 * validation error message once a commit attempt fails.
 */
export type DataTableEditingState = {
  rowId: string;
  columnId: string;
  value: string;
  error: string | null;
} | null;

export type DataTablePeekField = {
  /** Stable key; defaults to `label` when omitted on custom fields */
  id?: string;
  label: string;
  value: ReactNode;
};

export type DataTableFilterOption = {
  label: string;
  value: string;
};

export type DataTableFilterDef =
  | {
      id: string;
      label: string;
      type: 'enum';
      options: Array<DataTableFilterOption>;
    }
  | {
      id: string;
      label: string;
      type: 'range';
      minPlaceholder?: string;
      maxPlaceholder?: string;
    }
  | {
      id: string;
      label: string;
      type: 'date';
    };

export type DataTableEnumFilterValue = Array<string>;

export type DataTableRangeFilterValue = {
  min: number | null;
  max: number | null;
};

export type DataTableDateFilterValue = {
  from: string | null;
  to: string | null;
};

export type DataTableFilterValue =
  | DataTableEnumFilterValue
  | DataTableRangeFilterValue
  | DataTableDateFilterValue;

export type DataTableFiltersState = Record<string, DataTableFilterValue>;

export type DataTableFilterChip = {
  key: string;
  filterId: string;
  label: string;
  /** Present for enum chips so a single value can be removed */
  enumValue?: string;
  /**
   * Raw bounds for range and date chips (`min` is the lower/from bound,
   * `max` the upper/to bound), so the chip component can format them
   * locale-aware; `label` remains the plain display fallback.
   */
  bounds?: { min?: number | string; max?: number | string };
};
