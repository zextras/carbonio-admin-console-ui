/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState } from 'react';

import styles from './data-table.module.css';

type DataTablePaginationProps = {
  pageIndex: number;
  pageSize: number;
  rowCount: number;
  pageCount: number;
  pageSizeOptions: Array<number>;
  rowsPerPageLabel: string;
  goToPageLabel: string;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onSetPageIndex: (pageIndex: number) => void;
  onSetPageSize: (pageSize: number) => void;
};

function pageList(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const out: Array<number | 'ellipsis'> = [1];
  if (current > 3) {
    out.push('ellipsis');
  }
  for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page += 1) {
    out.push(page);
  }
  if (current < total - 2) {
    out.push('ellipsis');
  }
  out.push(total);
  return out;
}

export const DataTablePagination = ({
  pageIndex,
  pageSize,
  rowCount,
  pageCount,
  pageSizeOptions,
  rowsPerPageLabel,
  goToPageLabel,
  canPreviousPage,
  canNextPage,
  onPreviousPage,
  onNextPage,
  onSetPageIndex,
  onSetPageSize,
}: DataTablePaginationProps) => {
  const [goTo, setGoTo] = useState('');
  const [goToError, setGoToError] = useState(false);
  const currentPage = pageIndex + 1;
  const from = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, rowCount);

  function commitGoTo(): void {
    const parsed = Number(goTo);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > pageCount) {
      setGoToError(true);
      return;
    }
    setGoToError(false);
    onSetPageIndex(parsed - 1);
    setGoTo('');
  }

  return (
    <div className={styles.footer}>
      <label className={styles.rowsPerPage}>
        {rowsPerPageLabel}
        <select
          className={styles.select}
          aria-label={rowsPerPageLabel}
          value={pageSize}
          onChange={(e) => {
            onSetPageSize(Number(e.target.value));
          }}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <span className={styles.footerMeta}>
        {from.toLocaleString('en')}–{to.toLocaleString('en')} of {rowCount.toLocaleString('en')}
      </span>
      <span className={styles.footerSpacer} />
      <nav aria-label="Table pagination" className={styles.paginationNav}>
        <button
          type="button"
          className={styles.pageButton}
          aria-label="Previous page"
          disabled={!canPreviousPage}
          onClick={onPreviousPage}
        >
          ‹
        </button>
        {pageList(currentPage, pageCount).map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`e${index}`} className={styles.ellipsis} aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`${styles.pageButton}${item === currentPage ? ` ${styles.pageButtonCurrent}` : ''}`}
              aria-label={`Page ${item}`}
              aria-current={item === currentPage ? 'page' : undefined}
              onClick={() => {
                onSetPageIndex(item - 1);
              }}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          className={styles.pageButton}
          aria-label="Next page"
          disabled={!canNextPage}
          onClick={onNextPage}
        >
          ›
        </button>
      </nav>
      {pageCount > 10 && (
        <label className={styles.goTo}>
          {goToPageLabel}
          <input
            className={`${styles.goToInput}${goToError ? ` ${styles.goToInputInvalid}` : ''}`}
            value={goTo}
            aria-label={`${goToPageLabel}, 1 to ${pageCount}`}
            aria-invalid={goToError}
            onChange={(e) => {
              setGoTo(e.target.value.replaceAll(/\D/g, ''));
              setGoToError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitGoTo();
              }
            }}
          />
          {goToError && (
            <span className={styles.goToError}>
              1–{pageCount}
            </span>
          )}
        </label>
      )}
    </div>
  );
};
