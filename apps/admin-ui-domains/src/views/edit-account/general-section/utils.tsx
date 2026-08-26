/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { type CreateSnackbarFnArgs,Padding, Row } from '@zextras/ui-components';
import type { TFunction } from 'i18next';
import type { ReactElement } from 'react';

import type { Attribute, objectType } from '../../../../types';
import { MAX_DOMAIN_DISPLAY } from '../../../constants';
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

export function buildDomainDropdownItems(
  domainList: Array<objectType>,
  onSelectedDomain: (domain: string) => void,
  t: TFunction,
): Array<{ id?: string; label?: string; customComponent: ReactElement }> {
  if (domainList.length > MAX_DOMAIN_DISPLAY) {
    return [
      {
        customComponent: (
          <>
            <Row mainAlignment="flex-start">
              <Padding horizontal="small">
                <ds-icon icon="InfoOutline" style={{ width: '20px', height: '20px' }}></ds-icon>
              </Padding>
            </Row>
            <Row mainAlignment="flex-start" width="100%" padding={{ all: 'small' }}>
              <ds-text as="p" overflow="break-word">
                {t(
                  'many_domain_info_msg',
                  'So many domains! Which one would you like to see? Start typing to filter.',
                )}
              </ds-text>
            </Row>
          </>
        ),
      },
    ];
  }

  return domainList.map((domain: objectType) => ({
    id: domain.id,
    label: domain.name,
    customComponent: (
      <Row
        style={{
          display: 'block',
          textAlign: 'left',
          height: 'inherit',
          padding: '3px',
          width: 'inherit',
        }}
        onClick={(): void => onSelectedDomain(domain?.name)}
      >
        {domain?.name}
      </Row>
    ),
  }));
}
