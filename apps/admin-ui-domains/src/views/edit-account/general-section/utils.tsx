/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { type CreateSnackbarFnArgs } from '@zextras/ui-components';
import type { TFunction } from 'i18next';

import type { Attribute, objectType } from '../../../../types';
import { formatZimbraDate } from '../../utility/utils';

export type UserSession = {
  name: string;
  sid: string;
  zid: string;
  ip: string;
  service: string;
};

const ZimbraAuthMethod = {
  INTERNAL: 'zimbra',
  LDAP: 'ldap',
  EXTERNAL: 'ad',
} as const;

export function domainAttrsToObject(attrs: Array<Attribute>): objectType {
  const obj: objectType = {};
  attrs.forEach((item: Attribute) => {
    obj[item?.n] = item._content;
  });
  return obj;
}

export function isLdapAuthWithoutFallback(attrs: Array<Attribute> | undefined): boolean {
  if (!attrs || attrs.length === 0) {
    return false;
  }
  const obj = domainAttrsToObject(attrs);
  return obj.zimbraAuthMech === ZimbraAuthMethod.LDAP && obj.zimbraAuthFallbackToLocal !== 'TRUE';
}

export function hasExternalLdapUrl(attrs: Array<Attribute> | undefined): boolean {
  if (!attrs || attrs.length === 0) {
    return false;
  }
  const obj = domainAttrsToObject(attrs);
  return obj.zimbraAuthLdapURL !== undefined && obj.zimbraAuthLdapURL !== '';
}

export function getAccountUserType(
  isAdmin: boolean,
  isDelegatedAdmin: boolean,
  isExternal: boolean,
  isSystem: boolean,
): string {
  if (isAdmin) return 'Admin';
  if (isDelegatedAdmin) return 'DelegatedAdmin';
  if (isExternal) return 'External';
  if (isSystem) return 'System';
  return 'Normal';
}

export function filterSessions(list: Array<UserSession>, filter: string): Array<UserSession> {
  if (!filter) {
    return list;
  }
  return list.filter(
    (item: UserSession) => item?.name.includes(filter) || item?.sid.includes(filter),
  );
}

export function formatZimbraDateOr(timestamp: string | undefined | null, fallback: string): string {
  return timestamp ? formatZimbraDate(timestamp) : fallback;
}

export function somethingWrongSnackbarConfig(
  error: { message?: string },
  t: TFunction,
): CreateSnackbarFnArgs {
  return {
    key: 'error',
    severity: 'error',
    label:
      error?.message ?? t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
    autoHideTimeout: 3000,
    hideButton: true,
    replace: true,
  };
}
