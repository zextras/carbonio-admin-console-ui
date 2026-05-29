/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SelectItem } from '@zextras/ui-components';

import { Attribute } from '../../../../types/attribute';

export function findSelectItemWithFallback(
  selectItems: SelectItem[],
  value: string,
): SelectItem<string> {
  return selectItems.find((item) => item.value === value) || selectItems[-1];
}

export function buildCosDataMap(
  cosInformation: Array<Attribute> | undefined,
  allowedKeys?: Set<string>,
): Record<string, string> {
  const map: Record<string, string> = {};
  if (!cosInformation?.length) return map;
  cosInformation.forEach((item) => {
    if (item?.n && (!allowedKeys || allowedKeys.has(item.n))) {
      map[item.n] = item._content;
    }
  });
  return map;
}
