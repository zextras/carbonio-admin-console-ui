/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { find } from 'lodash-es';

import { CONFIG } from '../constants';

export type RightEntry = {
  all?: Array<{
    setAttrs?: Array<{ all?: boolean }>;
    getAttrs?: Array<{ all?: boolean }>;
  }>;
  type: string;
};

export function checkAllowSetBackup(rights: Array<RightEntry> | undefined): boolean {
  const rightsConfig = find(rights, { type: CONFIG });
  return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
}
