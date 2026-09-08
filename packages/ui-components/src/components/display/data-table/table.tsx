/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ColumnOrderState, ColumnVisibilityState, RowData } from '@tanstack/react-table';
import { type RefObject, useEffect, useRef } from 'react';

import styles from './data-table.module.css';
import { useDataTableContext } from './data-table-contexts';
import { DataTableTableBody } from './table-body';
import { DataTableTableHeader } from './table-header';
import {
  type DataTableScrollEdge,
  type DataTableUiStore,
  useTableUi,
  useTableUiStore,
} from './table-ui-store';
import type { DataTableCellEditCommit, DataTableColumnDef, DataTableStatus } from './types';

const DEFAULT_SKELETON_ROWS = 5;

export type DataTableTableProps<TData extends RowData> = {
  /** Accessible name for the table element */
  'aria-label': string;
  status?: DataTableStatus;
  onRetry?: () => void;
  onRowClick?: (row: TData) => void;
  enablePeek?: boolean;
  /** Number of skeleton rows when status is loading. Default: 5 */
  skeletonRowCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  errorTitle?: string;
  errorDescription?: string;
  retryLabel?: string;
  /** Column id pinned sticky on the left (identity / primary column). */
  primaryColumnId?: string;
  /** Whether the leading selection column shifts the primary column offset. */
  enableRowSelection?: boolean;
  /** User-facing columns (drives skeleton count and state col-span). */
  columns: Array<DataTableColumnDef<TData>>;
  /** Resolves the accessible row label; falls back to the primary column. */
  getRowLabel?: (row: TData) => string;
  onCellEditCommit?: (commit: DataTableCellEditCommit<TData>) => void;
  editRequiredMessage?: string;
  editSaveLabel?: string;
  editCancelLabel?: string;
  onCopyCell?: (value: string, row: TData, columnId: string) => void;
  copiedAnnounceLabel?: string;
};

function measureScrollEdge(el: HTMLDivElement): DataTableScrollEdge {
  return {
    start: el.scrollLeft <= 1,
    end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
  };
}

/**
 * Publishes the measured edges into the UI store, skipping no-op writes so
 * repeated scroll events do not re-render the pinned header/body cells.
 */
function commitScrollEdge(el: HTMLDivElement | null, store: DataTableUiStore): void {
  if (!el) {
    return;
  }
  const next = measureScrollEdge(el);
  const current = store.getState().scrollEdge;
  if (next.start !== current.start || next.end !== current.end) {
    store.getState().setScrollEdge(next);
  }
}

type ScrollEdgeEffectProps = {
  scrollRef: RefObject<HTMLDivElement | null>;
  columnVisibility: ColumnVisibilityState;
  columnOrder: ColumnOrderState;
};

/**
 * Re-measures the scroll edges when the horizontal layout changes: hidden or
 * reordered columns (and density) can turn overflow on or off without a
 * scroll event ever firing. Rendered inside a `table.Subscribe` so the slices
 * arrive as props (hooks cannot live in the Subscribe render prop).
 */
const ScrollEdgeEffect = ({ scrollRef, columnVisibility, columnOrder }: ScrollEdgeEffectProps) => {
  const store = useTableUiStore();
  const density = useTableUi((s) => s.density);

  useEffect(() => {
    commitScrollEdge(scrollRef.current, store);
  }, [scrollRef, store, columnVisibility, columnOrder, density]);

  return null;
};

/**
 * The `<table>` part: horizontal scroll container (with pinned-column shadow
 * tracking) wrapping the header and body parts. Compose inside
 * `DataTableRoot`, which provides the table instance and UI store.
 */
export const DataTableTable = <TData extends RowData>({
  'aria-label': ariaLabel,
  status = 'idle',
  onRetry,
  onRowClick,
  enablePeek = false,
  skeletonRowCount = DEFAULT_SKELETON_ROWS,
  emptyTitle = 'No results',
  emptyDescription = 'Adjust your filters or create a new item to see results.',
  errorTitle = 'Something went wrong',
  errorDescription = 'We could not load this data. Try again.',
  retryLabel = 'Retry',
  primaryColumnId,
  enableRowSelection = false,
  columns,
  getRowLabel,
  onCellEditCommit,
  editRequiredMessage = 'Required',
  editSaveLabel = 'Save',
  editCancelLabel = 'Cancel',
  onCopyCell,
  copiedAnnounceLabel = 'Copied to clipboard',
}: DataTableTableProps<TData>) => {
  const table = useDataTableContext<TData>();
  const uiStore = useTableUiStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={styles.scroll}
      ref={scrollRef}
      onScroll={() => {
        commitScrollEdge(scrollRef.current, uiStore);
      }}
    >
      <table.Subscribe selector={(state) => [state.columnVisibility, state.columnOrder] as const}>
        {([columnVisibility, columnOrder]) => (
          <ScrollEdgeEffect
            scrollRef={scrollRef}
            columnVisibility={columnVisibility}
            columnOrder={columnOrder}
          />
        )}
      </table.Subscribe>
      <table className={styles.table} aria-label={ariaLabel}>
        <DataTableTableHeader
          primaryColumnId={primaryColumnId}
          enableRowSelection={enableRowSelection}
        />
        <DataTableTableBody
          status={status}
          onRetry={onRetry}
          onRowClick={onRowClick}
          enablePeek={enablePeek}
          skeletonRowCount={skeletonRowCount}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          errorTitle={errorTitle}
          errorDescription={errorDescription}
          retryLabel={retryLabel}
          columns={columns}
          primaryColumnId={primaryColumnId}
          enableRowSelection={enableRowSelection}
          getRowLabel={getRowLabel}
          onCellEditCommit={onCellEditCommit}
          editRequiredMessage={editRequiredMessage}
          editSaveLabel={editSaveLabel}
          editCancelLabel={editCancelLabel}
          onCopyCell={onCopyCell}
          copiedAnnounceLabel={copiedAnnounceLabel}
        />
      </table>
    </div>
  );
};
