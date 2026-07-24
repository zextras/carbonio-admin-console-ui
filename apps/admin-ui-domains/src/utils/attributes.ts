/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Attribute } from '../../types';

export function attributesToObject(attributes: Array<Attribute>): Record<string, string> {
  const map: Record<string, string> = {};
  attributes.forEach((attr) => {
    map[attr.n] = attr._content;
  });
  return map;
}

type DomainAttributes = {
  zimbraDomainType: string;
  zimbraDomainStatus: string;
  zimbraDomainName: string;
  zimbraId: string;
};

export function parseDomainAttributes(attributes: Array<Attribute>): DomainAttributes {
  const map = attributesToObject(attributes);
  return {
    zimbraDomainType: map.zimbraDomainType ?? '',
    zimbraDomainStatus: map.zimbraDomainStatus ?? 'active',
    zimbraDomainName: map.zimbraDomainName ?? '',
    zimbraId: map.zimbraId ?? '',
  };
}
