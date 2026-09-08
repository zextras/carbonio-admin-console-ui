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

export type DataTableStatus = 'idle' | 'loading' | 'empty' | 'error';

export type DataTableDensity = 'comfortable' | 'compact';

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

export type DataTableEditingState = {
  rowId: string;
  columnId: string;
  value: string;
  error: string | null;
} | null;

export type DataTableRowAction = {
  id: string;
  label: string;
  danger?: boolean;
};

export type DataTableCellEditCommit<TData> = {
  rowId: string;
  columnId: string;
  value: string;
  row: TData;
};

export type DataTablePeekField = {
  label: string;
  value: ReactNode;
};

export type DataTableColumnDef<TData extends RowData> = ColumnDef<
  DataTableFeatures,
  TData,
  unknown
>;

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
};

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
