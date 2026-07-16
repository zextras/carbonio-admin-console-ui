/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useUtilityBarStore } from '../utility-bar';

export const usePrimaryBarState = (): boolean => useUtilityBarStore((s) => s.primaryBarState);

/**
 * Returns the detail-view `max-width` (CSS string) that accounts for the primary
 * bar (sidebar) state: narrower (`981px`) when the sidebar is expanded, wider
 * (`1125px`) when collapsed. Shared so every app uses one source of truth
 * instead of re-declaring the `isPrimaryBarExpanded ? 981 : 1125` ternary.
 */
export const useDetailViewMaxWidth = (): string => {
  const isPrimaryBarExpanded = usePrimaryBarState();
  return isPrimaryBarExpanded ? '981px' : '1125px';
};
