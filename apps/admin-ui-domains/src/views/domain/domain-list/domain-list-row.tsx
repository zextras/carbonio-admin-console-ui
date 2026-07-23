/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactElement } from 'react';

import type { Attribute } from '../../../../types';
import { parseDomainAttributes } from '../../../utils/attributes';
import { getStatusDisplay } from '../../../utils/status';

type TFunc = (key: string, defaultValue: string) => string;

export type ZimbraDomain = {
  name: string;
  id: string;
  a: Attribute[];
};

export type ZimbraDomainEntry = {
  name: string;
  id: string;
  a: Attribute[];
  zimbraDomainType: string;
  zimbraDomainStatus: string;
  zimbraDomainName: string;
  zimbraId: string;
};

export type DomainRow = {
  id: string;
  columns: Array<ReactElement>;
  item: ZimbraDomainEntry;
  clickable: boolean;
  onClick: () => void;
};

export function buildDomainRow(
  item: ZimbraDomain,
  t: TFunc,
  onSelect: (domain: ZimbraDomainEntry) => void,
): DomainRow {
  const parsed = parseDomainAttributes(item.a ?? []);
  const domainItem: ZimbraDomainEntry = {
    name: item.name,
    id: item.id,
    a: item.a,
    ...parsed,
  };
  const { color: statusColor, label: statusLabel } = getStatusDisplay(
    domainItem.zimbraDomainStatus,
    t,
  );
  return {
    id: item.id,
    columns: [
      <ds-text
        as="span"
        size="small"
        key={`${item.id}-name`}
        color="gray0"
        weight="regular"
      >
        {item.name || ' '}
      </ds-text>,

      <ds-text
        as="span"
        size="small"
        weight="light"
        key={`${item.id}-status`}
        color={statusColor}
      >
        {statusLabel}
      </ds-text>,
    ],
    item: domainItem,
    clickable: true,
    onClick: (): void => {
      onSelect(domainItem);
    },
  };
}
