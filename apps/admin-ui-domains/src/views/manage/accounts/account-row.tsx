/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Tooltip } from '@zextras/ui-components';
import type { TFunction } from 'i18next';
import type { ReactElement } from 'react';

import type { AccountListEntry } from '../../../services/use-account-list-directory';
import { getStatusDisplay } from '../../../utils/status';

export type AccountRowItem = AccountListEntry & Record<string, unknown>;

export type AccountRow = {
  id: string;
  columns: Array<ReactElement>;
  item: AccountRowItem;
  clickable: boolean;
};

type AccountAttribute = { n?: string; _content?: string; pd?: boolean };

const ACCOUNT_TYPE_FLAGS: Array<[key: string, label: string]> = [
  ['zimbraIsAdminAccount', 'Admin'],
  ['zimbraIsDelegatedAdminAccount', 'DelegatedAdmin'],
  ['zimbraIsExternalVirtualAccount', 'External'],
  ['zimbraIsSystemAccount', 'System'],
];

export function getAccountUserType(item: AccountRowItem): string {
  const matchedType = ACCOUNT_TYPE_FLAGS.find(([flag]) => item[flag] === 'TRUE');
  return matchedType ? matchedType[1] : 'Normal';
}

export function flattenAccountAttributes(item: AccountListEntry): AccountRowItem {
  const flattened: Record<string, unknown> = { ...item };
  const attributes = (item.a as Array<AccountAttribute> | undefined) ?? [];
  attributes.forEach((attribute) => {
    const name = attribute?.n;
    if (!name) {
      return;
    }
    if (name === 'mail') {
      if (Array.isArray(flattened.mail)) {
        (flattened.mail as Array<string>).push(attribute._content ?? '');
      } else {
        flattened.mail = [attribute._content ?? ''];
      }
    } else if (name === 'zimbraIsAdminAccount' && attribute?.pd === true) {
      flattened[name] = 'TRUE';
    } else {
      flattened[name] = attribute?._content;
    }
  });
  return flattened as AccountRowItem;
}

export function buildAccountRow(
  item: AccountListEntry,
  t: TFunction,
  onSelect: (account: AccountRowItem) => void,
): AccountRow {
  const accountItem = flattenAccountAttributes(item);
  const mailAddresses = (accountItem.mail as Array<string> | undefined) ?? [];
  const aliasCount = Math.max(mailAddresses.length - 1, 0);
  const status = accountItem.zimbraAccountStatus as string | undefined;
  const { color: statusColor, label: statusLabel } = getStatusDisplay(status ?? '', t);

  const openAccount = (): void => {
    onSelect(accountItem);
  };

  const columns: Array<ReactElement> = [
    <ds-text
      as="span"
      size="small"
      key={`${item.id}-email`}
      color="gray0"
      weight="regular"
      onClick={openAccount}
    >
      {item?.name || ' '}
    </ds-text>,
    <ds-text
      as="span"
      size="small"
      key={`${item.id}-displayName`}
      color="gray0"
      weight="light"
      onClick={openAccount}
    >
      {(accountItem.displayName as string | undefined) || ' '}
    </ds-text>,
    aliasCount > 0 ? (
      <Tooltip
        key={`${item.id}-aliases`}
        placement="bottom"
        label={mailAddresses.slice(1).join(', ')}
        maxWidth="auto"
      >
        <ds-text
          as="span"
          size="small"
          weight="light"
          key={`${item.id}-aliases-count`}
          color="#828282"
          onClick={openAccount}
        >
          {aliasCount}
        </ds-text>
      </Tooltip>
    ) : (
      <ds-text
        as="span"
        size="small"
        key={`${item.id}-aliases`}
        color="#828282"
        weight="light"
        onClick={openAccount}
      >
        0
      </ds-text>
    ),
    <ds-text
      as="span"
      size="small"
      key={`${item.id}-type`}
      color="gray0"
      weight="light"
      onClick={openAccount}
    >
      {getAccountUserType(accountItem)}
    </ds-text>,
    <ds-text
      as="span"
      size="small"
      weight="light"
      key={`${item.id}-status`}
      color={statusColor}
      onClick={openAccount}
    >
      {statusLabel}
    </ds-text>,
    <Tooltip key={`${item.id}-description`} label={(accountItem.description as string) || '\u00a0'}>
      <ds-text
        as="span"
        size="small"
        weight="light"
        key={`${item.id}-description-text`}
        color="gray0"
        onClick={(event: { stopPropagation: () => void }): void => {
          event.stopPropagation();
          openAccount();
        }}
      >
        {(accountItem.description as string | undefined) ?? '\u00a0'}
      </ds-text>
    </Tooltip>,
  ];

  return {
    id: item.id,
    columns,
    item: accountItem,
    clickable: true,
  };
}
