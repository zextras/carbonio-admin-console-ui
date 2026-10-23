/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { TFunction } from 'i18next';
import type { ReactElement } from 'react';

import type { Attribute } from '../../../../types/attribute';
import { ZIMBRA_DOMAIN_COS_MAX_ACCOUNTS } from '../../../constants';
import type { CosAccountCount } from '../../../services/use-count-account';
import { QuotaText } from './domain-quota-rows';

const UNLIMITED_MAX_ACCOUNTS = '-1';
const NOT_SET = '-';

type CosEntry = { id: string; name: string };

export type CosLimitEntry = {
  name: string;
  /** Accounts of the domain currently assigned to the COS. */
  used: number;
  /** Max accounts the domain can assign to the COS, `undefined` when the COS is not linked. */
  maxAccounts: string | undefined;
};

export type CosLimitRow = {
  id: string;
  columns: Array<ReactElement>;
};

/**
 * COSes linked to the domain (`zimbraDomainCOSMaxAccounts`, stored as `cosId:max`) united with the
 * COSes that currently have accounts of the domain assigned.
 */
export function buildCosLimitEntries(
  domainAttributes: Array<Attribute> | undefined,
  cosList: Array<CosEntry> | undefined,
  counts: Array<CosAccountCount> | undefined,
): Array<CosLimitEntry> {
  const entries = new Map<string, CosLimitEntry>();

  (domainAttributes ?? [])
    .filter((attribute) => attribute.n === ZIMBRA_DOMAIN_COS_MAX_ACCOUNTS)
    .forEach((attribute) => {
      const [cosId, maxAccounts = UNLIMITED_MAX_ACCOUNTS] = attribute._content.split(':');
      const name = cosList?.find((cos) => cos.id === cosId)?.name ?? cosId;
      entries.set(name, { name, used: 0, maxAccounts });
    });

  (counts ?? []).forEach(({ name, count }) => {
    const linked = entries.get(name);
    if (linked || count > 0) {
      entries.set(name, { name, used: count, maxAccounts: linked?.maxAccounts });
    }
  });

  return [...entries.values()].toSorted((a, b) => a.name.localeCompare(b.name));
}

function formatMaxAccounts(maxAccounts: string | undefined, t: TFunction): string {
  if (maxAccounts === undefined) {
    return NOT_SET;
  }
  return maxAccounts === UNLIMITED_MAX_ACCOUNTS ? t('label.unlimited', 'Unlimited') : maxAccounts;
}

export function buildCosLimitRow(entry: CosLimitEntry, t: TFunction): CosLimitRow {
  return {
    id: entry.name,
    columns: [
      <QuotaText key={`${entry.name}-name`}>{entry.name}</QuotaText>,
      <QuotaText key={`${entry.name}-used`}>{String(entry.used)}</QuotaText>,
      <QuotaText key={`${entry.name}-max`}>{formatMaxAccounts(entry.maxAccounts, t)}</QuotaText>,
    ],
  };
}
