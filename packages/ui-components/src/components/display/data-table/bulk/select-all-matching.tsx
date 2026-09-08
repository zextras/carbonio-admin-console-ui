/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import styles from '../data-table.module.css';

export type DataTableSelectAllMatchingProps = {
  /** Total matching rows across all pages, already resolved by the parent. */
  count: number;
  /** Rows on the current page. */
  pageCount: number;
  /** Announced text for the selected page rows. */
  pageSelectedLabel?: (pageCount: number) => string;
  onSelectAllMatching: () => void;
};

function defaultPageSelectedLabel(pageCount: number): string {
  return `All ${pageCount} rows on this page are selected.`;
}

/**
 * Presentational "select all matching rows" prompt shown below the bulk
 * bar when the whole page is selected and more matching rows exist. The
 * bulk bar owns the visibility computation; this part only renders the
 * resolved numbers and forwards the click.
 */
export const DataTableSelectAllMatching = ({
  count,
  pageCount,
  pageSelectedLabel = defaultPageSelectedLabel,
  onSelectAllMatching,
}: DataTableSelectAllMatchingProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;

  return (
    <div role="status" className={styles.selectAllMatching}>
      <span>{pageSelectedLabel(pageCount)}</span>
      <button
        type="button"
        className={styles.selectAllMatchingButton}
        onClick={onSelectAllMatching}
      >
        {t('data_table.select_all_matching', 'Select all {{total}} matching', {
          total: count.toLocaleString(locale),
        })}
      </button>
    </div>
  );
};
