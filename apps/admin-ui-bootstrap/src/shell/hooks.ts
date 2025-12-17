/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useUtilityBarStore } from '../utility-bar';

export const usePrimaryBarState = (): boolean => useUtilityBarStore((s) => s.primaryBarState);
