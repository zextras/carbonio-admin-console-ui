/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from 'react';

import styles from './data-table.module.css';

type DataTableCopyCellProps = {
  value: string;
  onCopy: () => void;
  children: ReactNode;
};

export const DataTableCopyCell = ({ value, onCopy, children }: DataTableCopyCellProps) => (
  <span className={styles.copyCell}>
    <span className={styles.copyCellValue} title={value || undefined}>
      {children}
    </span>
    {value !== '' && (
      <button
        type="button"
        className={styles.hoverAction}
        aria-label={`Copy ${value}`}
        onClick={(event) => {
          event.stopPropagation();
          onCopy();
        }}
      >
        ⧉
      </button>
    )}
  </span>
);
