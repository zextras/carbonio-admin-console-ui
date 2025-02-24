/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useAdvanceStore } from './store';

export const useIsAdvanced = (): boolean => useAdvanceStore((s) => s.isAdvanced);
export const getIsAdvanced = (): boolean => useAdvanceStore.getState().isAdvanced;
