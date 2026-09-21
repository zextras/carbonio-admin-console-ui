/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { PaginationState } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './data-table.module.css';
import { useDataTableContext } from './data-table-contexts';
import {
  clampRange,
  defaultRangeLabel,
  defaultResultsLabel,
  isStalePage,
} from './models/pagination';
import { useTableUi } from './table-ui-store';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/** Page button or ellipsis separator with a stable key (never the array index). */
type PageListItem = { key: string; page?: number };

function pageList(current: number, total: number): Array<PageListItem> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => ({ key: `page-${i + 1}`, page: i + 1 }));
  }
  const out: Array<PageListItem> = [{ key: 'page-1', page: 1 }];
  if (current > 3) {
    out.push({ key: 'ellipsis-start' });
  }
  for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page += 1) {
    out.push({ key: `page-${page}`, page });
  }
  if (current < total - 2) {
    out.push({ key: 'ellipsis-end' });
  }
  out.push({ key: `page-${total}`, page: total });
  return out;
}

export type DataTablePaginationProps = {
  /** Page size choices offered by the rows-per-page select. Default: [10, 25, 50, 100] */
  pageSizeOptions?: Array<number>;
  /** Label for the rows-per-page select. */
  rowsPerPageLabel?: string;
  /** Label for the go-to-page input (only shown when there are more than 10 pages). */
  goToPageLabel?: string;
};

type PaginationControlsProps = {
  table: ReturnType<typeof useDataTableContext>;
  pagination: PaginationState;
  /** Manual-mode count published by `DataTableRoot` into the UI store. */
  manualRowCount: number | undefined;
  pageSizeOptions: Array<number>;
  rowsPerPageLabel: string;
  goToPageLabel: string;
};

type PageButtonProps = {
  page: number;
  current: boolean;
  onSelect: (pageIndex: number) => void;
};

const PageButton = ({ page, current, onSelect }: PageButtonProps) => (
  <button
    type="button"
    className={`${styles.pageButton}${current ? ` ${styles.pageButtonCurrent}` : ''}`}
    aria-label={`Page ${page}`}
    aria-current={current ? 'page' : undefined}
    onClick={() => {
      onSelect(page - 1);
    }}
  >
    {page}
  </button>
);

/**
 * Module-level controls body (S6478): rendered inside the Subscribe render
 * prop, so it owns the go-to-page draft state that cannot live in the prop
 * function itself. Changing the page size resets to the first page, matching
 * the migrated views' wiring.
 */
const PaginationControls = ({
  table,
  pagination,
  manualRowCount,
  pageSizeOptions,
  rowsPerPageLabel,
  goToPageLabel,
}: PaginationControlsProps) => {
  const [goTo, setGoTo] = useState('');
  const [goToError, setGoToError] = useState(false);
  const currentPage = pagination.pageIndex + 1;
  // Manual mode trusts the Root-published store count; client mode counts
  // the filtered row model live inside the Subscribe (the selector covers
  // columnFilters/globalFilter so filter changes re-run this).
  const rowCount = manualRowCount ?? table.getFilteredRowModel().rows.length;
  // Floor at 1 so the controls keep their shape for an empty/unknown result
  // set (mirrors the migrated views' Math.max(1, …) page count).
  const pageCount = Math.max(1, Math.ceil(rowCount / pagination.pageSize));
  const stale = isStalePage(rowCount, pagination.pageIndex, pagination.pageSize);
  const { from, to } = clampRange(rowCount, pagination.pageIndex, pagination.pageSize);
  // Compiler-safety contract: slice-derived pageIndex checks (above) and
  // store-published counts are safe to compute at render; render-time
  // `table.options` / `table.state` reads via the context table are NOT —
  // under the React Compiler the options wrapper is a mount-time snapshot
  // (AppTable element + prop-less children get memoized), so such reads
  // never observe updates. Table mutation APIs are only safe in event
  // handlers below.
  const canPreviousPage = pagination.pageIndex > 0;
  const canNextPage = pagination.pageIndex < pageCount - 1;

  function commitGoTo(): void {
    const parsed = Number(goTo);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > pageCount) {
      setGoToError(true);
      return;
    }
    setGoToError(false);
    table.setPageIndex(parsed - 1);
    setGoTo('');
  }

  return (
    <div className={styles.footer}>
      <label className={styles.rowsPerPage}>
        {rowsPerPageLabel}
        <select
          className={styles.select}
          aria-label={rowsPerPageLabel}
          value={pagination.pageSize}
          onChange={(e) => {
            table.setPagination({ pageIndex: 0, pageSize: Number(e.target.value) });
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
        {stale ? defaultResultsLabel(rowCount) : defaultRangeLabel(from, to, rowCount)}
      </span>
      <span className={styles.footerSpacer} />
      <nav aria-label="Table pagination" className={styles.paginationNav}>
        <button
          type="button"
          className={styles.pageButton}
          aria-label="Previous page"
          disabled={!canPreviousPage}
          onClick={() => {
            table.previousPage();
          }}
        >
          ‹
        </button>
        {pageList(currentPage, pageCount).map((item) =>
          item.page === undefined ? (
            <span key={item.key} className={styles.ellipsis} aria-hidden="true">
              …
            </span>
          ) : (
            <PageButton
              key={item.key}
              page={item.page}
              current={item.page === currentPage}
              onSelect={(pageIndex) => {
                table.setPageIndex(pageIndex);
              }}
            />
          ),
        )}
        <button
          type="button"
          className={styles.pageButton}
          aria-label="Next page"
          disabled={!canNextPage}
          onClick={() => {
            table.nextPage();
          }}
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
          {goToError && <span className={styles.goToError}>1–{pageCount}</span>}
        </label>
      )}
    </div>
  );
};

/**
 * Context-connected pagination controls: page-size select, page buttons and
 * go-to-page input wired straight to the table instance. The manual-mode row
 * count comes from the UI store (`DataTableRoot` republishes it on every
 * prop change — render-time `table.options` reads are compiler-frozen);
 * client-side filtering counts the filtered row model inside the
 * subscription. On a stale page the from/to window is hidden and only the
 * count is shown (the view clamps the page index separately). Compose
 * inside `DataTableRoot`.
 */
export const DataTablePagination = ({
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  rowsPerPageLabel: rowsPerPageLabelProp,
  goToPageLabel: goToPageLabelProp,
}: DataTablePaginationProps) => {
  const table = useDataTableContext();
  const manualRowCount = useTableUi((s) => s.resolvedRowCount);
  const { t } = useTranslation();
  const rowsPerPageLabel = rowsPerPageLabelProp ?? t('label.rows_per_page', 'Rows per page');
  const goToPageLabel = goToPageLabelProp ?? t('label.go_to_page', 'Go to page');

  return (
    <table.Subscribe
      selector={(state) => [state.pagination, state.columnFilters, state.globalFilter] as const}
    >
      {([pagination]) => (
        <PaginationControls
          table={table}
          pagination={pagination}
          manualRowCount={manualRowCount}
          pageSizeOptions={pageSizeOptions}
          rowsPerPageLabel={rowsPerPageLabel}
          goToPageLabel={goToPageLabel}
        />
      )}
    </table.Subscribe>
  );
};
