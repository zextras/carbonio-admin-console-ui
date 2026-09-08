/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type {
  ColumnOrderState,
  ColumnPinningState,
  ColumnVisibilityState,
  FilterFnOption,
  OnChangeFn,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { type ReactNode, useState } from 'react';

import { useDataTable } from './create-data-table';
import styles from './data-table.module.css';
import type { DataTableFeatures } from './data-table-features';
import {
  ACTIONS_COLUMN_ID,
  buildDefaultColumnOrder,
  resolveColumnId,
  SELECT_COLUMN_ID,
} from './models/customize-model';
import { getCellDisplayValue } from './models/row-ui';
import type { DataTableRowAction, DataTableState } from './models/types';
import { DataTableRowActions } from './row-ui/row-actions';
import { SelectionCheckbox } from './row-ui/selection-checkbox';
import { TableUiProvider, useTableUi } from './table-ui-store';
import type { DataTableColumnDef, DataTableColumnMeta } from './types';

export type DataTableRootProps<TData extends RowData> = {
  data: Array<TData>;
  columns: Array<DataTableColumnDef<TData>>;
  getRowId?: (row: TData, index: number) => string;
  enableSorting?: boolean;
  enableMultiSort?: boolean;
  enableRowSelection?: boolean;
  rowActions?: Array<DataTableRowAction>;
  onRowAction?: (payload: { action: DataTableRowAction; row: TData }) => void;
  /** Accessible name for the sticky actions column header (defaults to visually empty). */
  actionsColumnLabel?: string;
  /**
   * View-supplied row label resolver used for row/action aria-labels. Falls
   * back to the primary column display value, then to the row id.
   */
  getRowLabel?: (row: TData) => string;
  /** Defaults to true (server-side friendly). */
  manualSorting?: boolean;
  /** Defaults to true (server-side friendly). */
  manualPagination?: boolean;
  /** Defaults to true (server-side friendly); the footer counts client-side when false. */
  manualFiltering?: boolean;
  rowCount?: number;
  /** Filter function for client-side search; only applied when not manualFiltering. */
  globalFilterFn?: FilterFnOption<DataTableFeatures, TData>;
  /** Column ids used by client-side search when `manualFiltering` is false. */
  searchColumnIds?: Array<string>;
  /** Column id to pin sticky on the left (identity / primary column). */
  primaryColumnId?: string;
  state?: Partial<DataTableState>;
  initialState?: Partial<DataTableState>;
  onSortingChange?: OnChangeFn<SortingState>;
  onPaginationChange?: OnChangeFn<PaginationState>;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  onColumnVisibilityChange?: OnChangeFn<ColumnVisibilityState>;
  onColumnOrderChange?: OnChangeFn<ColumnOrderState>;
  children: ReactNode;
};

function resolvePrimaryColumnId<TData extends RowData>(
  columns: Array<DataTableColumnDef<TData>>,
  primaryColumnId: string | undefined,
): string | undefined {
  if (primaryColumnId) {
    return primaryColumnId;
  }
  const withMeta = columns.find((column) => {
    const meta = column.meta as DataTableColumnMeta | undefined;
    return meta?.primary === true;
  });
  if (withMeta) {
    return withMeta.id ?? ('accessorKey' in withMeta ? String(withMeta.accessorKey) : undefined);
  }
  const first = columns[0];
  if (!first) {
    return undefined;
  }
  return first.id ?? ('accessorKey' in first ? String(first.accessorKey) : undefined);
}

function defaultGetRowId<TData extends RowData>(row: TData, index: number): string {
  const id = (row as Record<string, unknown>).id;
  return id != null ? String(id) : String(index);
}

function buildSelectColumn<TData extends RowData>(): DataTableColumnDef<TData> {
  return {
    id: SELECT_COLUMN_ID,
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: false,
    header: ({ table }) => (
      <SelectionCheckbox
        aria-label="Select all rows on this page"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <SelectionCheckbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  };
}

type RowActionsCellProps<TData extends RowData> = {
  row: TData;
  actions: Array<DataTableRowAction>;
  getRowLabel: (row: TData) => string;
  onSelectAction: (action: DataTableRowAction, row: TData) => void;
};

/**
 * Module-level cell component (S6478): each rendered cell owns its own
 * menu-open state, replacing the orchestrator's shared `menuRowId` state.
 */
const RowActionsCell = <TData extends RowData>({
  row,
  actions,
  getRowLabel,
  onSelectAction,
}: RowActionsCellProps<TData>) => {
  const [open, setOpen] = useState(false);
  return (
    <DataTableRowActions
      rowLabel={getRowLabel(row)}
      actions={actions}
      open={open}
      onToggle={() => {
        setOpen((current) => !current);
      }}
      onClose={() => {
        setOpen(false);
      }}
      onSelect={(action) => {
        setOpen(false);
        onSelectAction(action, row);
      }}
    />
  );
};

function buildActionsColumn<TData extends RowData>(options: {
  actions: Array<DataTableRowAction>;
  headerLabel: string;
  getRowLabel: (row: TData) => string;
  onSelectAction: (action: DataTableRowAction, row: TData) => void;
}): DataTableColumnDef<TData> {
  return {
    id: ACTIONS_COLUMN_ID,
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: false,
    header: () => <span className={styles.actionsHeaderLabel}>{options.headerLabel}</span>,
    cell: ({ row }) => (
      <RowActionsCell
        row={row.original}
        actions={options.actions}
        getRowLabel={options.getRowLabel}
        onSelectAction={options.onSelectAction}
      />
    ),
  };
}

/**
 * Merges internally derived state slices with consumer-controlled ones.
 * Entries with an `undefined` value are dropped so their table-internal atoms
 * stay the uncontrolled owners (an explicit `undefined` would otherwise reset
 * the slice to `initialState` on every commit). Consumer values win.
 */
function mergeStateOptions(
  internal: Partial<DataTableState>,
  consumer: Partial<DataTableState> | undefined,
): Partial<DataTableState> {
  const merged: Record<string, unknown> = { ...internal };
  const consumerRecord = consumer as Record<string, unknown> | undefined;
  if (consumerRecord) {
    Object.keys(consumerRecord).forEach((key) => {
      if (consumerRecord[key] !== undefined) {
        merged[key] = consumerRecord[key];
      }
    });
  }
  return merged as Partial<DataTableState>;
}

/**
 * Drops keys whose value is `undefined`. The table merges options with a
 * shallow spread, so an explicitly-undefined `onXChange` would override the
 * feature-installed default (`makeStateUpdater`, which writes the table's
 * internal atoms) and break the uncontrolled backing. Omitting the key keeps
 * that default; a consumer-provided handler still wins.
 */
function stripUndefinedKeys<T extends Record<string, unknown>>(options: T): T {
  const defined: Record<string, unknown> = {};
  Object.keys(options).forEach((key) => {
    if (options[key] !== undefined) {
      defined[key] = options[key];
    }
  });
  return defined as T;
}

const DataTableRootShell = <TData extends RowData>({
  data,
  columns,
  getRowId,
  enableSorting = true,
  enableMultiSort = false,
  enableRowSelection = false,
  rowActions,
  onRowAction,
  actionsColumnLabel = '',
  getRowLabel: getRowLabelProp,
  manualSorting = true,
  manualPagination = true,
  manualFiltering = true,
  rowCount: rowCountProp,
  globalFilterFn,
  searchColumnIds,
  state: stateProp,
  initialState: initialStateProp,
  onSortingChange,
  onPaginationChange,
  onRowSelectionChange,
  onColumnVisibilityChange,
  onColumnOrderChange,
  primaryColumnId: primaryColumnIdProp,
  children,
}: DataTableRootProps<TData>) => {
  const density = useTableUi((s) => s.density);
  const peekOpen = useTableUi((s) => s.peekRowId !== null);

  const resolvedRowActions = rowActions ?? [];
  const enableRowActions = resolvedRowActions.length > 0;
  const primaryColumnId = resolvePrimaryColumnId(columns, primaryColumnIdProp);
  const resolvedGetRowId = getRowId ?? defaultGetRowId<TData>;
  const defaultColumnOrder = buildDefaultColumnOrder(
    columns.flatMap((column) => {
      const id = resolveColumnId(column);
      return id ? [id] : [];
    }),
    primaryColumnId,
    enableRowSelection,
    enableRowActions,
  );

  function resolveRowLabel(row: TData): string {
    if (getRowLabelProp) {
      return getRowLabelProp(row);
    }
    if (primaryColumnId) {
      return getCellDisplayValue((row as Record<string, unknown>)[primaryColumnId]);
    }
    return resolvedGetRowId(row, 0);
  }

  const actionsColumn = enableRowActions
    ? buildActionsColumn<TData>({
        actions: resolvedRowActions,
        headerLabel: actionsColumnLabel,
        getRowLabel: resolveRowLabel,
        onSelectAction: (action, row) => {
          onRowAction?.({ action, row });
        },
      })
    : null;

  let tableColumns: Array<DataTableColumnDef<TData>> = columns;
  if (enableRowSelection) {
    tableColumns = [buildSelectColumn<TData>(), ...tableColumns];
  }
  if (actionsColumn) {
    tableColumns = [...tableColumns, actionsColumn];
  }

  const startPinned: Array<string> = [];
  if (enableRowSelection) {
    startPinned.push(SELECT_COLUMN_ID);
  }
  if (primaryColumnId) {
    startPinned.push(primaryColumnId);
  }
  const columnPinning: ColumnPinningState = {
    start: startPinned,
    end: enableRowActions ? [ACTIONS_COLUMN_ID] : [],
  };

  const resolvedRowCount = manualFiltering ? rowCountProp ?? data.length : undefined;

  const table = useDataTable<TData, ColumnPinningState>(
    stripUndefinedKeys({
      data,
      columns: tableColumns,
      getRowId: resolvedGetRowId,
      enableSorting,
      enableMultiSort,
      enableRowSelection,
      manualSorting,
      manualPagination,
      manualFiltering,
      rowCount: resolvedRowCount,
      globalFilterFn: manualFiltering ? undefined : globalFilterFn ?? 'includesString',
      getColumnCanGlobalFilter: (column) => {
        if (column.id === SELECT_COLUMN_ID || column.id === ACTIONS_COLUMN_ID) {
          return false;
        }
        if (searchColumnIds && searchColumnIds.length > 0) {
          return searchColumnIds.includes(column.id);
        }
        return true;
      },
      state: mergeStateOptions({ columnPinning }, stateProp),
      initialState: mergeStateOptions({ columnOrder: defaultColumnOrder }, initialStateProp),
      onSortingChange,
      onPaginationChange,
      onRowSelectionChange,
      onColumnVisibilityChange,
      onColumnOrderChange,
    }),
    (state) => state.columnPinning,
  );

  return (
    <div
      className={clsx(
        styles.shell,
        density === 'compact' && styles.densityCompact,
        peekOpen && styles.shellWithPeek,
      )}
      data-density={density}
    >
      <table.AppTable>{children}</table.AppTable>
    </div>
  );
};

/**
 * Composition root of the compound DataTable: builds the table instance via
 * the pre-bound `useDataTable` hook, injects the built-in select/actions
 * columns, and renders the shell around whatever parts the consumer composes
 * as children. The table UI store (density, peek, editing, scroll edges) is
 * scoped per instance by the provider below.
 */
export const DataTableRoot = <TData extends RowData>(props: DataTableRootProps<TData>) => (
  <TableUiProvider>
    <DataTableRootShell<TData> {...props} />
  </TableUiProvider>
);
