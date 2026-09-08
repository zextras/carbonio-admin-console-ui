/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type {
  ColumnDef,
  ColumnOrderState,
  ColumnVisibilityState,
  OnChangeFn,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table';
import type { ReactNode } from 'react';

import type { DataTableFeatures } from './data-table-features';

/**
 * Pure model types live in `./models/types` (canonical home). They are
 * re-exported here so the legacy orchestrator and its direct imports keep
 * compiling until they are deleted.
 */
export type {
  DataTableBulkAction,
  DataTableBulkJobState,
  DataTableBulkVariant,
  DataTableCellEditCommit,
  DataTableColumnMeta,
  DataTableDateFilterValue,
  DataTableEnumFilterValue,
  DataTableFilterChip,
  DataTableFilterDef,
  DataTableFilterOption,
  DataTableFiltersState,
  DataTableFilterValue,
  DataTableRangeFilterValue,
  DataTableRowAction,
  DataTableStatus,
} from './models/types';

import type {
  DataTableBulkAction,
  DataTableBulkJobState,
  DataTableBulkVariant,
  DataTableCellEditCommit,
  DataTableFilterDef,
  DataTableFiltersState,
  DataTableRowAction,
  DataTableStatus,
} from './models/types';

/**
 * @deprecated Moved to `table-ui-store.tsx`; kept only for the legacy
 * orchestrator, removed when the orchestrator is deleted.
 */
export type DataTableDensity = 'comfortable' | 'compact';

/**
 * @deprecated Legacy orchestrator type (carries the inline draft value).
 * New parts use `DataTableEditingTarget` from `table-ui-store.tsx`;
 * removed together with the orchestrator.
 */
export type DataTableEditingState = {
  rowId: string;
  columnId: string;
  value: string;
  error: string | null;
} | null;

export type DataTableBulkActionContext = {
  action: DataTableBulkAction;
  selectedRowIds: Array<string>;
  selectAllMatching: boolean;
  selectedCount: number;
};

export type DataTableBulkActionResult = {
  undo?: {
    message: string;
    onUndo: () => void;
  };
} | void;

/**
 * @deprecated Moved to `table-ui-store.tsx` (new shape carries an `id` so the
 * toast remounts and its timer restarts); removed with the orchestrator.
 */
export type DataTableUndoToastState = {
  message: string;
  onUndo: () => void;
} | null;

export type DataTablePeekField = {
  label: string;
  value: ReactNode;
};

export type DataTableColumnDef<TData extends RowData> = ColumnDef<
  DataTableFeatures,
  TData,
  unknown
>;

export type DataTableProps<TData extends RowData> = {
  data: Array<TData>;
  columns: Array<DataTableColumnDef<TData>>;
  getRowId: (originalRow: TData, index: number) => string;
  /** Accessible name for the table element */
  'aria-label': string;

  status?: DataTableStatus;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  errorTitle?: string;
  errorDescription?: string;
  retryLabel?: string;

  /** Defaults to true (server-side friendly). Set false for client-side sorting. */
  manualSorting?: boolean;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  enableSorting?: boolean;

  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;

  /**
   * When the current page is fully selected and more matching rows exist,
   * show a prompt to select all matching rows across pages.
   */
  enableSelectAllMatching?: boolean;
  /** Total matching rows across all pages (for banner / select-all-matching). */
  totalMatchingCount?: number;
  selectAllMatching?: boolean;
  onSelectAllMatchingChange?: (value: boolean) => void;
  selectionBannerLabel?: string;
  clearSelectionLabel?: string;
  selectAllMatchingLabel?: (count: number) => string;
  pageSelectedLabel?: (pageCount: number) => string;

  /** Bulk action buttons shown in the selection bar. */
  bulkActions?: Array<DataTableBulkAction>;
  onBulkAction?: (
    context: DataTableBulkActionContext,
  ) => DataTableBulkActionResult | Promise<DataTableBulkActionResult>;
  /**
   * A (default): hide search/filters/customize toolbar while selecting.
   * B: keep the toolbar and show the bulk bar below it.
   */
  bulkVariant?: DataTableBulkVariant;
  /** Confirm dialog title for destructive / requireConfirm bulk actions. */
  bulkConfirmTitle?: string;
  bulkConfirmLabel?: string;
  bulkConfirmCancelLabel?: string;
  bulkConfirmMessage?: (action: DataTableBulkAction, count: number) => string;

  /** Controlled async bulk job chrome (progress / partial failure). */
  bulkJob?: DataTableBulkJobState;
  onBulkJobCancel?: () => void;
  onBulkJobRetryFailed?: () => void;
  onBulkJobDismiss?: () => void;
  bulkJobCancelLabel?: string;
  bulkJobRetryFailedLabel?: string;
  bulkJobDismissLabel?: string;

  /** Pattern 17 — stale data banner above the table card. */
  stale?: boolean;
  staleMessage?: string;
  staleReloadLabel?: string;
  staleDismissLabel?: string;
  onStaleReload?: () => void;
  onStaleDismiss?: () => void;

  undoLabel?: string;

  /** Defaults to true (server-side friendly). Set false for client-side pagination. */
  manualPagination?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  /** Total rows across all pages (required for accurate page count when manual). */
  rowCount?: number;
  /** Show pagination controls only when rowCount exceeds this value. Default: 10 */
  paginationThreshold?: number;
  pageSizeOptions?: Array<number>;
  rowsPerPageLabel?: string;
  goToPageLabel?: string;

  /** Column id to pin sticky on the left (identity / primary). */
  primaryColumnId?: string;

  /** Number of skeleton rows when status is loading. Default: 5 */
  skeletonRowCount?: number;

  /** When set, rows are clickable (mouse + Enter/Space). */
  onRowClick?: (row: TData) => void;

  /** Schema for the Filters popover. Omit to hide Filters UI. */
  filterDefs?: Array<DataTableFilterDef>;
  /** Applied filters (controlled). */
  filters?: DataTableFiltersState;
  onFiltersChange?: (filters: DataTableFiltersState) => void;
  /**
   * Defaults to true (server-side friendly). When false, DataTable filters
   * rows client-side via TanStack column / global filters.
   */
  manualFiltering?: boolean;

  enableSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  /** Column ids used by client-side search when `manualFiltering` is false. */
  searchColumnIds?: Array<string>;

  filtersLabel?: string;
  applyLabel?: string;
  clearDraftLabel?: string;
  clearAllFiltersLabel?: string;
  filtersHint?: string;
  closeFiltersLabel?: string;

  /** Show Customize popover trigger in the toolbar. Default: false */
  enableCustomize?: boolean;
  density?: DataTableDensity;
  onDensityChange?: (density: DataTableDensity) => void;
  columnVisibility?: ColumnVisibilityState;
  onColumnVisibilityChange?: OnChangeFn<ColumnVisibilityState>;
  columnOrder?: ColumnOrderState;
  onColumnOrderChange?: OnChangeFn<ColumnOrderState>;
  customizeLabel?: string;
  customizeDialogLabel?: string;
  densityLabel?: string;
  comfortableLabel?: string;
  compactLabel?: string;
  columnsSectionLabel?: string;
  customizeColumnsHint?: string;
  requiredColumnLabel?: string;
  resetColumnsLabel?: string;

  editing?: DataTableEditingState;
  onEditingChange?: (editing: DataTableEditingState) => void;
  onCellEditCommit?: (commit: DataTableCellEditCommit<TData>) => void;
  editRequiredMessage?: string;
  editSaveLabel?: string;
  editCancelLabel?: string;

  onCopyCell?: (value: string, row: TData, columnId: string) => void;
  copiedAnnounceLabel?: string;

  rowActions?: Array<DataTableRowAction>;
  onRowAction?: (payload: { action: DataTableRowAction; row: TData }) => void;
  /** Accessible name for the sticky actions column header (defaults to visually empty). */
  actionsColumnLabel?: string;

  enablePeek?: boolean;
  peekRowId?: string | null;
  onPeekRowIdChange?: (rowId: string | null) => void;
  peekTitle?: (row: TData) => string;
  peekStatus?: (row: TData) => string | null | undefined;
  peekFields?: (row: TData) => Array<DataTablePeekField>;
  renderPeek?: (row: TData) => ReactNode;
  onOpenFullDetails?: (row: TData) => void;
  openFullDetailsLabel?: string;
  closePeekLabel?: string;
  peekHint?: string;
};
