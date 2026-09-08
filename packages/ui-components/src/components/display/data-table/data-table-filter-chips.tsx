/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styles from './data-table.module.css';
import type { DataTableFilterChip } from './types';

type DataTableFilterChipsProps = {
  chips: Array<DataTableFilterChip>;
  clearAllLabel: string;
  onRemoveChip: (chip: DataTableFilterChip) => void;
  onClearAll: () => void;
};

export const DataTableFilterChips = ({
  chips,
  clearAllLabel,
  onRemoveChip,
  onClearAll,
}: DataTableFilterChipsProps) => {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className={styles.filterChips} role="list" aria-label="Active filters">
      {chips.map((chip) => (
        <span key={chip.key} className={styles.filterChip} role="listitem">
          {chip.label}
          <button
            type="button"
            className={styles.filterChipRemove}
            aria-label={`Remove filter: ${chip.label}`}
            onClick={() => {
              onRemoveChip(chip);
            }}
          >
            ✕
          </button>
        </span>
      ))}
      <button type="button" className={styles.clearAllFilters} onClick={onClearAll}>
        {clearAllLabel}
      </button>
    </div>
  );
};
