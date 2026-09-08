/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../web-components/ds-icon';

import {
  type ColumnDef,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnVisibilityState,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import styles from './data-table.module.css';
import { DataTableChromeCell } from './data-table-body-cell';
import {
  ACTIONS_COLUMN_ID,
  buildCustomizeColumnItems,
  buildDefaultColumnOrder,
  buildResetVisibility,
  isCustomizeDirty,
  resolveColumnId,
  resolveColumnLabel,
  SELECT_COLUMN_ID,
} from './data-table-customize-model';
import { DataTableCustomizePanel } from './data-table-customize-panel';
import { dataTableFeatures } from './data-table-features';
import { DataTableFilterChips } from './data-table-filter-chips';
import {
  buildFilterChips,
  cloneFiltersState,
  countActiveFilters,
  enrichColumnsWithFilterFns,
  removeFilterChip,
  sanitizeFilters,
  toColumnFilters,
} from './data-table-filter-model';
import { DataTableFiltersPanel } from './data-table-filters-panel';
import { DataTablePagination } from './data-table-pagination';
import { DataTablePeekPanel } from './data-table-peek-panel';
import { DataTableRowActions } from './data-table-row-actions';
import {
  buildDefaultPeekFields,
  copyTextToClipboard,
  getCellDisplayValue,
  navigatePeekRowId,
  startEditing,
  validateEditValue,
} from './data-table-row-chrome';
import {
  DataTableEmptyState,
  DataTableErrorState,
  DataTableSkeletonRows,
} from './data-table-states';
import { DataTableToolbar } from './data-table-toolbar';
import { SelectionBanner } from './selection-banner';
import { SelectionCheckbox } from './selection-checkbox';
import { SortableHeaderCell } from './sortable-header-cell';
import type {
  DataTableColumnMeta,
  DataTableDensity,
  DataTableEditingState,
  DataTableFilterChip,
  DataTableFiltersState,
  DataTableProps,
  DataTableRowAction,
} from './types';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGINATION_THRESHOLD = 10;
const DEFAULT_SKELETON_ROWS = 5;

function resolvePrimaryColumnId<TData extends RowData>(
  columns: DataTableProps<TData>['columns'],
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

function buildSelectColumn<TData extends RowData>(): ColumnDef<
  typeof dataTableFeatures,
  TData,
  unknown
> {
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

function buildActionsColumn<TData extends RowData>(options: {
  actions: Array<DataTableRowAction>;
  menuRowId: string | null;
  getRowLabel: (row: TData) => string;
  onToggleMenu: (rowId: string) => void;
  onCloseMenu: () => void;
  onSelectAction: (action: DataTableRowAction, row: TData) => void;
}): ColumnDef<typeof dataTableFeatures, TData, unknown> {
  return {
    id: ACTIONS_COLUMN_ID,
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: false,
    header: () => null,
    cell: ({ row }) => (
      <DataTableRowActions
        rowLabel={options.getRowLabel(row.original)}
        actions={options.actions}
        open={options.menuRowId === row.id}
        onToggle={() => {
          options.onToggleMenu(row.id);
        }}
        onClose={options.onCloseMenu}
        onSelect={(action) => {
          options.onSelectAction(action, row.original);
        }}
      />
    ),
  };
}

export const DataTable = <TData extends RowData>({
  data,
  columns,
  getRowId,
  'aria-label': ariaLabel,
  status = 'idle',
  onRetry,
  emptyTitle = 'No results',
  emptyDescription = 'Adjust your filters or create a new item to see results.',
  errorTitle = 'Something went wrong',
  errorDescription = 'We could not load this data. Try again.',
  retryLabel = 'Retry',
  manualSorting = true,
  sorting: controlledSorting,
  onSortingChange,
  enableSorting = true,
  enableRowSelection = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  enableSelectAllMatching = false,
  totalMatchingCount,
  selectAllMatching: controlledSelectAllMatching,
  onSelectAllMatchingChange,
  selectionBannerLabel = 'selected',
  clearSelectionLabel = '× Clear',
  selectAllMatchingLabel = (count) => `Select all ${count.toLocaleString('en')} matching`,
  pageSelectedLabel = (pageCount) => `All ${pageCount} rows on this page are selected.`,
  manualPagination = true,
  pagination: controlledPagination,
  onPaginationChange,
  rowCount: rowCountProp,
  paginationThreshold = DEFAULT_PAGINATION_THRESHOLD,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  rowsPerPageLabel = 'Rows per page',
  goToPageLabel = 'Go to page',
  primaryColumnId: primaryColumnIdProp,
  skeletonRowCount = DEFAULT_SKELETON_ROWS,
  onRowClick,
  filterDefs,
  filters: controlledFilters,
  onFiltersChange,
  manualFiltering = true,
  enableSearch = false,
  searchValue: controlledSearchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  searchLabel = 'Search',
  searchColumnIds,
  filtersLabel = 'Filters',
  applyLabel = 'Apply',
  clearDraftLabel = 'Clear',
  clearAllFiltersLabel = 'Clear all',
  filtersHint = 'AND across fields · OR within a field. Applying resets to page 1 and clears the selection.',
  closeFiltersLabel = 'Close filters',
  enableCustomize = false,
  density: controlledDensity,
  onDensityChange,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
  columnOrder: controlledColumnOrder,
  onColumnOrderChange,
  customizeLabel = 'Customize',
  customizeDialogLabel = 'Customize table',
  densityLabel = 'Density',
  comfortableLabel = 'Comfortable',
  compactLabel = 'Compact',
  columnsSectionLabel = 'Columns',
  customizeColumnsHint = 'Drag ⠿ to reorder · toggle to show/hide',
  requiredColumnLabel = 'required',
  resetColumnsLabel = 'Reset',
  editing: controlledEditing,
  onEditingChange,
  onCellEditCommit,
  editRequiredMessage = 'Required',
  editSaveLabel = 'Save',
  editCancelLabel = 'Cancel',
  onCopyCell,
  copiedAnnounceLabel = 'Copied to clipboard',
  rowActions,
  onRowAction,
  enablePeek = false,
  peekRowId: controlledPeekRowId,
  onPeekRowIdChange,
  peekTitle,
  peekStatus,
  peekFields,
  renderPeek,
  onOpenFullDetails,
  openFullDetailsLabel = 'Open full details',
  closePeekLabel = 'Close details',
  peekHint = '↑ / ↓ retarget the panel · Esc closes',
}: DataTableProps<TData>) => {
  const resolvedRowActions = rowActions ?? [];
  const enableRowActions = resolvedRowActions.length > 0;
  const primaryColumnId = resolvePrimaryColumnId(columns, primaryColumnIdProp);
  const customizeItems = buildCustomizeColumnItems(columns, primaryColumnId);
  const customizeColumnIds = customizeItems.map((item) => item.id);
  const defaultColumnOrder = buildDefaultColumnOrder(
    columns.flatMap((column) => {
      const id = resolveColumnId(column);
      return id ? [id] : [];
    }),
    primaryColumnId,
    enableRowSelection,
    enableRowActions,
  );

  const [uncontrolledSorting, setUncontrolledSorting] = useState<SortingState>([]);
  const [uncontrolledRowSelection, setUncontrolledRowSelection] = useState<RowSelectionState>({});
  const [uncontrolledPagination, setUncontrolledPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSizeOptions[0] ?? 10,
  });
  const [uncontrolledSelectAllMatching, setUncontrolledSelectAllMatching] = useState(false);
  const [uncontrolledFilters, setUncontrolledFilters] = useState<DataTableFiltersState>({});
  const [uncontrolledSearchValue, setUncontrolledSearchValue] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<DataTableFiltersState>({});
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [uncontrolledDensity, setUncontrolledDensity] = useState<DataTableDensity>('comfortable');
  const [uncontrolledColumnVisibility, setUncontrolledColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [uncontrolledColumnOrder, setUncontrolledColumnOrder] =
    useState<ColumnOrderState>(defaultColumnOrder);
  const [uncontrolledEditing, setUncontrolledEditing] = useState<DataTableEditingState>(null);
  const [uncontrolledPeekRowId, setUncontrolledPeekRowId] = useState<string | null>(null);
  const [menuRowId, setMenuRowId] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState('');

  const sorting = controlledSorting ?? uncontrolledSorting;
  const rowSelection = controlledRowSelection ?? uncontrolledRowSelection;
  const pagination = controlledPagination ?? uncontrolledPagination;
  const selectAllMatching = controlledSelectAllMatching ?? uncontrolledSelectAllMatching;
  const filters = controlledFilters ?? uncontrolledFilters;
  const searchValue = controlledSearchValue ?? uncontrolledSearchValue;
  const density = controlledDensity ?? uncontrolledDensity;
  const columnVisibility = controlledColumnVisibility ?? uncontrolledColumnVisibility;
  const columnOrder = controlledColumnOrder ?? uncontrolledColumnOrder;
  const editing = controlledEditing !== undefined ? controlledEditing : uncontrolledEditing;
  const peekRowId =
    controlledPeekRowId !== undefined ? controlledPeekRowId : uncontrolledPeekRowId;
  const resolvedFilterDefs = filterDefs ?? [];
  const showFilters = resolvedFilterDefs.length > 0;

  const setEditing = (next: DataTableEditingState): void => {
    (onEditingChange ?? setUncontrolledEditing)(next);
  };

  const setPeekRowId = (next: string | null): void => {
    (onPeekRowIdChange ?? setUncontrolledPeekRowId)(next);
  };

  const setFilters = (next: DataTableFiltersState): void => {
    (onFiltersChange ?? setUncontrolledFilters)(next);
  };

  const setSearchValue = (next: string): void => {
    (onSearchChange ?? setUncontrolledSearchValue)(next);
  };

  const setDensity = (next: DataTableDensity): void => {
    (onDensityChange ?? setUncontrolledDensity)(next);
  };

  const setColumnVisibility = onColumnVisibilityChange ?? setUncontrolledColumnVisibility;
  const setColumnOrder = onColumnOrderChange ?? setUncontrolledColumnOrder;
  const setPagination = onPaginationChange ?? setUncontrolledPagination;

  function resetPageAndSelection(): void {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    (onRowSelectionChange ?? setUncontrolledRowSelection)({});
    (onSelectAllMatchingChange ?? setUncontrolledSelectAllMatching)(false);
  }

  function openFilters(): void {
    setCustomizeOpen(false);
    setDraftFilters(cloneFiltersState(filters));
    setFiltersOpen(true);
  }

  function closeFilters(): void {
    setFiltersOpen(false);
  }

  function applyFilters(): void {
    const clean = sanitizeFilters(draftFilters, resolvedFilterDefs);
    setFilters(clean);
    setFiltersOpen(false);
    resetPageAndSelection();
  }

  function handleRemoveChip(chip: DataTableFilterChip): void {
    setFilters(removeFilterChip(filters, chip));
    resetPageAndSelection();
  }

  function handleClearAllFilters(): void {
    setFilters({});
    resetPageAndSelection();
  }

  function handleResetColumns(): void {
    setColumnVisibility(buildResetVisibility(customizeColumnIds));
    setColumnOrder(defaultColumnOrder);
  }

  const filterAwareColumns = manualFiltering
    ? columns
    : enrichColumnsWithFilterFns(columns, resolvedFilterDefs);

  function getRowLabel(row: TData): string {
    if (peekTitle) {
      return peekTitle(row);
    }
    if (primaryColumnId) {
      return getCellDisplayValue((row as Record<string, unknown>)[primaryColumnId]);
    }
    return getRowId(row, 0);
  }

  const actionsColumn = enableRowActions
    ? buildActionsColumn<TData>({
        actions: resolvedRowActions,
        menuRowId,
        getRowLabel,
        onToggleMenu: (rowId) => {
          setMenuRowId((current) => (current === rowId ? null : rowId));
        },
        onCloseMenu: () => {
          setMenuRowId(null);
        },
        onSelectAction: (action, row) => {
          setMenuRowId(null);
          onRowAction?.({ action, row });
        },
      })
    : null;

  let tableColumns = filterAwareColumns;
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

  const columnFilters = manualFiltering ? [] : toColumnFilters(filters, resolvedFilterDefs);
  const globalFilter = manualFiltering ? '' : searchValue;

  const resolvedRowCount = manualFiltering ? (rowCountProp ?? data.length) : undefined;

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns: tableColumns,
    getRowId,
    enableSorting,
    enableMultiSort: false,
    enableRowSelection,
    manualSorting,
    manualPagination,
    manualFiltering,
    rowCount: resolvedRowCount,
    globalFilterFn: 'includesString',
    getColumnCanGlobalFilter: (column) => {
      if (column.id === SELECT_COLUMN_ID || column.id === ACTIONS_COLUMN_ID) {
        return false;
      }
      if (searchColumnIds && searchColumnIds.length > 0) {
        return searchColumnIds.includes(column.id);
      }
      return true;
    },
    state: {
      sorting,
      rowSelection,
      pagination,
      columnPinning,
      columnFilters,
      globalFilter,
      columnVisibility,
      columnOrder,
    },
    onSortingChange: onSortingChange ?? setUncontrolledSorting,
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater;
      (onRowSelectionChange ?? setUncontrolledRowSelection)(next);
      if (selectAllMatching) {
        (onSelectAllMatchingChange ?? setUncontrolledSelectAllMatching)(false);
      }
    },
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
  });

  const pageRows = table.getRowModel().rows;
  const pageRowCount = pageRows.length;
  const filteredRowCount = manualFiltering
    ? (rowCountProp ?? data.length)
    : table.getFilteredRowModel().rows.length;
  const selectedCount = Object.keys(rowSelection).filter((id) => rowSelection[id]).length;
  const bannerCount = selectAllMatching
    ? (totalMatchingCount ?? filteredRowCount)
    : selectedCount;
  const showSelectionBanner = enableRowSelection && bannerCount > 0;
  const showSelectAllMatchingPrompt =
    enableRowSelection &&
    enableSelectAllMatching &&
    !selectAllMatching &&
    table.getIsAllPageRowsSelected() &&
    (totalMatchingCount ?? filteredRowCount) > pageRowCount &&
    pageRowCount > 0;

  const showPagination = filteredRowCount > paginationThreshold;
  const pageCount = Math.max(1, table.getPageCount());
  const visibleColumnCount = table.getVisibleLeafColumns().length;
  const stateColSpan = visibleColumnCount;
  const activeFilterCount = countActiveFilters(filters);
  const filterChips = buildFilterChips(filters, resolvedFilterDefs);
  const showFilterChips = filterChips.length > 0 && !showSelectionBanner;
  const showToolbar = enableSearch || showFilters || enableCustomize;
  const showReset = isCustomizeDirty(
    columnVisibility,
    columnOrder,
    defaultColumnOrder,
    customizeColumnIds,
  );

  useEffect(() => {
    if (!customizeOpen) {
      return undefined;
    }
    function handleDocumentMouseDown(event: MouseEvent): void {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      const panel = document.getElementById('data-table-customize-panel');
      const trigger = document.querySelector('[aria-controls="data-table-customize-panel"]');
      if (panel?.contains(target) || trigger?.contains(target)) {
        return;
      }
      setCustomizeOpen(false);
    }
    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, [customizeOpen]);

  useEffect(() => {
    if (!enablePeek || peekRowId === null) {
      return undefined;
    }
    function handleKeyDown(event: KeyboardEvent): void {
      const updatePeek = onPeekRowIdChange ?? setUncontrolledPeekRowId;
      if (event.key === 'Escape') {
        updatePeek(null);
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const pageIds = pageRows.map((row) => row.id);
        updatePeek(
          navigatePeekRowId(pageIds, peekRowId, event.key === 'ArrowDown' ? 'down' : 'up'),
        );
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enablePeek, peekRowId, pageRows, onPeekRowIdChange]);

  function clearSelection(): void {
    table.resetRowSelection();
    (onSelectAllMatchingChange ?? setUncontrolledSelectAllMatching)(false);
  }

  function handleSelectAllMatching(): void {
    (onSelectAllMatchingChange ?? setUncontrolledSelectAllMatching)(true);
  }

  function announce(message: string): void {
    setLiveMessage(message);
  }

  function commitEditing(row: TData): void {
    if (!editing) {
      return;
    }
    const error = validateEditValue(editing.value, editRequiredMessage);
    if (error) {
      setEditing({ ...editing, error });
      return;
    }
    onCellEditCommit?.({
      rowId: editing.rowId,
      columnId: editing.columnId,
      value: editing.value,
      row,
    });
    setEditing(null);
  }

  async function handleCopy(value: string, row: TData, columnId: string): Promise<void> {
    const ok = await copyTextToClipboard(value);
    if (ok) {
      announce(copiedAnnounceLabel);
    }
    onCopyCell?.(value, row, columnId);
  }

  const peekRow =
    enablePeek && peekRowId !== null
      ? (pageRows.find((row) => row.id === peekRowId)?.original ??
        data.find((row, index) => getRowId(row, index) === peekRowId) ??
        null)
      : null;
  const isRowInteractive = enablePeek || onRowClick !== undefined;

  return (
    <div
      className={clsx(
        styles.shell,
        density === 'compact' && styles.densityCompact,
        enablePeek && peekRow && styles.shellWithPeek,
      )}
      data-density={density}
    >
      <div className={styles.tableMain}>
      <div className={styles.liveRegion} aria-live="polite">
        {liveMessage}
      </div>
      {showToolbar && (
        <div className={styles.toolbarWrap}>
          <DataTableToolbar
            enableSearch={enableSearch}
            searchValue={searchValue}
            onSearchChange={(value) => {
              setSearchValue(value);
              if (!manualFiltering) {
                resetPageAndSelection();
              }
            }}
            searchPlaceholder={searchPlaceholder}
            searchLabel={searchLabel}
            showFilters={showFilters}
            filtersOpen={filtersOpen}
            filtersLabel={filtersLabel}
            activeFilterCount={activeFilterCount}
            onToggleFilters={() => {
              if (filtersOpen) {
                closeFilters();
              } else {
                openFilters();
              }
            }}
            enableCustomize={enableCustomize}
            customizeOpen={customizeOpen}
            customizeLabel={customizeLabel}
            onToggleCustomize={() => {
              if (customizeOpen) {
                setCustomizeOpen(false);
              } else {
                setFiltersOpen(false);
                setCustomizeOpen(true);
              }
            }}
          />
          {filtersOpen && (
            <DataTableFiltersPanel
              filterDefs={resolvedFilterDefs}
              draft={draftFilters}
              onDraftChange={setDraftFilters}
              onClose={closeFilters}
              onClearDraft={() => {
                setDraftFilters({});
              }}
              onApply={applyFilters}
              filtersLabel={filtersLabel}
              closeFiltersLabel={closeFiltersLabel}
              clearDraftLabel={clearDraftLabel}
              applyLabel={applyLabel}
              filtersHint={filtersHint}
            />
          )}
          {customizeOpen && (
            <DataTableCustomizePanel
              density={density}
              onDensityChange={setDensity}
              columnItems={customizeItems}
              columnOrder={columnOrder}
              onColumnOrderChange={(next) => {
                setColumnOrder(next);
              }}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={(next) => {
                setColumnVisibility(next);
              }}
              primaryColumnId={primaryColumnId}
              showReset={showReset}
              onReset={handleResetColumns}
              dialogLabel={customizeDialogLabel}
              densityLabel={densityLabel}
              comfortableLabel={comfortableLabel}
              compactLabel={compactLabel}
              columnsSectionLabel={columnsSectionLabel}
              columnsHint={customizeColumnsHint}
              requiredColumnLabel={requiredColumnLabel}
              resetLabel={resetColumnsLabel}
            />
          )}
        </div>
      )}
      {showFilterChips && (
        <DataTableFilterChips
          chips={filterChips}
          clearAllLabel={clearAllFiltersLabel}
          onRemoveChip={handleRemoveChip}
          onClearAll={handleClearAllFilters}
        />
      )}
      {showSelectionBanner && (
        <SelectionBanner
          count={bannerCount}
          selectedLabel={selectionBannerLabel}
          clearLabel={clearSelectionLabel}
          onClear={clearSelection}
        />
      )}
      {showSelectAllMatchingPrompt && (
        <div role="status" className={styles.selectAllMatching}>
          <span>{pageSelectedLabel(pageRowCount)}</span>
          <button
            type="button"
            className={styles.selectAllMatchingButton}
            onClick={handleSelectAllMatching}
          >
            {selectAllMatchingLabel(totalMatchingCount ?? filteredRowCount)}
          </button>
        </div>
      )}
      <div className={styles.scroll}>
        <table className={styles.table} aria-label={ariaLabel}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as DataTableColumnMeta | undefined;
                  const pinnedStart = header.column.getIsPinned() === 'start';
                  const pinnedEnd = header.column.getIsPinned() === 'end';
                  const isSelect = header.column.id === SELECT_COLUMN_ID;
                  const isActions = header.column.id === ACTIONS_COLUMN_ID;
                  const isPrimary = header.column.id === primaryColumnId;
                  return (
                    <th
                      key={header.id}
                      className={clsx(
                        styles.th,
                        isSelect && styles.thSelect,
                        isActions && styles.thActions,
                        pinnedStart && styles.pinnedLeft,
                        pinnedEnd && styles.pinnedRight,
                        pinnedStart && isPrimary && enableRowSelection && styles.pinnedShadow,
                      )}
                      style={{
                        width: meta?.width,
                        textAlign: meta?.align,
                        left: isPrimary && enableRowSelection ? '3.25rem' : pinnedStart ? 0 : undefined,
                      }}
                      aria-sort={
                        header.column.getCanSort()
                          ? header.column.getIsSorted() === 'asc'
                            ? 'ascending'
                            : header.column.getIsSorted() === 'desc'
                              ? 'descending'
                              : 'none'
                          : undefined
                      }
                    >
                      {header.isPlaceholder || isActions ? null : isSelect ? (
                        <table.FlexRender header={header} />
                      ) : (
                        <SortableHeaderCell
                          label={<table.FlexRender header={header} />}
                          canSort={header.column.getCanSort()}
                          sorted={header.column.getIsSorted()}
                          onToggleSort={header.column.getToggleSortingHandler()}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {status === 'loading' && (
              <DataTableSkeletonRows
                rowCount={skeletonRowCount}
                columnCount={columns.length}
                showSelection={enableRowSelection}
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
              pageRows.map((row) => {
                const isSelected = row.getIsSelected() || selectAllMatching;
                const isPeeking = enablePeek && peekRowId === row.id;
                return (
                  <tr
                    key={row.id}
                    className={clsx(
                      styles.bodyRow,
                      isSelected && styles.bodyRowSelected,
                      isPeeking && styles.bodyRowPeek,
                      isRowInteractive && styles.bodyRowClickable,
                    )}
                    data-selected={isSelected || undefined}
                    tabIndex={isRowInteractive ? 0 : undefined}
                    onClick={
                      isRowInteractive
                        ? (): void => {
                            if (enablePeek) {
                              setPeekRowId(row.id);
                            }
                            onRowClick?.(row.original);
                          }
                        : undefined
                    }
                    onKeyDown={
                      isRowInteractive
                        ? (e): void => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              if (enablePeek) {
                                setPeekRowId(row.id);
                              }
                              onRowClick?.(row.original);
                            }
                          }
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as DataTableColumnMeta | undefined;
                      const pinnedStart = cell.column.getIsPinned() === 'start';
                      const pinnedEnd = cell.column.getIsPinned() === 'end';
                      const isSelect = cell.column.id === SELECT_COLUMN_ID;
                      const isActions = cell.column.id === ACTIONS_COLUMN_ID;
                      const isPrimary = cell.column.id === primaryColumnId;
                      const isActionsMenuOpen = isActions && menuRowId === row.id;
                      const columnLabel = resolveColumnLabel(
                        cell.column.columnDef as (typeof columns)[number],
                        cell.column.id,
                      );
                      const displayValue = getCellDisplayValue(cell.getValue());
                      const isEditingCell =
                        editing?.rowId === row.id && editing.columnId === cell.column.id;
                      return (
                        <td
                          key={cell.id}
                          className={clsx(
                            styles.td,
                            isSelect && styles.tdSelect,
                            isActions && styles.tdActions,
                            isActionsMenuOpen && styles.tdActionsMenuOpen,
                            pinnedStart && styles.pinnedLeft,
                            pinnedEnd && styles.pinnedRight,
                            pinnedStart && isPrimary && enableRowSelection && styles.pinnedShadow,
                          )}
                          style={{
                            width: meta?.width,
                            textAlign: meta?.align,
                            left:
                              isPrimary && enableRowSelection
                                ? '3.25rem'
                                : pinnedStart
                                  ? 0
                                  : undefined,
                          }}
                        >
                          {isActions || isSelect ? (
                            <table.FlexRender cell={cell} />
                          ) : (
                            <DataTableChromeCell
                              displayValue={displayValue}
                              columnLabel={columnLabel}
                              rowLabel={getRowLabel(row.original)}
                              editable={meta?.editable === true}
                              copyable={meta?.copyable === true}
                              editing={editing}
                              isEditing={isEditingCell}
                              saveLabel={editSaveLabel}
                              cancelLabel={editCancelLabel}
                              onStartEdit={() => {
                                setEditing(startEditing(row.id, cell.column.id, cell.getValue()));
                              }}
                              onEditingValueChange={(value) => {
                                if (!editing) {
                                  return;
                                }
                                setEditing({ ...editing, value, error: null });
                              }}
                              onSaveEdit={() => {
                                commitEditing(row.original);
                              }}
                              onCancelEdit={() => {
                                setEditing(null);
                              }}
                              onCopy={() => {
                                void handleCopy(displayValue, row.original, cell.column.id);
                              }}
                            >
                              <table.FlexRender cell={cell} />
                            </DataTableChromeCell>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {status !== 'loading' &&
        status !== 'error' &&
        (showPagination ? (
          <DataTablePagination
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            rowCount={filteredRowCount}
            pageCount={pageCount}
            pageSizeOptions={pageSizeOptions}
            rowsPerPageLabel={rowsPerPageLabel}
            goToPageLabel={goToPageLabel}
            canPreviousPage={table.getCanPreviousPage()}
            canNextPage={table.getCanNextPage()}
            onPreviousPage={() => {
              table.previousPage();
            }}
            onNextPage={() => {
              table.nextPage();
            }}
            onSetPageIndex={(pageIndex) => {
              table.setPageIndex(pageIndex);
            }}
            onSetPageSize={(pageSize) => {
              table.setPageSize(pageSize);
            }}
          />
        ) : (
          <div className={styles.footer}>
            <span className={styles.footerMeta}>
              {filteredRowCount} result{filteredRowCount === 1 ? '' : 's'}
            </span>
          </div>
        ))}
      </div>
      {peekRow && (
        <DataTablePeekPanel
          title={getRowLabel(peekRow)}
          status={peekStatus?.(peekRow)}
          fields={
            peekFields?.(peekRow) ??
            buildDefaultPeekFields(peekRow, columns, primaryColumnId)
          }
          onClose={() => {
            setPeekRowId(null);
          }}
          onOpenFullDetails={
            onOpenFullDetails
              ? (): void => {
                  onOpenFullDetails(peekRow);
                  setPeekRowId(null);
                }
              : undefined
          }
          closeLabel={closePeekLabel}
          openFullDetailsLabel={openFullDetailsLabel}
          hint={peekHint}
        >
          {renderPeek?.(peekRow)}
        </DataTablePeekPanel>
      )}
    </div>
  );
};
