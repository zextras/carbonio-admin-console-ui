/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styles from '../data-table.module.css';

type DataTableQuotaBarProps = {
  /** Used amount (same unit as `limit`). */
  used: number;
  /** Quota limit; when 0 or negative the bar renders empty. */
  limit: number;
  /** Visible label, e.g. `12.4 / 25 GB`. */
  label: string;
};

/** Compact used/limit progress for quota-style numeric cells. */
export const DataTableQuotaBar = ({ used, limit, label }: DataTableQuotaBarProps) => {
  const ratio = limit > 0 ? Math.min(Math.max(used / limit, 0), 1) : 0;
  return (
    <span className={styles.quotaBar}>
      <span className={styles.quotaBarTrack} aria-hidden="true">
        <span className={styles.quotaBarFill} style={{ width: `${ratio * 100}%` }} />
      </span>
      <span className={styles.quotaBarLabel}>{label}</span>
    </span>
  );
};
