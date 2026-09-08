/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../../web-components/ds-icon';

import type { ColumnOrderState, ColumnVisibilityState, RowData } from '@tanstack/react-table';
import clsx from 'clsx';
import { type Ref, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../data-table.module.css';
import { useDataTableContext } from '../data-table-contexts';
import {
  ACTIONS_COLUMN_ID,
  buildCustomizeColumnItems,
  buildDefaultColumnOrder,
  buildResetVisibility,
  type CustomizeColumnItem,
  isColumnVisible,
  isCustomizeDirty,
  moveColumnId,
  orderCustomizeItems,
  reorderColumnIds,
  SELECT_COLUMN_ID,
  setColumnVisible,
} from '../models/customize-model';
import type { DataTableState } from '../models/types';
import { useTableConfig } from '../table-config-context';
import { type DataTableDensity, useTableUi } from '../table-ui-store';

export type DataTableCustomizeProps = {
  /**
   * Optional notification for density changes; the UI store always receives
   * the write (the Root shell density class is store-driven).
   */
  onDensityChange?: (density: DataTableDensity) => void;
  customizeLabel?: string;
  dialogLabel?: string;
  densityLabel?: string;
  comfortableLabel?: string;
  compactLabel?: string;
  columnsSectionLabel?: string;
  columnsHint?: string;
  requiredColumnLabel?: string;
  resetLabel?: string;
};

/** State slices the customize panel writes and renders from. */
const CUSTOMIZE_LAYOUT_SLICES = (state: DataTableState) =>
  [state.columnVisibility, state.columnOrder] as const;

type CustomizePanelProps = {
  ref?: Ref<HTMLDivElement>;
  id: string;
  density: DataTableDensity;
  onDensityChange: (density: DataTableDensity) => void;
  columnItems: Array<CustomizeColumnItem>;
  columnOrder: ColumnOrderState;
  onColumnOrderChange: (order: ColumnOrderState) => void;
  columnVisibility: ColumnVisibilityState;
  onColumnVisibilityChange: (visibility: ColumnVisibilityState) => void;
  primaryColumnId: string | undefined;
  showReset: boolean;
  onReset: () => void;
  dialogLabel: string;
  densityLabel: string;
  comfortableLabel: string;
  compactLabel: string;
  columnsSectionLabel: string;
  columnsHint: string;
  requiredColumnLabel: string;
  resetLabel: string;
};

/** Panel body carried from the legacy customize panel, including drag-reorder. */
const CustomizePanel = ({
  ref,
  id,
  density,
  onDensityChange,
  columnItems,
  columnOrder,
  onColumnOrderChange,
  columnVisibility,
  onColumnVisibilityChange,
  primaryColumnId,
  showReset,
  onReset,
  dialogLabel,
  densityLabel,
  comfortableLabel,
  compactLabel,
  columnsSectionLabel,
  columnsHint,
  requiredColumnLabel,
  resetLabel,
}: CustomizePanelProps) => {
  const { t } = useTranslation();
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);
  const orderedItems = orderCustomizeItems(columnItems, columnOrder);

  return (
    <div id={id} ref={ref} role="dialog" aria-label={dialogLabel} className={styles.customizePanel}>
      <div className={styles.customizeSectionLabel}>{densityLabel}</div>
      <div className={styles.densityGroup} role="radiogroup" aria-label={densityLabel}>
        <button
          type="button"
          role="radio"
          aria-checked={density === 'comfortable'}
          className={clsx(
            styles.densityOption,
            density === 'comfortable' && styles.densityOptionActive,
          )}
          onClick={() => {
            onDensityChange('comfortable');
          }}
        >
          {comfortableLabel}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={density === 'compact'}
          className={clsx(
            styles.densityOption,
            density === 'compact' && styles.densityOptionActive,
          )}
          onClick={() => {
            onDensityChange('compact');
          }}
        >
          {compactLabel}
        </button>
      </div>

      <div className={styles.customizeSectionLabel}>{columnsSectionLabel}</div>
      <p className={styles.customizeHint}>{columnsHint}</p>
      <ul className={styles.customizeColumnList}>
        {orderedItems.map((item) => {
          const visible = isColumnVisible(columnVisibility, item.id);
          return (
            <li
              key={item.id}
              className={clsx(
                styles.customizeColumnRow,
                dragId === item.id && styles.customizeColumnDragging,
                dropId === item.id && styles.customizeColumnDropTarget,
                item.locked && styles.customizeColumnLocked,
              )}
              draggable={!item.locked}
              onDragStart={(event) => {
                if (item.locked) {
                  event.preventDefault();
                  return;
                }
                setDragId(item.id);
                event.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(event) => {
                if (item.locked || !dragId || dragId === item.id) {
                  return;
                }
                event.preventDefault();
                setDropId(item.id);
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (!dragId || item.locked) {
                  setDragId(null);
                  setDropId(null);
                  return;
                }
                onColumnOrderChange(
                  reorderColumnIds(columnOrder, dragId, item.id, primaryColumnId),
                );
                setDragId(null);
                setDropId(null);
              }}
              onDragEnd={() => {
                setDragId(null);
                setDropId(null);
              }}
            >
              <span
                className={styles.customizeDragHandle}
                title={
                  item.locked
                    ? t('data_table.required_column_hint', 'Required column — fixed')
                    : t('data_table.drag_to_reorder', 'Drag to reorder')
                }
                aria-hidden="true"
              >
                ⠿
              </span>
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={visible}
                disabled={item.locked}
                className={styles.customizeVisibilityToggle}
                onClick={() => {
                  onColumnVisibilityChange(
                    setColumnVisible(columnVisibility, item.id, !visible, item.locked),
                  );
                }}
              >
                <span
                  className={clsx(
                    styles.customizeCheckbox,
                    visible && styles.customizeCheckboxChecked,
                  )}
                  aria-hidden="true"
                >
                  {visible ? '✓' : ''}
                </span>
                <span className={styles.customizeColumnLabel}>{item.label}</span>
              </button>
              {item.locked ? (
                <span className={styles.requiredBadge}>{requiredColumnLabel}</span>
              ) : (
                <span className={styles.customizeMoveButtons}>
                  <button
                    type="button"
                    className={styles.customizeMoveButton}
                    aria-label={t('data_table.move_column_up', 'Move {{label}} up', {
                      label: item.label,
                    })}
                    onClick={() => {
                      onColumnOrderChange(
                        moveColumnId(columnOrder, item.id, 'up', primaryColumnId),
                      );
                    }}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className={styles.customizeMoveButton}
                    aria-label={t('data_table.move_column_down', 'Move {{label}} down', {
                      label: item.label,
                    })}
                    onClick={() => {
                      onColumnOrderChange(
                        moveColumnId(columnOrder, item.id, 'down', primaryColumnId),
                      );
                    }}
                  >
                    ▼
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {showReset && (
        <button type="button" className={styles.customizeReset} onClick={onReset}>
          {resetLabel}
        </button>
      )}
    </div>
  );
};

/**
 * The toolbar customize trigger + panel. Density writes go to the UI store
 * (plus the optional `onDensityChange` notification); column visibility and
 * order write through the table instance, and the column list is derived
 * from the config published by `DataTableRoot`. The open state lives in the
 * UI store `openPanel` slice (mutual exclusion with filters is implicit),
 * the panel id comes from `useId` (instance-scoped, fix #11) and outside
 * clicks close via element refs.
 */
export const DataTableCustomize = <TData extends RowData = RowData>({
  onDensityChange,
  customizeLabel,
  dialogLabel,
  densityLabel,
  comfortableLabel,
  compactLabel,
  columnsSectionLabel,
  columnsHint,
  requiredColumnLabel,
  resetLabel,
}: DataTableCustomizeProps) => {
  const { t } = useTranslation();
  const table = useDataTableContext<TData>();
  const config = useTableConfig<TData>();
  const open = useTableUi((s) => s.openPanel) === 'customize';
  const setOpenPanel = useTableUi((s) => s.setOpenPanel);
  const density = useTableUi((s) => s.density);
  const setDensity = useTableUi((s) => s.setDensity);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const primaryColumnId = config?.primaryColumnId;
  const columnItems = buildCustomizeColumnItems(config?.columns ?? [], primaryColumnId);
  const customizeColumnIds = columnItems.map((item) => item.id);

  const labels = {
    customizeLabel: customizeLabel ?? t('data_table.customize', 'Customize'),
    dialogLabel: dialogLabel ?? t('data_table.customize_dialog', 'Customize table'),
    densityLabel: densityLabel ?? t('data_table.density', 'Density'),
    comfortableLabel: comfortableLabel ?? t('data_table.comfortable', 'Comfortable'),
    compactLabel: compactLabel ?? t('data_table.compact', 'Compact'),
    columnsSectionLabel: columnsSectionLabel ?? t('data_table.columns', 'Columns'),
    columnsHint:
      columnsHint ?? t('data_table.columns_hint', 'Drag ⠿ to reorder · toggle to show/hide'),
    requiredColumnLabel: requiredColumnLabel ?? t('data_table.required_column', 'required'),
    resetLabel: resetLabel ?? t('data_table.reset_columns', 'Reset'),
  };

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    function handleDocumentMouseDown(event: MouseEvent): void {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      setOpenPanel(null);
    }
    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, [open, setOpenPanel]);

  function handleDensityChange(next: DataTableDensity): void {
    setDensity(next);
    onDensityChange?.(next);
  }

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className={clsx(styles.customizeTrigger, open && styles.customizeTriggerActive)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        onClick={() => {
          setOpenPanel(open ? null : 'customize');
        }}
      >
        <ds-icon icon="Settings" size="small"></ds-icon>
        <span>{labels.customizeLabel}</span>
      </button>
      {open && (
        <table.Subscribe selector={CUSTOMIZE_LAYOUT_SLICES}>
          {([columnVisibility, columnOrder]) => {
            // Internal ids cannot be reordered out of the order slice, so
            // their presence is a stable proxy for the enabled features.
            const defaultColumnOrder = buildDefaultColumnOrder(
              customizeColumnIds,
              primaryColumnId,
              columnOrder.includes(SELECT_COLUMN_ID),
              columnOrder.includes(ACTIONS_COLUMN_ID),
            );
            return (
              <CustomizePanel
                ref={panelRef}
                id={panelId}
                density={density}
                onDensityChange={handleDensityChange}
                columnItems={columnItems}
                columnOrder={columnOrder}
                onColumnOrderChange={(next) => {
                  table.setColumnOrder(next);
                }}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={(next) => {
                  table.setColumnVisibility(next);
                }}
                primaryColumnId={primaryColumnId}
                showReset={isCustomizeDirty(
                  columnVisibility,
                  columnOrder,
                  defaultColumnOrder,
                  customizeColumnIds,
                )}
                onReset={() => {
                  table.setColumnVisibility(buildResetVisibility(customizeColumnIds));
                  table.setColumnOrder(defaultColumnOrder);
                }}
                dialogLabel={labels.dialogLabel}
                densityLabel={labels.densityLabel}
                comfortableLabel={labels.comfortableLabel}
                compactLabel={labels.compactLabel}
                columnsSectionLabel={labels.columnsSectionLabel}
                columnsHint={labels.columnsHint}
                requiredColumnLabel={labels.requiredColumnLabel}
                resetLabel={labels.resetLabel}
              />
            );
          }}
        </table.Subscribe>
      )}
    </>
  );
};
