/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { TFunction } from 'i18next';
import type { ReactElement } from 'react';

import type { Attribute } from '../../../../types/attribute';
import { ASC, DEFAULT, ZIMBRA_DOMAIN_DEFAULT_COS_ID } from '../../../constants';
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
  clickable: boolean;
};

/** Directory data of an account: its id and `zimbraCOSId` (empty when no explicit COS). */
export type AccountDirectoryInfo = { id: string; cosId: string };

/** Account address -> directory data. */
export type AccountDirectoryInfos = Map<string, AccountDirectoryInfo>;

type CosEntry = { id: string; name: string };

const COS_NOT_AVAILABLE = '-';

/** SearchDirectory filter matching the given account addresses. */
export function buildAccountsQuery(emails: Array<string>): string {
  const clauses = emails.map((email) => `(mail=${email.replaceAll(/[\\*()]/g, '')})`);
  return `(|${clauses.join('')})`;
}

/** SearchDirectory filter matching the system accounts (galsync, spam, ham, quarantine...). */
export const SYSTEM_ACCOUNTS_QUERY = '(zimbraIsSystemAccount=TRUE)';

export function buildAccountNames(res: unknown): Set<string> {
  return new Set(parseAccountListDirectory(res).map((entry) => entry.name));
}

/** Accounts of the report without the excluded ones, all of them while the exclusions are unknown. */
export function excludeAccounts(
  accounts: Array<DomainAccountQuota>,
  excludedNames: Set<string> | undefined,
): Array<DomainAccountQuota> {
  return excludedNames
    ? accounts.filter((account) => !excludedNames.has(account.account))
    : accounts;
}

export function buildAccountDirectoryInfos(res: unknown): AccountDirectoryInfos {
  const entries: Array<AccountListEntry> = parseAccountListDirectory(res);
  return new Map(
    entries.map((entry) => {
      const attributes = (entry.a as Array<{ n?: string; _content?: string }> | undefined) ?? [];
      const cosId = attributes.find((attr) => attr.n === 'zimbraCOSId')?._content ?? '';
      return [entry.name, { id: entry.id, cosId }];
    }),
  );
}

/**
 * COS the accounts without an explicit COS belong to: the default COS of the domain, or the COS
 * named `default` when the domain has none.
 */
export function getInheritedCosId(
  domainAttributes: Array<Attribute> | undefined,
  cosList: Array<CosEntry> | undefined,
): string | undefined {
  const domainDefaultCosId = domainAttributes?.find(
    (attribute) => attribute.n === ZIMBRA_DOMAIN_DEFAULT_COS_ID,
  )?._content;
  return domainDefaultCosId || cosList?.find((cos) => cos.name === DEFAULT)?.id;
}

/**
 * Name of the COS assigned to an account. Accounts without an explicit COS use the inherited COS.
 * Returns an empty string while the data is still loading.
 */
export function resolveCosName(
  email: string,
  accountInfos: AccountDirectoryInfos | undefined,
  cosList: Array<CosEntry> | undefined,
  inheritedCosId: string | undefined,
): string {
  if (!accountInfos || !cosList) {
    return '';
  }
  const cosId = accountInfos.get(email)?.cosId;
  if (cosId === undefined) {
    return COS_NOT_AVAILABLE;
  }
  const effectiveCosId = cosId || inheritedCosId;
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

export function QuotaText({ children }: Readonly<{ children: string }>) {
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
  clickable: boolean,
  t: TFunction,
): QuotaRow {
  return {
    id: account.account,
    isOverQuota: account.totalLimit !== 'unlimited' && account.totalUsed > account.totalLimit,
    clickable,
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
