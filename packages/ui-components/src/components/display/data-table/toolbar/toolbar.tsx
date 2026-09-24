/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../data-table.module.css';

type DataTableToolbarProps = {
  children: ReactNode;
  /** Accessible name for the toolbar region; defaults to i18n. */
  label?: string;
};

/**
 * Toolbar layout part: the positioning context (`toolbarWrap`) plus the
 * flex row the search/filters/customize parts compose into. Panels dropped
 * as children are absolutely positioned against the wrap.
 */
export const DataTableToolbar = ({ children, label }: DataTableToolbarProps) => {
  const { t } = useTranslation();
  return (
    <div className={styles.toolbarWrap}>
      <div
        className={styles.toolbar}
        role="toolbar"
        aria-label={label ?? t('data_table.toolbar', 'Table actions')}
      >
        {children}
      </div>
    </div>
  );
};
