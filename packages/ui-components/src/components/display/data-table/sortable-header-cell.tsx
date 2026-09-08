/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../web-components/ds-icon';

import styles from './data-table.module.css';

type SortDirection = false | 'asc' | 'desc';

type SortableHeaderCellProps = {
  label: React.ReactNode;
  canSort: boolean;
  sorted: SortDirection;
  onToggleSort?: (event: unknown) => void;
};

function SortIcon({ sorted }: { sorted: SortDirection }) {
  if (sorted === 'asc') {
    return (
      <span className={styles.sortIcon} aria-hidden="true">
        <ds-icon icon="ChevronSortUpOutline" size="small"></ds-icon>
      </span>
    );
  }
  if (sorted === 'desc') {
    return (
      <span className={styles.sortIcon} aria-hidden="true">
        <ds-icon icon="ChevronSortDownOutline" size="small"></ds-icon>
      </span>
    );
  }
  return (
    <span className={styles.sortIcon} aria-hidden="true">
      <ds-icon icon="ChevronSortEmptyOutline" size="small"></ds-icon>
    </span>
  );
}

export const SortableHeaderCell = ({
  label,
  canSort,
  sorted,
  onToggleSort,
}: SortableHeaderCellProps) => {
  if (!canSort) {
    return <>{label}</>;
  }

  return (
    <button
      type="button"
      className={styles.sortButton}
      onClick={onToggleSort}
      data-sorted={sorted || 'none'}
    >
      {label}
      <SortIcon sorted={sorted} />
    </button>
  );
};
