/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type {
  ColumnOrderState,
  ColumnPinningState,
  ColumnVisibilityState,
  RowData,
} from '@tanstack/react-table';
import { type ReactNode, type RefObject, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './data-table.module.css';
import { useDataTableContext } from './data-table-contexts';
import { CHROME_COLUMN_WIDTH } from './layout-constants';
import { ACTIONS_COLUMN_ID, SELECT_COLUMN_ID } from './models/customize-model';
import { DataTableTableBody } from './table-body';
import { useTableConfig } from './table-config-context';
import { DataTableTableHeader } from './table-header';
import { COLUMN_LAYOUT_SLICES, SCROLL_LAYOUT_SLICES } from './table-selectors';
import {
  type DataTableScrollEdge,
  type DataTableUiStore,
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

const DEFAULT_FLEX_COL_WIDTH = '8rem';

function formatColWidth(width: string | number): string {
  return typeof width === 'number' ? `${width}px` : width;
}

function isPercentageWidth(width: string | number): boolean {
  return typeof width === 'string' && width.trim().endsWith('%');
}

function resolveColWidth(columnId: string, meta: DataTableColumnMeta | undefined): string {
  if (columnId === SELECT_COLUMN_ID || columnId === ACTIONS_COLUMN_ID) {
    return CHROME_COLUMN_WIDTH;
  }
  if (meta?.width !== undefined && !isPercentageWidth(meta.width)) {
    return formatColWidth(meta.width);
  }
  return DEFAULT_FLEX_COL_WIDTH;
}

/** Locks select/actions (and meta.fixed) widths so Customize cannot stretch them. */
const DataTableColGroup = () => {
  const table = useDataTableContext();
  return (
    <table.Subscribe selector={COLUMN_LAYOUT_SLICES}>
      {() => (
        <colgroup>
          {table.getVisibleLeafColumns().map((column) => {
            const meta = column.columnDef.meta as DataTableColumnMeta | undefined;
            const width = resolveColWidth(column.id, meta);
            return <col key={column.id} style={{ width }} />;
          })}
        </colgroup>
      )}
    </table.Subscribe>
  );
};

export type DataTableTableProps<TData extends RowData> = {
  /** Accessible name for the table element */
  'aria-label': string;
  status?: DataTableStatus;
  onRetry?: () => void;
  onRowClick?: (row: TData) => void;
  enablePeek?: boolean;
  /** Number of skeleton rows when status is loading. Default: 5 */
  skeletonRowCount?: number;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  errorTitle?: string;
  errorDescription?: string;
  retryLabel?: string;
  /**
   * Optional override of the config published by `DataTableRoot`; when
   * omitted, the Root config flows through.
   */
  primaryColumnId?: string;
  /** Optional override of the config published by `DataTableRoot`. */
  enableRowSelection?: boolean;
  /** Optional override of the config published by `DataTableRoot`. */
  columns?: Array<DataTableColumnDef<TData>>;
  /** Optional override of the config published by `DataTableRoot`. */
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
  columnPinning: ColumnPinningState;
};

/**
 * Re-measures the scroll edges when the horizontal layout changes: hidden,
 * reordered or re-pinned columns (and density) can turn overflow on or off
 * without a scroll event ever firing. Rendered inside a `table.Subscribe` so
 * the slices arrive as props (hooks cannot live in the Subscribe render
 * prop).
 */
const ScrollEdgeEffect = ({
  scrollRef,
  columnVisibility,
  columnOrder,
  columnPinning,
}: ScrollEdgeEffectProps) => {
  const store = useTableUiStore();
  const density = useTableUi((s) => s.density);

  useEffect(() => {
    commitScrollEdge(scrollRef.current, store);
  }, [scrollRef, store, columnVisibility, columnOrder, columnPinning, density]);

  return null;
};

/**
 * The `<table>` part: horizontal scroll container (with pinned-column shadow
 * tracking) wrapping the header and body parts. Compose inside
 * `DataTableRoot`, which provides the table instance, UI store and resolved
 * table config; the config-derived props above are optional overrides.
 */
export const DataTableTable = <TData extends RowData>({
  'aria-label': ariaLabel,
  status = 'idle',
  onRetry,
  onRowClick,
  enablePeek = false,
  skeletonRowCount = DEFAULT_SKELETON_ROWS,
  emptyTitle,
  emptyDescription,
  errorTitle,
  errorDescription,
  retryLabel,
  primaryColumnId,
  enableRowSelection,
  columns,
  getRowLabel,
  onCellEditCommit,
  editRequiredMessage,
  editSaveLabel,
  editCancelLabel,
  onCopyCell,
  copiedAnnounceLabel,
}: DataTableTableProps<TData>) => {
  const table = useDataTableContext<TData>();
  const config = useTableConfig<TData>();
  const uiStore = useTableUiStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Explicit props win; otherwise the resolved config published by Root
  // flows through, so the two levels cannot silently diverge.
  const resolvedPrimaryColumnId = primaryColumnId ?? config?.primaryColumnId;
  const resolvedEnableRowSelection = enableRowSelection ?? config?.enableRowSelection ?? false;
  const resolvedColumns = columns ?? config?.columns ?? [];
  const resolvedGetRowLabel = getRowLabel ?? config?.getRowLabel;

  const labels = {
    emptyTitle: emptyTitle ?? t('data_table.empty_title', 'No results'),
    emptyDescription:
      emptyDescription ??
      t('data_table.empty_description', 'Adjust your filters or create a new item to see results.'),
    errorTitle: errorTitle ?? t('data_table.error_title', 'Something went wrong'),
    errorDescription:
      errorDescription ??
      t('data_table.error_description', 'We could not load this data. Try again.'),
    retryLabel: retryLabel ?? t('data_table.retry', 'Retry'),
    editRequiredMessage: editRequiredMessage ?? t('data_table.edit_required', 'Required'),
    editSaveLabel: editSaveLabel ?? t('data_table.edit_save', 'Save'),
    editCancelLabel: editCancelLabel ?? t('data_table.edit_cancel', 'Cancel'),
    copiedAnnounceLabel:
      copiedAnnounceLabel ?? t('data_table.copied_announce', 'Copied to clipboard'),
  };

  return (
    <div
      className={styles.scroll}
      ref={scrollRef}
      onScroll={() => {
        commitScrollEdge(scrollRef.current, uiStore);
      }}
    >
      <table.Subscribe selector={SCROLL_LAYOUT_SLICES}>
        {([columnVisibility, columnOrder, columnPinning]) => (
          <ScrollEdgeEffect
            scrollRef={scrollRef}
            columnVisibility={columnVisibility}
            columnOrder={columnOrder}
            columnPinning={columnPinning}
          />
        )}
      </table.Subscribe>
      <table className={styles.table} aria-label={ariaLabel}>
        <DataTableColGroup />
        <DataTableTableHeader
          primaryColumnId={resolvedPrimaryColumnId}
          enableRowSelection={resolvedEnableRowSelection}
        />
        <DataTableTableBody
          status={status}
          onRetry={onRetry}
          onRowClick={onRowClick}
          enablePeek={enablePeek}
          skeletonRowCount={skeletonRowCount}
          emptyTitle={labels.emptyTitle}
          emptyDescription={labels.emptyDescription}
          errorTitle={labels.errorTitle}
          errorDescription={labels.errorDescription}
          retryLabel={labels.retryLabel}
          columns={resolvedColumns}
          primaryColumnId={resolvedPrimaryColumnId}
          enableRowSelection={resolvedEnableRowSelection}
          getRowLabel={resolvedGetRowLabel}
          onCellEditCommit={onCellEditCommit}
          editRequiredMessage={labels.editRequiredMessage}
          editSaveLabel={labels.editSaveLabel}
          editCancelLabel={labels.editCancelLabel}
          onCopyCell={onCopyCell}
          copiedAnnounceLabel={labels.copiedAnnounceLabel}
        />
      </table>
    </div>
  );
};
