/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styles from './data-table.module.css';

type SelectionBannerProps = {
  count: number;
  selectedLabel?: string;
  clearLabel?: string;
  onClear: () => void;
};

export const SelectionBanner = ({
  count,
  selectedLabel = 'selected',
  clearLabel = '× Clear',
  onClear,
}: SelectionBannerProps) => (
  <div role="toolbar" aria-label={`Bulk actions, ${count} selected`} className={styles.selectionBanner}>
    <span className={styles.selectionCount}>{count.toLocaleString('en')}</span>
    <span className={styles.selectionText}>{selectedLabel}</span>
    <button type="button" className={styles.clearButton} onClick={onClear}>
      {clearLabel}
    </button>
  </div>
);
