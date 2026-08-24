/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { TFunction } from 'i18next';

import type { Attribute, Server } from '../../../../../types';
import { FALSE } from '../../../../constants';

export type GalAccount = {
  id: string;
  name: string;
  zimbraMailHost?: string;
  zimbraDataSourceGalPollingInterval?: string;
};

export type ServerGalRow = {
  id: string;
  name: string;
  galAccount: {
    id: string;
    name: string;
    server: string;
  } | null;
};

export type GalDataSource = {
  id: string;
  name: string;
  type: string;
  zimbraDataSourcePollingInterval?: string;
};

export function buildDomainAttrMap(
  domainInformation: Array<{ n: string; _content?: string }> | undefined,
): Record<string, string> {
  const obj: Record<string, string> = {};
  if (!domainInformation?.length) return obj;
  domainInformation.forEach((item) => {
    if (!obj[item.n]) {
      obj[item.n] = item._content ?? '';
    }
  });
  return obj;
}

const POLLING_INTERVAL_RE = /^(\d+)([dhms]|ms)?$/;

export function parsePollingInterval(val: string): { digits: string; unit: string } {
  if (!val) {
    return { digits: '1', unit: 'd' };
  }
  const match = POLLING_INTERVAL_RE.exec(val);
  if (match) {
    return { digits: match[1], unit: match[2] ?? 'd' };
  }
  return { digits: '1', unit: 'd' };
}

export function formatPollingInterval(digits: string, unit: string): string {
  return `${digits}${unit}`;
}

export function buildServerGalRows(
  mailstores: Array<Server>,
  galAccounts: Array<GalAccount>,
): Array<ServerGalRow> {
  return mailstores.map((server) => {
    const matchingAccount = galAccounts.find((acc) => acc.zimbraMailHost === server.name);
    return {
      id: server.id ?? '',
      name: server.name ?? '',
      galAccount: matchingAccount
        ? {
            id: matchingAccount.id,
            name: matchingAccount.name,
            server: matchingAccount.zimbraMailHost ?? '',
          }
        : null,
    };
  });
}

export function getGalAccountIds(
  domainInformation: Array<Attribute> | undefined,
): Array<string> {
  if (!domainInformation?.length) return [];
  return domainInformation
    .filter((item) => item.n === 'zimbraGalAccountId' && item._content)
    .map((item) => item._content);
}

export function measureUnitItems(t: TFunction): Array<{ value: string; label: string }> {
  return [
    { label: t('domain.unit_measure_days', 'Days'), value: 'd' },
    { label: t('domain.unit_measure_hours', 'Hours'), value: 'h' },
    { label: t('domain.unit_measure_minutes', 'Minutes'), value: 'm' },
    { label: t('domain.unit_measure_seconds', 'Seconds'), value: 's' },
  ];
}

export function buildGalDomainAttributes(
  values: {
    zimbraGalMode: string;
    zimbraGalMaxResults: string;
    zimbraGalLdapPageSize: string;
    zimbraGalLdapURL: string;
    zimbraGalLdapStartTlsEnabled: string;
    zimbraGalLdapFilter: string;
    zimbraGalLdapSearchBase: string;
    zimbraGalLdapBindDn: string;
    zimbraGalLdapBindPassword: string;
    zimbraGalLdapAuthMech: string;
  },
): Array<{ n: string; _content: string }> {
  return [
    { n: 'zimbraGalMaxResults', _content: values.zimbraGalMaxResults },
    { n: 'zimbraGalLdapPageSize', _content: values.zimbraGalLdapPageSize },
    { n: 'zimbraGalMode', _content: values.zimbraGalMode },
    { n: 'zimbraGalLdapURL', _content: values.zimbraGalLdapURL },
    { n: 'zimbraGalLdapStartTlsEnabled', _content: values.zimbraGalLdapStartTlsEnabled },
    { n: 'zimbraGalLdapFilter', _content: values.zimbraGalLdapFilter },
    { n: 'zimbraGalLdapSearchBase', _content: values.zimbraGalLdapSearchBase },
    { n: 'zimbraGalLdapBindDn', _content: values.zimbraGalLdapBindDn },
    { n: 'zimbraGalLdapBindPassword', _content: values.zimbraGalLdapBindPassword },
    { n: 'zimbraGalLdapAuthMech', _content: values.zimbraGalLdapAuthMech },
  ];
}

export function getDefaultGalFormValues(
  domainAttrMap: Record<string, string>,
  pollingInterval: { digits: string; unit: string },
): {
  zimbraGalMode: string;
  zimbraGalMaxResults: string;
  zimbraGalLdapPageSize: string;
  zimbraGalLdapURL: string;
  zimbraGalLdapStartTlsEnabled: string;
  zimbraGalLdapFilter: string;
  zimbraGalLdapSearchBase: string;
  zimbraGalLdapBindDn: string;
  zimbraGalLdapBindPassword: string;
  zimbraGalLdapAuthMech: string;
  freqDigits: string;
  freqUnit: string;
} {
  return {
    zimbraGalMode: domainAttrMap.zimbraGalMode ?? 'zimbra',
    zimbraGalMaxResults: domainAttrMap.zimbraGalMaxResults ?? '',
    zimbraGalLdapPageSize: domainAttrMap.zimbraGalLdapPageSize ?? '',
    zimbraGalLdapURL: domainAttrMap.zimbraGalLdapURL ?? '',
    zimbraGalLdapStartTlsEnabled: domainAttrMap.zimbraGalLdapStartTlsEnabled ?? FALSE,
    zimbraGalLdapFilter: domainAttrMap.zimbraGalLdapFilter ?? '',
    zimbraGalLdapSearchBase: domainAttrMap.zimbraGalLdapSearchBase ?? '',
    zimbraGalLdapBindDn: domainAttrMap.zimbraGalLdapBindDn ?? '',
    zimbraGalLdapBindPassword: domainAttrMap.zimbraGalLdapBindPassword ?? '',
    zimbraGalLdapAuthMech: domainAttrMap.zimbraGalLdapAuthMech ?? 'none',
    freqDigits: pollingInterval.digits,
    freqUnit: pollingInterval.unit,
  };
}
