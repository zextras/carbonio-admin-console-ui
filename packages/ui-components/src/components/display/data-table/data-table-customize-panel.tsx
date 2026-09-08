/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ColumnOrderState, ColumnVisibilityState } from '@tanstack/react-table';
import clsx from 'clsx';
import { useState } from 'react';

import styles from './data-table.module.css';
import {
  type CustomizeColumnItem,
  isColumnVisible,
  moveColumnId,
  orderCustomizeItems,
  reorderColumnIds,
  setColumnVisible,
} from './data-table-customize-model';
import type { DataTableDensity } from './types';

type DataTableCustomizePanelProps = {
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

export const DataTableCustomizePanel = ({
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
}: DataTableCustomizePanelProps) => {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);
  const orderedItems = orderCustomizeItems(columnItems, columnOrder);

  return (
    <div
      id="data-table-customize-panel"
      role="dialog"
      aria-label={dialogLabel}
      className={styles.customizePanel}
    >
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
          className={clsx(styles.densityOption, density === 'compact' && styles.densityOptionActive)}
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
                title={item.locked ? 'Required column — fixed' : 'Drag to reorder'}
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
                    aria-label={`Move ${item.label} up`}
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
                    aria-label={`Move ${item.label} down`}
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
