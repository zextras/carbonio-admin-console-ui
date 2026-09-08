/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styles from './data-table.module.css';
import { useDataTableContext } from './data-table-contexts';
import { clampRange, isStalePage } from './models/pagination';

const DEFAULT_PAGINATION_THRESHOLD = 10;

function defaultResultsLabel(count: number): string {
  return `${count} result${count === 1 ? '' : 's'}`;
}

function defaultRangeLabel(from: number, to: number, count: number): string {
  return `${from.toLocaleString('en')}–${to.toLocaleString('en')} of ${count.toLocaleString('en')}`;
}

type DataTableTableFooterProps = {
  /** Show the from/to window only when the row count exceeds this value. Default: 10 */
  paginationThreshold?: number;
  /** Label for the plain row count line, e.g. `25 results`. */
  resultsLabel?: (count: number) => string;
  /** Label for the from/to window line, e.g. `51–60 of 60`. */
  rangeLabel?: (from: number, to: number, count: number) => string;
};

/**
 * Meta-only footer line: the row count below the pagination threshold, the
 * clamped from/to window above it. The full pagination controls (Task 10)
 * wrap this part. On a stale page the from/to window is hidden and only the
 * count is shown (the view clamps the page index separately).
 */
export const DataTableTableFooter = ({
  paginationThreshold = DEFAULT_PAGINATION_THRESHOLD,
  resultsLabel = defaultResultsLabel,
  rangeLabel = defaultRangeLabel,
}: DataTableTableFooterProps) => {
  const table = useDataTableContext();

  return (
    <table.Subscribe selector={(state) => state.pagination}>
      {(pagination) => {
        const rowCount = table.options.rowCount ?? table.getRowModel().rows.length;
        const showRange =
          rowCount > paginationThreshold &&
          !isStalePage(rowCount, pagination.pageIndex, pagination.pageSize);
        const { from, to } = clampRange(rowCount, pagination.pageIndex, pagination.pageSize);
        return (
          <div className={styles.footer}>
            <span className={styles.footerMeta}>
              {showRange ? rangeLabel(from, to, rowCount) : resultsLabel(rowCount)}
            </span>
          </div>
        );
      }}
    </table.Subscribe>
  );
};
