/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styles from './data-table.module.css';
import type { DataTableBulkAction } from './types';

type DataTableBulkBarProps = {
  count: number;
  selectedLabel: string;
  clearLabel: string;
  actions: Array<DataTableBulkAction>;
  onClear: () => void;
  onAction: (action: DataTableBulkAction) => void;
};

export const DataTableBulkBar = ({
  count,
  selectedLabel,
  clearLabel,
  actions,
  onClear,
  onAction,
}: DataTableBulkBarProps) => (
  <div role="toolbar" aria-label={`Bulk actions, ${count} selected`} className={styles.selectionBanner}>
    <span className={styles.selectionCount}>{count.toLocaleString('en')}</span>
    <span className={styles.selectionText}>{selectedLabel}</span>
    {actions.length > 0 && <span className={styles.bulkDivider} aria-hidden="true" />}
    <div className={styles.bulkActions}>
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          className={`${styles.bulkActionButton}${action.danger ? ` ${styles.bulkActionDanger}` : ''}`}
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
