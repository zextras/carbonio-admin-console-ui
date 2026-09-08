/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from 'react';

import styles from './data-table.module.css';
import type { DataTablePeekField } from './types';

type DataTablePeekPanelProps = {
  title: string;
  status?: string | null;
  fields: Array<DataTablePeekField>;
  children?: ReactNode;
  onClose: () => void;
  onOpenFullDetails?: () => void;
  closeLabel: string;
  openFullDetailsLabel: string;
  hint: string;
};

export const DataTablePeekPanel = ({
  title,
  status,
  fields,
  children,
  onClose,
  onOpenFullDetails,
  closeLabel,
  openFullDetailsLabel,
  hint,
}: DataTablePeekPanelProps) => (
  <aside className={styles.peekPanel} aria-label={`Details: ${title}`}>
    <div className={styles.peekHeader}>
      <h3 className={styles.peekTitle}>{title}</h3>
      <button type="button" className={styles.peekClose} aria-label={closeLabel} onClick={onClose}>
        ✕
      </button>
    </div>
    {status && <span className={styles.peekStatus}>{status}</span>}
    <div className={styles.peekBody}>
      {children ??
        fields.map((field) => (
          <div key={field.label} className={styles.peekField}>
            <span className={styles.peekFieldLabel}>{field.label}</span>
            <span className={styles.peekFieldValue}>{field.value}</span>
          </div>
        ))}
    </div>
    {onOpenFullDetails && (
      <button type="button" className={styles.peekCta} onClick={onOpenFullDetails}>
        {openFullDetailsLabel}
      </button>
    )}
    <p className={styles.peekHint}>{hint}</p>
  </aside>
);
