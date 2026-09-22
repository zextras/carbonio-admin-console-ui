/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Row, RowData } from '@tanstack/react-table';
import clsx from 'clsx';
import { useEffect } from 'react';

import type { DataTableFeatures } from './data-table-features';
import styles from './data-table.module.css';
import { useDataTableContext } from './data-table-contexts';
import { resolvePinnedLeftOffset } from './layout-constants';
import { ACTIONS_COLUMN_ID, resolveColumnLabel, SELECT_COLUMN_ID } from './models/customize-model';
import { isEditableTarget } from './models/event-target';
import { copyTextToClipboard, getCellDisplayValue, navigatePeekRowId } from './models/row-ui';
import { DataTableDecoratedCell } from './row-ui/decorated-cell';
import { ROW_MODEL_SLICES } from './table-selectors';
import { DataTableEmptyState, DataTableErrorState, DataTableSkeletonRows } from './table-states';
import {
  type DataTableEditingTarget,
  useTableUi,
  useTableUiStore,
} from './table-ui-store';
import type {
  DataTableCellEditCommit,
  DataTableColumnDef,
  DataTableColumnMeta,
  DataTableStatus,
} from './types';

const DEFAULT_SKELETON_ROWS = 5;

export type DataTableTableBodyProps<TData extends RowData> = {
  status: DataTableStatus;
  onRetry?: () => void;
  onRowClick?: (row: TData) => void;
  enablePeek?: boolean;
  skeletonRowCount?: number;
  emptyTitle: string;
  emptyDescription: string;
  errorTitle: string;
  errorDescription: string;
  retryLabel: string;
  /** User-facing columns (without the internal select/actions columns). */
  columns: Array<DataTableColumnDef<TData>>;
  /** Column id pinned sticky on the left (identity / primary column). */
  primaryColumnId?: string;
  /** Whether the leading selection column shifts the primary column offset. */
  enableRowSelection?: boolean;
  /** Resolves the accessible row label; takes precedence over the primary-column fallback. */
  getRowLabel?: (row: TData) => string;
  onCellEditCommit?: (commit: DataTableCellEditCommit<TData>) => void;
  editRequiredMessage: string;
  editSaveLabel: string;
  editCancelLabel: string;
  onCopyCell?: (value: string, row: TData, columnId: string) => void;
  copiedAnnounceLabel: string;
};

function resolveRowLabel<TData extends RowData>(
  original: TData,
  rowId: string,
  primaryColumnId: string | undefined,
): string {
  if (primaryColumnId) {
    return getCellDisplayValue((original as Record<string, unknown>)[primaryColumnId]);
  }
  return rowId;
}

function buildRowClassName(options: {
  isSelected: boolean;
  isPeeking: boolean;
  isRowInteractive: boolean;
}): string {
  return clsx(
    styles.bodyRow,
    options.isSelected && styles.bodyRowSelected,
    options.isPeeking && styles.bodyRowPeek,
    options.isRowInteractive && styles.bodyRowClickable,
  );
}

function buildCellClassName(options: {
  isSelect: boolean;
  isActions: boolean;
  isPrimary: boolean;
  pinnedStart: boolean;
  pinnedEnd: boolean;
  scrollEdgeStart: boolean;
}): string {
  return clsx(
    styles.td,
    options.isSelect && styles.tdSelect,
    options.isActions && styles.tdActions,
    options.pinnedStart && styles.pinnedLeft,
    options.pinnedEnd && styles.pinnedRight,
    options.pinnedStart && options.isPrimary && !options.scrollEdgeStart && styles.pinnedShadow,
  );
}

function buildCellStyle(options: {
  meta: DataTableColumnMeta | undefined;
  isPrimary: boolean;
  enableRowSelection: boolean;
  pinnedStart: boolean;
}): React.CSSProperties {
  return {
    width: options.meta?.width,
    textAlign: options.meta?.align,
    left: resolvePinnedLeftOffset({
      isPrimary: options.isPrimary,
      enableRowSelection: options.enableRowSelection,
      pinnedStart: options.pinnedStart,
    }),
  };
}

type EditingReconcilerProps = {
  pageRowIds: Array<string>;
};

/**
 * Clears the store's editing target once its row leaves the row model
 * (page change, filter-away): a stale target would otherwise re-open
 * that cell in edit mode — with its draft silently lost — when the row
 * re-enters the model. Rendered inside the row-model subscription, so
 * the page-row-ids prop changes identity on every row-model change
 * (same compiler-memoization defeat as the scroll-edge effect props).
 */
const EditingReconciler = ({ pageRowIds }: EditingReconcilerProps) => {
  const editing = useTableUi((s) => s.editing);
  const setEditing = useTableUi((s) => s.setEditing);
  useEffect(() => {
    if (editing !== null && !pageRowIds.includes(editing.rowId)) {
      setEditing(null);
    }
  }, [editing, pageRowIds, setEditing]);
  return null;
};

type DataTableBodyRowProps<TData extends RowData> = {
  row: Row<DataTableFeatures, TData>;
  isSelected: boolean;
  isPeeking: boolean;
  isRowInteractive: boolean;
  enableRowSelection: boolean;
  primaryColumnId?: string;
  editing: DataTableEditingTarget;
  scrollEdgeStart: boolean;
  rowLabel: string;
  editRequiredMessage: string;
  editSaveLabel: string;
  editCancelLabel: string;
  onRowActivate: (row: TData, rowId: string) => void;
  onStartEdit: (rowId: string, columnId: string) => void;
  onCommitEdit: (commit: DataTableCellEditCommit<TData>) => void;
  onCancelEdit: () => void;
  onCopy: (value: string, row: TData, columnId: string) => void;
};

const DataTableBodyRow = <TData extends RowData>({
  row,
  isSelected,
  isPeeking,
  isRowInteractive,
  enableRowSelection,
  primaryColumnId,
  editing,
  scrollEdgeStart,
  rowLabel,
  editRequiredMessage,
  editSaveLabel,
  editCancelLabel,
  onRowActivate,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onCopy,
}: DataTableBodyRowProps<TData>) => {
  const table = useDataTableContext<TData>();

  function activateRow(): void {
    onRowActivate(row.original, row.id);
  }

  function handleRowKeyDown(event: React.KeyboardEvent<HTMLTableRowElement>): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activateRow();
    }
  }

  return (
    <tr
      className={buildRowClassName({ isSelected, isPeeking, isRowInteractive })}
      data-selected={isSelected || undefined}
      tabIndex={isRowInteractive ? 0 : undefined}
      onClick={isRowInteractive ? activateRow : undefined}
      onKeyDown={isRowInteractive ? handleRowKeyDown : undefined}
    >
      {row.getVisibleCells().map((cell) => {
        const meta = cell.column.columnDef.meta as DataTableColumnMeta | undefined;
        const pinnedStart = cell.column.getIsPinned() === 'start';
        const pinnedEnd = cell.column.getIsPinned() === 'end';
        const isSelect = cell.column.id === SELECT_COLUMN_ID;
        const isActions = cell.column.id === ACTIONS_COLUMN_ID;
        const isPrimary = cell.column.id === primaryColumnId;
        const columnLabel = resolveColumnLabel(
          cell.column.columnDef as DataTableColumnDef<TData>,
          cell.column.id,
        );
        const displayValue = getCellDisplayValue(cell.getValue());
        const isEditingCell =
          editing !== null && editing.rowId === row.id && editing.columnId === cell.column.id;
        return (
          <td
            key={cell.id}
            className={buildCellClassName({
              isSelect,
              isActions,
              isPrimary,
              pinnedStart,
              pinnedEnd,
              scrollEdgeStart,
            })}
            style={buildCellStyle({
              meta,
              isPrimary,
              enableRowSelection,
              pinnedStart,
            })}
          >
            {isActions || isSelect ? (
              <table.FlexRender cell={cell} />
            ) : (
              <DataTableDecoratedCell
                displayValue={displayValue}
                columnLabel={columnLabel}
                rowLabel={rowLabel}
                editable={meta?.editable === true}
                copyable={meta?.copyable === true}
                isEditing={isEditingCell}
                editInitialValue={displayValue}
                requiredMessage={editRequiredMessage}
                saveLabel={editSaveLabel}
                cancelLabel={editCancelLabel}
                onStartEdit={() => {
                  onStartEdit(row.id, cell.column.id);
                }}
                onCommitEdit={(value) => {
                  onCommitEdit({
                    rowId: row.id,
                    columnId: cell.column.id,
                    value,
                    row: row.original,
                  });
                }}
                onCancelEdit={onCancelEdit}
                onCopy={() => {
                  onCopy(displayValue, row.original, cell.column.id);
                }}
              >
                <table.FlexRender cell={cell} />
              </DataTableDecoratedCell>
            )}
          </td>
        );
      })}
    </tr>
  );
};

export const DataTableTableBody = <TData extends RowData>({
  status,
  onRetry,
  onRowClick,
  enablePeek = false,
  skeletonRowCount = DEFAULT_SKELETON_ROWS,
  emptyTitle,
  emptyDescription,
  errorTitle,
  errorDescription,
  retryLabel,
  columns,
  primaryColumnId,
  enableRowSelection = false,
  getRowLabel,
  onCellEditCommit,
  editRequiredMessage,
  editSaveLabel,
  editCancelLabel,
  onCopyCell,
  copiedAnnounceLabel,
}: DataTableTableBodyProps<TData>) => {
  const table = useDataTableContext<TData>();
  const peekRowId = useTableUi((s) => s.peekRowId);
  const editing = useTableUi((s) => s.editing);
  const selectAllMatching = useTableUi((s) => s.selectAllMatching);
  const scrollEdge = useTableUi((s) => s.scrollEdge);
  const setPeekRowId = useTableUi((s) => s.setPeekRowId);
  const setEditing = useTableUi((s) => s.setEditing);
  const announce = useTableUi((s) => s.announce);
  const uiStore = useTableUiStore();

  const isRowInteractive = enablePeek || onRowClick !== undefined;

  useEffect(() => {
    if (!enablePeek || peekRowId === null) {
      return undefined;
    }
    function handleKeyDown(event: KeyboardEvent): void {
      // Layers above peek own the keyboard: a document-level modal
      // (confirm dialog) or an open row action menu. Bail out before
      // any peek action so Escape/arrows act only on the topmost layer.
      // Read at event time — the flags can change after this effect runs.
      if (uiStore.getState().modalOpen || uiStore.getState().rowMenuOpen) {
        return;
      }
      if (event.key === 'Escape') {
        setPeekRowId(null);
        return;
      }
      if (
        (event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
        !isEditableTarget(event.target)
      ) {
        event.preventDefault();
        // Read at event time: this listener outlives Subscribe re-renders,
        // so a page captured in the effect closure could be stale.
        const pageIds = table.getRowModel().rows.map((modelRow) => modelRow.id);
        setPeekRowId(
          navigatePeekRowId(pageIds, peekRowId, event.key === 'ArrowDown' ? 'down' : 'up'),
        );
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enablePeek, peekRowId, table, setPeekRowId, uiStore]);

  async function handleCopy(value: string, row: TData, columnId: string): Promise<void> {
    const ok = await copyTextToClipboard(value);
    if (ok) {
      announce(copiedAnnounceLabel);
    }
    onCopyCell?.(value, row, columnId);
  }

  function enqueueCopy(value: string, row: TData, columnId: string): void {
    void handleCopy(value, row, columnId);
  }

  function handleRowActivate(row: TData, rowId: string): void {
    if (enablePeek) {
      setPeekRowId(rowId);
    }
    onRowClick?.(row);
  }

  function handleStartEdit(rowId: string, columnId: string): void {
    setEditing({ rowId, columnId });
  }

  function handleCommitEdit(commit: DataTableCellEditCommit<TData>): void {
    onCellEditCommit?.(commit);
    setEditing(null);
  }

  function handleCancelEdit(): void {
    setEditing(null);
  }

  return (
    <table.Subscribe selector={ROW_MODEL_SLICES}>
      {() => {
        // Read inside the subscription callback: the part component itself
        // does not re-render on table state changes, only this callback does.
        const pageRows = table.getRowModel().rows;
        const pageRowIds = pageRows.map((modelRow) => modelRow.id);
        const stateColSpan = table.getVisibleLeafColumns().length;
        const showActions = table
          .getVisibleLeafColumns()
          .some((column) => column.id === ACTIONS_COLUMN_ID);
        return (
          <>
            <EditingReconciler pageRowIds={pageRowIds} />
            <tbody aria-busy={status === 'loading' || undefined}>
              {status === 'loading' && (
                <DataTableSkeletonRows
                  rowCount={skeletonRowCount}
                  columnCount={columns.length}
                  showSelection={enableRowSelection}
                  showActions={showActions}
                />
              )}
              {status === 'empty' && (
                <DataTableEmptyState
                  colSpan={stateColSpan}
                  title={emptyTitle}
                  description={emptyDescription}
                />
              )}
              {status === 'error' && (
                <DataTableErrorState
                  colSpan={stateColSpan}
                  title={errorTitle}
                  description={errorDescription}
                  retryLabel={retryLabel}
                  onRetry={onRetry}
                />
              )}
              {status === 'idle' &&
                pageRows.map((row) => (
                  <DataTableBodyRow
                    key={row.id}
                    row={row}
                    isSelected={row.getIsSelected() || selectAllMatching}
                    isPeeking={enablePeek && peekRowId === row.id}
                    isRowInteractive={isRowInteractive}
                    enableRowSelection={enableRowSelection}
                    primaryColumnId={primaryColumnId}
                    editing={editing}
                    scrollEdgeStart={scrollEdge.start}
                    rowLabel={
                      getRowLabel
                        ? getRowLabel(row.original)
                        : resolveRowLabel(row.original, row.id, primaryColumnId)
                    }
                    editRequiredMessage={editRequiredMessage}
                    editSaveLabel={editSaveLabel}
                    editCancelLabel={editCancelLabel}
                    onRowActivate={handleRowActivate}
                    onStartEdit={handleStartEdit}
                    onCommitEdit={handleCommitEdit}
                    onCancelEdit={handleCancelEdit}
                    onCopy={enqueueCopy}
                  />
                ))}
            </tbody>
          </>
        );
      }}
    </table.Subscribe>
  );
};
