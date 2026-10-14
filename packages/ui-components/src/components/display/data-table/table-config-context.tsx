/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RowData } from '@tanstack/react-table';
import { createContext, type ReactNode, useContext } from 'react';

import type { DataTableColumnDef } from './types';

/**
 * Resolved table configuration published by `DataTableRoot` so composed
 * parts do not need the same props repeated (and silently diverging) at
 * every level. This is static resolved config, not mutable state — it
 * deliberately does NOT live in the UI store.
 */
export type DataTableTableConfig<TData extends RowData> = {
  /** Column id pinned sticky on the left (identity / primary column). */
  primaryColumnId?: string;
  enableRowSelection: boolean;
  /** User-facing columns (without the internal select/actions columns). */
  columns: Array<DataTableColumnDef<TData>>;
  /** Resolved row label resolver (consumer prop, then primary column, then row id). */
  getRowLabel?: (row: TData) => string;
};

/**
 * React contexts cannot carry generics, so the provider value is stored
 * loosely (`any`) and re-typed by the accessor below. The cast is safe
 * because `DataTableRoot` — the only provider — is parameterized with the
 * same TData as the parts it composes.
 */
const TableConfigContext = createContext<DataTableTableConfig<any> | null>(null);

export const TableConfigProvider = <TData extends RowData>({
  value,
  children,
}: {
  value: DataTableTableConfig<TData>;
  children: ReactNode;
}) => <TableConfigContext.Provider value={value}>{children}</TableConfigContext.Provider>;

/**
 * Reads the table config published by the nearest `DataTableRoot`.
 * Returns `null` when composed outside a Root (e.g. standalone part tests),
 * so callers fall back to their own props.
 */
export function useTableConfig<TData extends RowData>(): DataTableTableConfig<TData> | null {
  return useContext(TableConfigContext);
}
