/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type StatusBadgeTone = 'success' | 'neutral' | 'warning' | 'danger' | 'info';

/** Known status / label strings → semantic tone (sandbox `stMap`). */
const LABEL_TONE_MAP: Record<string, StatusBadgeTone> = {
  Active: 'success',
  Online: 'success',
  Completed: 'success',
  On: 'success',
  Locked: 'danger',
  Held: 'danger',
  Offline: 'danger',
  Suspended: 'danger',
  Failed: 'danger',
  Pending: 'warning',
  Deferred: 'warning',
  Restricted: 'warning',
  Trial: 'warning',
  Closed: 'neutral',
  Internal: 'neutral',
  'Not enabled': 'neutral',
  Off: 'neutral',
  Maintenance: 'info',
  Public: 'info',
};

/**
 * Resolve a semantic badge tone from a known status label.
 * Unknown labels fall back to `neutral`.
 */
export function getStatusBadgeTone(label: string): StatusBadgeTone {
  return LABEL_TONE_MAP[label] ?? 'neutral';
}
