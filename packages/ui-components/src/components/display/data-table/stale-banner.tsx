/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import styles from './data-table.module.css';
import { useTableUi } from './table-ui-store';

export type DataTableStaleBannerProps = {
  /** i18n default: `Data changed on the server.` */
  message?: string;
  /** i18n default: `Reload` */
  reloadLabel?: string;
  /** i18n default: `Dismiss` */
  dismissLabel?: string;
  onReload: () => void;
  onDismiss: () => void;
};

/**
 * Server-side data changed banner. Renders whenever mounted: visibility is a
 * view composition decision (`{stale && <DataTableStaleBanner … />}`), not
 * an internal flag. Reloading announces `Reloaded` through the table live
 * region so screen-reader users learn the refresh happened.
 */
export const DataTableStaleBanner = ({
  message,
  reloadLabel,
  dismissLabel,
  onReload,
  onDismiss,
}: DataTableStaleBannerProps) => {
  const announce = useTableUi((state) => state.announce);
  const { t } = useTranslation();

  return (
    <div role="status" className={styles.staleBanner}>
      <span>{message ?? t('data_table.stale_message', 'Data changed on the server.')}</span>
      <button
        type="button"
        className={styles.staleReload}
        onClick={() => {
          onReload();
          announce(t('data_table.reloaded', 'Reloaded'));
        }}
      >
        {reloadLabel ?? t('data_table.stale_reload', 'Reload')}
      </button>
      <span className={styles.staleSpacer} />
      <button
        type="button"
        className={styles.staleDismiss}
        onClick={() => {
          onDismiss();
        }}
      >
        {dismissLabel ?? t('data_table.stale_dismiss', 'Dismiss')}
      </button>
    </div>
  );
};
