/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { TFunction } from 'i18next';
import type { ReactElement } from 'react';

import { ASC, DEFAULT } from '../../../constants';
import type { DomainAccountQuota } from '../../../services/domain-quota-report';
import {
  type AccountListEntry,
  parseAccountListDirectory,
} from '../../../services/use-account-list-directory';
import {
  getExactPercentage,
  getPercentage,
  humanFileSize,
} from '../../edit-account/parts/size-utils';

export type QuotaSortOrder = 'asc' | 'desc';

export type QuotaRow = {
  id: string;
  columns: Array<ReactElement>;
  isOverQuota: boolean;
};

/** Account address -> `zimbraCOSId` (empty when the account has no explicit COS). */
export type AccountCosIds = Map<string, string>;

type CosEntry = { id: string; name: string };

const COS_NOT_AVAILABLE = '-';

/** SearchDirectory filter matching the given account addresses. */
export function buildAccountsQuery(emails: Array<string>): string {
  const clauses = emails.map((email) => `(mail=${email.replaceAll(/[\\*()]/g, '')})`);
  return `(|${clauses.join('')})`;
}

export function buildAccountCosIds(res: unknown): AccountCosIds {
  const entries: Array<AccountListEntry> = parseAccountListDirectory(res);
  return new Map(
    entries.map((entry) => {
      const attributes = (entry.a as Array<{ n?: string; _content?: string }> | undefined) ?? [];
      return [entry.name, attributes.find((attr) => attr.n === 'zimbraCOSId')?._content ?? ''];
    }),
  );
}

/**
 * Name of the COS assigned to an account. Accounts without an explicit COS use the COS named
 * `default`. Returns an empty string while the data is still loading.
 */
export function resolveCosName(
  email: string,
  cosIds: AccountCosIds | undefined,
  cosList: Array<CosEntry> | undefined,
): string {
  if (!cosIds || !cosList) {
    return '';
  }
  const cosId = cosIds.get(email);
  if (cosId === undefined) {
    return COS_NOT_AVAILABLE;
  }
  const effectiveCosId = cosId || cosList.find((cos) => cos.name === DEFAULT)?.id;
  return cosList.find((cos) => cos.id === effectiveCosId)?.name ?? COS_NOT_AVAILABLE;
}

/**
 * Used space over total limit, mirroring `getPercentage` for a zero limit (fully used).
 * Unlimited accounts have no meaningful percentage: they sort before every limited account.
 */
function getSortableRatio({ totalUsed, totalLimit }: DomainAccountQuota): number {
  if (totalLimit === 'unlimited') {
    return -1;
  }
  return totalLimit ? getExactPercentage(totalUsed, totalLimit) : 100;
}

export function sortByUsedPercentage(
  accounts: Array<DomainAccountQuota>,
  order: QuotaSortOrder,
): Array<DomainAccountQuota> {
  const direction = order === ASC ? 1 : -1;
  return accounts.toSorted((a, b) => direction * (getSortableRatio(a) - getSortableRatio(b)));
}

function QuotaText({ children }: Readonly<{ children: string }>) {
  return (
    <ds-text as="span" size="small" color="gray0" weight="light">
      {children}
    </ds-text>
  );
}

function formatUsedPercentage(account: DomainAccountQuota, t: TFunction): string {
  if (account.totalLimit === 'unlimited') {
    return t('label.unlimited', 'Unlimited');
  }
  return `${getPercentage(account.totalUsed, account.totalLimit)}%`;
}

export function buildQuotaRow(
  account: DomainAccountQuota,
  cosName: string,
  t: TFunction,
): QuotaRow {
  return {
    id: account.account,
    isOverQuota: account.totalLimit !== 'unlimited' && account.totalUsed > account.totalLimit,
    columns: [
      <QuotaText key={`${account.account}-account`}>{account.account}</QuotaText>,
      <QuotaText key={`${account.account}-cos`}>{cosName}</QuotaText>,
      <QuotaText key={`${account.account}-mails`}>{humanFileSize(account.mails, t)}</QuotaText>,
      <QuotaText key={`${account.account}-files`}>{humanFileSize(account.files, t)}</QuotaText>,
      <QuotaText key={`${account.account}-chats`}>{humanFileSize(account.chats, t)}</QuotaText>,
      <QuotaText key={`${account.account}-total`}>{formatUsedPercentage(account, t)}</QuotaText>,
    ],
  };
}
