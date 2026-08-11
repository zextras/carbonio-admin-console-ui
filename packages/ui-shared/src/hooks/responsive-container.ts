/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Breakpoint } from './use-breakpoint';

export type ResponsiveContainerOptions = {
  breakpoint: Breakpoint;
  isPrimaryBarExpanded?: boolean;
  sidePanelOffsetPx?: number;
  maxBaseWidthPx?: number;
};

const DEFAULT_MAX_BASE_WIDTH_PX = 1400;

function getBaseWidthPx(breakpoint: Breakpoint, isPrimaryBarExpanded: boolean): number {
  if (breakpoint === '2xl') return 1400;
  if (breakpoint === 'xl') return 1125;
  if (breakpoint === 'lg' && !isPrimaryBarExpanded) return 1125;
  return 981;
}

export function getResponsiveMaxWidth({
  breakpoint,
  isPrimaryBarExpanded = false,
  sidePanelOffsetPx = 0,
  maxBaseWidthPx = DEFAULT_MAX_BASE_WIDTH_PX,
}: ResponsiveContainerOptions): string {
  const base = Math.min(getBaseWidthPx(breakpoint, isPrimaryBarExpanded), maxBaseWidthPx);
  return sidePanelOffsetPx > 0 ? `calc(${base}px - ${sidePanelOffsetPx}px)` : `${base}px`;
}

export function getResponsiveContainerStyle(opts: ResponsiveContainerOptions) {
  return {
    width: '100%',
    maxWidth: getResponsiveMaxWidth(opts),
    transition: 'max-width 300ms',
    padding: '0 clamp(0.5rem, 2vw, 2rem)',
    boxSizing: 'border-box' as const,
  };
}
