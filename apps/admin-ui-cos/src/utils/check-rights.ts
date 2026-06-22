/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { find } from 'lodash-es';

import { COS, CREATE_COS, GLOBAL, LIST_COS } from '../constants';

export type RightEntry = {
  all?: Array<{
    getAttrs?: Array<{ all?: boolean }>;
    setAttrs?: Array<{ all?: boolean }>;
    right?: Array<{ n: string }>;
  }>;
  type: string;
};

export function checkShowCOS(rights: RightEntry[] | undefined): boolean {
  const rightsConfig = find(rights, { type: COS }) ?? { all: [], type: COS };
  return !!(
    rightsConfig?.all?.[0]?.getAttrs?.[0]?.all ??
    rightsConfig?.all?.[0]?.setAttrs?.[0]?.all ??
    find(rightsConfig?.all?.[0]?.right, { n: LIST_COS })
  );
}

export function checkCreateCosRight(rights: RightEntry[] | undefined): boolean {
  const rightsConfig = find(rights, { type: GLOBAL }) ?? { all: [], type: GLOBAL };
  return !!(
    rightsConfig?.all?.[0]?.getAttrs?.[0]?.all ??
    rightsConfig?.all?.[0]?.setAttrs?.[0]?.all ??
    find(rightsConfig?.all?.[0]?.right, { n: CREATE_COS })
  );
}
