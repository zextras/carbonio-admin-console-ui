/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMediaQuery } from './use-media-query';

export type Breakpoint = 'lg' | 'xl' | '2xl';

const BREAKPOINTS = {
  lg: 992,
  xl: 1200,
  '2xl': 1536,
};

export function useBreakpoint(): Breakpoint {
  const is2xl = useMediaQuery(`(min-width: ${BREAKPOINTS['2xl']}px)`);
  const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);
  const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);

  if (is2xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  return 'lg';
}
