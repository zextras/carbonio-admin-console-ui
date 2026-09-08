/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RowData, RowSelectionState, Table } from '@tanstack/react-table';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../data-table.module.css';
import { useDataTableContext } from '../data-table-contexts';
import type { DataTableFeatures } from '../data-table-features';
import type { DataTableBulkAction, DataTableBulkJobState } from '../models/types';
import { useTableUi, useTableUiStore } from '../table-ui-store';
import { DataTableConfirmDialog } from './confirm-dialog';
import { DataTableSelectAllMatching } from './select-all-matching';
import { DataTableUndoToast } from './undo-toast';

export type DataTableBulkActionEvent = {
  action: DataTableBulkAction;
  /**
   * Ids of the selected rows. Meaningful ONLY while `selectAllMatching` is
   * false — when the user selected all matching rows this is `[]` on
   * purpose: server-side views must act on the `selectAllMatching` flag
   * plus `selectedCount` instead of an id list.
   */
  selectedRowIds: Array<string>;
  selectAllMatching: boolean;
  selectedCount: number;
};

export type DataTableBulkBarProps = {
  /** Bulk action buttons shown in the selection banner. */
  actions?: Array<DataTableBulkAction>;
  onBulkAction?: (
    event: DataTableBulkActionEvent,
  ) => void | Promise<{ undo?: { message: string; onUndo: () => void } } | undefined>;
  /** Server-mode total for banner counts while all matching rows are selected. */
  totalMatchingCount?: number;
  /** Offer "select all matching" when the whole page is selected. */
  enableSelectAllMatching?: boolean;
  /**
   * While a bulk job is running, executed actions keep the selection so the
   * job chrome (progress, retry-failed) keeps its context — mirrors the
   * legacy orchestrator contract.
   */
  bulkJob?: DataTableBulkJobState;
  /** Label after the selected count. i18n default: `selected` */
  selectionBannerLabel?: string;
  /** i18n default: `× Clear` */
  clearSelectionLabel?: string;
  /** Announced text for the selected page rows below the prompt. */
  pageSelectedLabel?: (pageCount: number) => string;
  /** i18n default: `Are you sure?` */
  bulkConfirmTitle?: string;
  /** i18n default: `Confirm` */
  bulkConfirmLabel?: string;
  /** i18n default: `Cancel` */
  bulkConfirmCancelLabel?: string;
};

function selectedRowIdsFromState(rowSelection: RowSelectionState): Array<string> {
  return Object.keys(rowSelection).filter((id) => rowSelection[id]);
}

/**
 * Total rows behind the current filters, mirroring the legacy orchestrator
 * (`manualFiltering ? rowCount ?? data.length : filtered row model`) via
 * the table options, the same resolution the footer part uses.
 */
function resolveFilteredRowCount<TData extends RowData>(
  table: Table<DataTableFeatures, TData>,
): number {
  const { manualFiltering, rowCount, data } = table.options;
  if (manualFiltering === true || rowCount !== undefined) {
    return rowCount ?? data.length;
  }
  return table.getFilteredRowModel().rows.length;
}

type BulkBannerProps = {
  countLabel: string;
  toolbarLabel: string;
  selectedLabel: string;
  clearLabel: string;
  actions: Array<DataTableBulkAction>;
  onClear: () => void;
  onAction: (action: DataTableBulkAction) => void;
};

/** Module-level selection banner (S6478): pure presentational toolbar. */
const BulkBanner = ({
  countLabel,
  toolbarLabel,
  selectedLabel,
  clearLabel,
  actions,
  onClear,
  onAction,
}: BulkBannerProps) => (
  <div role="toolbar" aria-label={toolbarLabel} className={styles.selectionBanner}>
    <span className={styles.selectionCount}>{countLabel}</span>
    <span className={styles.selectionText}>{selectedLabel}</span>
    {actions.length > 0 && <span className={styles.bulkDivider} aria-hidden="true" />}
    <div className={styles.bulkActions}>
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          className={`${styles.bulkActionButton}${
            action.danger ? ` ${styles.bulkActionDanger}` : ''
          }`}
          onClick={() => {
            onAction(action);
          }}
        >
          {action.label}
        </button>
      ))}
    </div>
    <button type="button" className={styles.clearButton} onClick={onClear}>
      {clearLabel}
    </button>
  </div>
);

/**
 * The bulk selection part: banner with the selected count and bulk action
 * buttons, the "select all N matching" prompt, plus the confirm dialog and
 * undo toast its actions trigger (part-local, no cross-part sharing).
 *
 * Compose inside `DataTableRoot`. Selection state arrives through
 * `table.Subscribe`; `selectAllMatching` and the undo toast live in the UI
 * store. The bar renders nothing while nothing is selected.
 */
export const DataTableBulkBar = <TData extends RowData>({
  actions,
  onBulkAction,
  totalMatchingCount,
  enableSelectAllMatching = false,
  bulkJob = null,
  selectionBannerLabel,
  clearSelectionLabel,
  pageSelectedLabel,
  bulkConfirmTitle,
  bulkConfirmLabel,
  bulkConfirmCancelLabel,
}: DataTableBulkBarProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const table = useDataTableContext<TData>();
  const uiStore = useTableUiStore();
  const selectAllMatching = useTableUi((s) => s.selectAllMatching);
  const undoToast = useTableUi((s) => s.undoToast);
  const [pendingConfirm, setPendingConfirm] = useState<DataTableBulkAction | null>(null);
  const undoIdRef = useRef(0);

  const resolvedActions = actions ?? [];
  const labels = {
    selected: selectionBannerLabel ?? t('data_table.selection_banner_label', 'selected'),
    clear: clearSelectionLabel ?? t('data_table.clear_selection', '× Clear'),
    confirmTitle: bulkConfirmTitle ?? t('data_table.bulk_confirm_title', 'Are you sure?'),
    confirm: bulkConfirmLabel ?? t('data_table.bulk_confirm', 'Confirm'),
    confirmCancel: bulkConfirmCancelLabel ?? t('data_table.bulk_confirm_cancel', 'Cancel'),
  };

  /** Selection count that "select all matching" would act on. */
  function currentTotalMatching(): number {
    return totalMatchingCount ?? resolveFilteredRowCount(table);
  }

  function clearSelection(): void {
    table.resetRowSelection();
    uiStore.getState().setSelectAllMatching(false);
    uiStore.getState().announce(t('data_table.selection_cleared', 'Selection cleared'));
  }

  function confirmMessage(action: DataTableBulkAction): string {
    const rowSelection = table.atoms.rowSelection.get();
    const selectAll = uiStore.getState().selectAllMatching;
    const count = selectAll ? currentTotalMatching() : selectedRowIdsFromState(rowSelection).length;
    return t(
      'data_table.bulk_confirm_message',
      '{{action}} {{total}} items? This cannot be undone.',
      {
        action: action.label,
        total: count.toLocaleString(locale),
      },
    );
  }

  async function executeBulkAction(action: DataTableBulkAction): Promise<void> {
    const selectAll = uiStore.getState().selectAllMatching;
    const selectedRowIds = selectAll ? [] : selectedRowIdsFromState(table.atoms.rowSelection.get());
    const result = await onBulkAction?.({
      action,
      selectedRowIds,
      selectAllMatching: selectAll,
      selectedCount: selectAll ? currentTotalMatching() : selectedRowIds.length,
    });
    if (result?.undo) {
      undoIdRef.current += 1;
      uiStore.getState().setUndoToast({
        id: undoIdRef.current,
        message: result.undo.message,
        onUndo: () => {
          result.undo?.onUndo();
          uiStore.getState().setUndoToast(null);
          uiStore.getState().announce(t('data_table.undone', 'Undone'));
        },
      });
    }
    if (!bulkJob) {
      clearSelection();
    }
  }

  function handleBulkAction(action: DataTableBulkAction): void {
    if (action.danger || action.requireConfirm) {
      setPendingConfirm(action);
      return;
    }
    void executeBulkAction(action);
  }

  return (
    <>
      <table.Subscribe
        selector={(state) =>
          [
            state.rowSelection,
            state.pagination,
            state.sorting,
            state.columnFilters,
            state.globalFilter,
          ] as const
        }
      >
        {([rowSelection]) => {
          const bannerCount = selectAllMatching
            ? currentTotalMatching()
            : selectedRowIdsFromState(rowSelection).length;
          // Internally derived: with nothing selected there is no prompt
          // either (the prompt requires every page row selected).
          if (bannerCount === 0) {
            return null;
          }
          const pageRows = table.getRowModel().rows;
          const totalMatching = currentTotalMatching();
          const showPrompt =
            enableSelectAllMatching &&
            !selectAllMatching &&
            pageRows.length > 0 &&
            table.getIsAllPageRowsSelected() &&
            totalMatching > pageRows.length;
          return (
            <>
              <BulkBanner
                countLabel={bannerCount.toLocaleString(locale)}
                toolbarLabel={t(
                  'data_table.bulk_actions_toolbar',
                  'Bulk actions, {{total}} selected',
                  {
                    total: bannerCount.toLocaleString(locale),
                  },
                )}
                selectedLabel={labels.selected}
                clearLabel={labels.clear}
                actions={resolvedActions}
                onClear={clearSelection}
                onAction={handleBulkAction}
              />
              {showPrompt && (
                <DataTableSelectAllMatching
                  count={totalMatching}
                  pageCount={pageRows.length}
                  pageSelectedLabel={pageSelectedLabel}
                  onSelectAllMatching={() => {
                    uiStore.getState().setSelectAllMatching(true);
                  }}
                />
              )}
            </>
          );
        }}
      </table.Subscribe>
      {pendingConfirm && (
        <DataTableConfirmDialog
          title={labels.confirmTitle}
          message={confirmMessage(pendingConfirm)}
          confirmLabel={labels.confirm}
          cancelLabel={labels.confirmCancel}
          onCancel={() => {
            setPendingConfirm(null);
          }}
          onConfirm={() => {
            const action = pendingConfirm;
            setPendingConfirm(null);
            void executeBulkAction(action);
          }}
        />
      )}
      {undoToast && (
        <DataTableUndoToast
          key={undoToast.id}
          message={undoToast.message}
          onUndo={undoToast.onUndo}
          onExpire={() => {
            uiStore.getState().setUndoToast(null);
          }}
        />
      )}
    </>
  );
};
