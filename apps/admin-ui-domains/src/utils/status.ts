/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { StatusBadgeTone } from '@zextras/ui-components';

const STATUS_CONFIG = {
  active: { color: 'success', labelKey: 'label.active', labelDefault: 'Active' },
  maintenance: {
    color: 'info',
    labelKey: 'label.maintenance',
    labelDefault: 'Maintenance',
  },
  locked: { color: 'error', labelKey: 'label.locked', labelDefault: 'Locked' },
  closed: { color: 'gray1', labelKey: 'label.closed', labelDefault: 'Closed' },
  pending: { color: 'gray1', labelKey: 'label.pending', labelDefault: 'Pending' },
  lockout: { color: 'error', labelKey: 'label.lockout', labelDefault: 'Lockout' },
  suspended: { color: 'error', labelKey: 'label.suspended', labelDefault: 'Suspended' },
} as const;

type StatusConfigEntry = (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG];

type TFunc = (key: string, defaultValue: string) => string;

type StatusDisplay = {
  color: StatusConfigEntry['color'] | 'gray1';
  label: string;
};

const STATUS_BADGE_TONE: Record<keyof typeof STATUS_CONFIG, StatusBadgeTone> = {
  active: 'success',
  maintenance: 'info',
  pending: 'warning',
  locked: 'danger',
  lockout: 'danger',
  suspended: 'danger',
  closed: 'neutral',
};

export function getStatusDisplay(status: string, t: TFunc): StatusDisplay {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  if (!config) {
    return { color: 'gray1', label: status };
  }
  return {
    color: config.color,
    label: t(config.labelKey, config.labelDefault),
  };
}

/** Map `zimbraAccountStatus` API values to shared StatusBadge tones. */
export function getAccountStatusBadgeTone(status: string): StatusBadgeTone {
  return STATUS_BADGE_TONE[status as keyof typeof STATUS_BADGE_TONE] ?? 'neutral';
}
