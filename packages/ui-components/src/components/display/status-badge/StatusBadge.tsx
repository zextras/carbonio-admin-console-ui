/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import type { ReactNode } from 'react';

import { getStatusBadgeTone, type StatusBadgeTone } from './get-status-badge-tone';
import styles from './StatusBadge.module.css';

export type StatusBadgeProps = {
  /**
   * Semantic color tone. When omitted and `label` is set, tone is resolved
   * via {@link getStatusBadgeTone}; otherwise defaults to `neutral`.
   */
  tone?: StatusBadgeTone;
  /** Visible text; also used for tone auto-resolution when `tone` is omitted. */
  label?: string;
  /** Alternative to `label`. */
  children?: ReactNode;
  className?: string;
};

const TONE_CLASS: Record<StatusBadgeTone, string> = {
  success: styles.success,
  neutral: styles.neutral,
  warning: styles.warning,
  danger: styles.danger,
  info: styles.info,
};

/**
 * Pill status badge matching the DataTable sandbox (bordered, 999 radius).
 * Pass `tone` explicitly, or pass a known `label` to auto-map (Active → success, etc.).
 */
export const StatusBadge = ({ tone, label, children, className }: StatusBadgeProps) => {
  const resolvedTone = tone ?? (label !== undefined ? getStatusBadgeTone(label) : 'neutral');
  const content = children ?? label;

  return (
    <span className={clsx(styles.badge, TONE_CLASS[resolvedTone], className)}>{content}</span>
  );
};

export type { StatusBadgeTone } from './get-status-badge-tone';
export { getStatusBadgeTone } from './get-status-badge-tone';
