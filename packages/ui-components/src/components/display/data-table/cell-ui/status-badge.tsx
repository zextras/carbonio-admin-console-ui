/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import type { ReactNode } from 'react';

import styles from '../data-table.module.css';

export type DataTableStatusBadgeVariant =
  | 'active'
  | 'closed'
  | 'pending'
  | 'locked'
  | 'maintenance';

type DataTableStatusBadgeProps = {
  variant: DataTableStatusBadgeVariant;
  children: ReactNode;
};

const VARIANT_CLASS: Record<DataTableStatusBadgeVariant, string> = {
  active: styles.statusBadgeActive,
  closed: styles.statusBadgeClosed,
  pending: styles.statusBadgePending,
  locked: styles.statusBadgeLocked,
  maintenance: styles.statusBadgeMaintenance,
};

/** Pill status chip for DataTable cells (Active / Closed / Pending / Locked / Maintenance). */
export const DataTableStatusBadge = ({ variant, children }: DataTableStatusBadgeProps) => (
  <span className={clsx(styles.statusBadge, VARIANT_CLASS[variant])}>{children}</span>
);
