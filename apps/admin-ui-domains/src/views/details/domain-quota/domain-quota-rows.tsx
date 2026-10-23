/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { TFunction } from 'i18next';
import type { ReactElement } from 'react';

import { ASC } from '../../../constants';
import type { DomainAccountQuota } from '../../../services/domain-quota-report';
import {
  getExactPercentage,
  getPercentage,
  humanFileSize,
} from '../../edit-account/parts/size-utils';

export type QuotaSortOrder = 'asc' | 'desc';

export type QuotaRow = {
  id: string;
  columns: Array<ReactElement>;
};

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

export function buildQuotaRow(account: DomainAccountQuota, t: TFunction): QuotaRow {
  return {
    id: account.account,
    columns: [
      <QuotaText key={`${account.account}-account`}>{account.account}</QuotaText>,
      <QuotaText key={`${account.account}-mails`}>{humanFileSize(account.mails, t)}</QuotaText>,
      <QuotaText key={`${account.account}-files`}>{humanFileSize(account.files, t)}</QuotaText>,
      <QuotaText key={`${account.account}-chats`}>{humanFileSize(account.chats, t)}</QuotaText>,
      <QuotaText key={`${account.account}-total`}>{formatUsedPercentage(account, t)}</QuotaText>,
    ],
  };
}
