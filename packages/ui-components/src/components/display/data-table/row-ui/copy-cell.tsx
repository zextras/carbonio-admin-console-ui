/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../data-table.module.css';
import { stopEventPropagation } from './stop-propagation';

type DataTableCopyCellProps = {
  value: string;
  onCopy: () => void;
  children: ReactNode;
};

export const DataTableCopyCell = ({ value, onCopy, children }: DataTableCopyCellProps) => {
  const { t } = useTranslation();

  return (
    <span className={styles.copyCell}>
      <span className={styles.copyCellValue} title={value || undefined}>
        {children}
      </span>
      {value !== '' && (
        <button
          type="button"
          className={styles.hoverAction}
          aria-label={t('data_table.copy', 'Copy {{value}}', { value })}
          onClick={(event) => {
            event.stopPropagation();
            onCopy();
          }}
          onKeyDown={stopEventPropagation}
        >
          ⧉
        </button>
      )}
    </span>
  );
};
