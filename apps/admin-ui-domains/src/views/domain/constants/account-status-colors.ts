/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { TFunction } from 'i18next';

export const getAccountStatusColors = (
  t: TFunction,
): Record<string, { color: string; label: string }> => ({
  active: { color: '#8BC34A', label: t('label.active', 'Active') },
  maintenance: { color: '#2196D3', label: t('label.in_maintenance', 'In maintenance') },
  locked: { color: '#D74942', label: t('label.locked', 'Locked') },
  closed: { color: '#828282', label: t('label.closed', 'Closed') },
  pending: { color: '#828282', label: t('label.pending', 'Pending') },
  lockout: { color: '#D74942', label: t('label.lockout', 'Lockout') },
});
