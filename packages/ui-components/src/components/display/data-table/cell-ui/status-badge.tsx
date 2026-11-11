/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from 'react';

import { StatusBadge, type StatusBadgeTone } from '../../status-badge';

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

const VARIANT_TONE: Record<DataTableStatusBadgeVariant, StatusBadgeTone> = {
  active: 'success',
  closed: 'neutral',
  pending: 'warning',
  locked: 'danger',
  maintenance: 'info',
};

/** DataTable cell wrapper around shared {@link StatusBadge}. */
export const DataTableStatusBadge = ({ variant, children }: DataTableStatusBadgeProps) => (
  <StatusBadge tone={VARIANT_TONE[variant]}>{children}</StatusBadge>
);
