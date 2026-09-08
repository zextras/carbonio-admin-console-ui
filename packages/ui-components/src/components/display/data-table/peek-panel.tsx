/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RowData } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './data-table.module.css';
import { useDataTableContext } from './data-table-contexts';
import { buildDefaultPeekFields } from './models/row-ui';
import { type DataTableTableConfig, useTableConfig } from './table-config-context';
import { ROW_MODEL_SLICES } from './table-selectors';
import { useTableUi } from './table-ui-store';

/** One label/value line of the peek field list. */
type PeekFieldItem = {
  /** Stable React key; default fields (label-keyed) omit it. */
  id?: string;
  label: string;
  value: ReactNode;
};

export type DataTablePeekPanelProps<TData extends RowData> = {
  /** Panel heading; defaults to the config row label (primary value). */
  title?: (row: TData) => string;
  /** Status chip text. */
  status?: (row: TData) => string;
  /** Custom field list; defaults to `buildDefaultPeekFields` over the columns. */
  fields?: (row: TData) => Array<{ id: string; label: string; value: ReactNode }>;
  /** Replaces the whole field list with custom content. */
  renderPeek?: (row: TData) => ReactNode;
  /** Shows the CTA button, invoked with the peeked row before closing. */
  onOpenFullDetails?: (row: TData) => void;
};

function resolvePeekTitle<TData extends RowData>(
  row: TData,
  rowId: string,
  title: DataTablePeekPanelProps<TData>['title'],
  config: DataTableTableConfig<TData> | null,
): string {
  if (title) {
    return title(row);
  }
  if (config?.getRowLabel) {
    return config.getRowLabel(row);
  }
  return rowId;
}

function resolvePeekFields<TData extends RowData>(
  row: TData,
  fields: DataTablePeekPanelProps<TData>['fields'],
  config: DataTableTableConfig<TData> | null,
): Array<PeekFieldItem> {
  if (fields) {
    return fields(row);
  }
  if (config) {
    return buildDefaultPeekFields(row, config.columns, config.primaryColumnId);
  }
  return [];
}

/**
 * Side panel with the details of the peeked row (`peekRowId` in the table UI
 * store). Keyboard navigation (arrows retarget, Escape closes) lives in the
 * body part, which owns the document-level keydown listener. The row is
 * resolved inside a `Subscribe` on the row-model slices so the panel follows
 * page/sort/filter changes: a peeked row leaving the page unmounts the panel.
 * Returns null while no row is peeked or the row is not on the current page.
 */
export const DataTablePeekPanel = <TData extends RowData>({
  title,
  status,
  fields,
  renderPeek,
  onOpenFullDetails,
}: DataTablePeekPanelProps<TData>) => {
  const peekRowId = useTableUi((state) => state.peekRowId);
  const setPeekRowId = useTableUi((state) => state.setPeekRowId);
  const table = useDataTableContext<TData>();
  const config = useTableConfig<TData>();
  const { t } = useTranslation();

  return (
    <table.Subscribe selector={ROW_MODEL_SLICES}>
      {() => {
        const row =
          peekRowId === null
            ? null
            : table.getRowModel().rows.find((tableRow) => tableRow.id === peekRowId)?.original ??
              null;
        if (peekRowId === null || row === null) {
          return null;
        }
        const resolvedTitle = resolvePeekTitle(row, peekRowId, title, config);
        const statusText = status?.(row);
        return (
          <aside
            className={styles.peekPanel}
            aria-label={t('data_table.peek_details', 'Details: {{title}}', {
              title: resolvedTitle,
            })}
          >
            <div className={styles.peekHeader}>
              <h3 className={styles.peekTitle}>{resolvedTitle}</h3>
              <button
                type="button"
                className={styles.peekClose}
                aria-label={t('data_table.peek_close', 'Close details')}
                onClick={() => {
                  setPeekRowId(null);
                }}
              >
                ✕
              </button>
            </div>
            {statusText && <span className={styles.peekStatus}>{statusText}</span>}
            <div className={styles.peekBody}>
              {renderPeek
                ? renderPeek(row)
                : resolvePeekFields(row, fields, config).map((field) => (
                    <div key={field.id ?? field.label} className={styles.peekField}>
                      <span className={styles.peekFieldLabel}>{field.label}</span>
                      <span className={styles.peekFieldValue}>{field.value}</span>
                    </div>
                  ))}
            </div>
            {onOpenFullDetails && (
              <button
                type="button"
                className={styles.peekCta}
                onClick={() => {
                  onOpenFullDetails(row);
                  setPeekRowId(null);
                }}
              >
                {t('data_table.peek_open_full_details', 'Open full details')}
              </button>
            )}
            <p className={styles.peekHint}>
              {t('data_table.peek_hint', '↑ / ↓ retarget the panel · Esc closes')}
            </p>
          </aside>
        );
      }}
    </table.Subscribe>
  );
};
