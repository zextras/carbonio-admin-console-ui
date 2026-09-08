/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styles from './data-table.module.css';

type DataTableStaleBannerProps = {
  message: string;
  reloadLabel: string;
  dismissLabel: string;
  onReload: () => void;
  onDismiss: () => void;
};

export const DataTableStaleBanner = ({
  message,
  reloadLabel,
  dismissLabel,
  onReload,
  onDismiss,
}: DataTableStaleBannerProps) => (
  <div role="status" className={styles.staleBanner}>
    <span>{message}</span>
    <button type="button" className={styles.staleReload} onClick={onReload}>
      {reloadLabel}
    </button>
    <span className={styles.staleSpacer} />
    <button type="button" className={styles.staleDismiss} onClick={onDismiss}>
      {dismissLabel}
    </button>
  </div>
);
