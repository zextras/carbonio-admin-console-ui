/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { TFunction } from 'i18next';

import { DISABLED, ENABLED } from '../../../constants';
import {
  type DomainAuthenticationFormValues,
  ZIMBRA_AUTH_METHOD,
} from './schema';

export type AuthMethodItem = {
  label: string;
  value: string;
  info_label: string;
  info_label_ce: string;
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

export function getAuthMethodItems(t: TFunction): Array<AuthMethodItem> {
  const localLdapTrans = t(
    'label.method_allows_local_ldap_only',
    'This method allows usage of Local LDAP',
  );

  return [
    {
      label: t('label.carbonio', 'Carbonio'),
      value: ZIMBRA_AUTH_METHOD.CARBONIO,
      info_label: t(
        'domain.authentication.carbonio_info',
        'This method allows usage of Local LDAP, External AD/LDAP, Credential Password and SAML.',
      ),
      info_label_ce: localLdapTrans,
    },
    {
      label: t('label.local_ldap_only', 'Local LDAP only'),
      value: ZIMBRA_AUTH_METHOD.INTERNAL,
      info_label: localLdapTrans,
      info_label_ce: localLdapTrans,
    },
    {
      label: t('label.external_ldap_only', 'External LDAP only'),
      value: ZIMBRA_AUTH_METHOD.LDAP,
      info_label: t('label.external_ldap_only_infor', 'This method allows usage of external LDAP'),
      info_label_ce: t(
        'label.external_ldap_only_info_ce',
        'This method allows usage of external LDAP',
      ),
    },
    {
      label: t('label.external_ad_only', 'External AD only'),
      value: ZIMBRA_AUTH_METHOD.EXTERNAL,
      info_label: t('label.external_ad_only_info', 'This method allows usage of external AD'),
      info_label_ce: t('label.external_ad_only_info_ce', 'This method allows usage of external AD'),
    },
  ];
}

export function getDefaultAuthFormValues(
  domainAttrMap: Record<string, string>,
): DomainAuthenticationFormValues {
  return {
    zimbraAuthMech: domainAttrMap.zimbraAuthMech ?? ZIMBRA_AUTH_METHOD.CARBONIO,
    zimbraPasswordChangeListener: domainAttrMap.zimbraPasswordChangeListener ?? '',
    zimbraAuthFallbackToLocal: domainAttrMap.zimbraAuthFallbackToLocal === 'TRUE',
    zimbraAuthLdapURL: domainAttrMap.zimbraAuthLdapURL ?? '',
    zimbraAuthLdapSearchBindDn: domainAttrMap.zimbraAuthLdapSearchBindDn ?? '',
    zimbraAuthLdapSearchBindPassword: domainAttrMap.zimbraAuthLdapSearchBindPassword ?? '',
    zimbraAuthLdapStartTlsEnabled: domainAttrMap.zimbraAuthLdapStartTlsEnabled === 'TRUE',
    zimbraAuthLdapSearchFilter: domainAttrMap.zimbraAuthLdapSearchFilter ?? '',
    zimbraAuthLdapSearchBase: domainAttrMap.zimbraAuthLdapSearchBase ?? '',
    zimbraFeatureResetPasswordStatus: domainAttrMap.zimbraFeatureResetPasswordStatus === ENABLED,
  };
}

export function buildAuthDomainAttributes(
  values: DomainAuthenticationFormValues,
  isAdvanced: boolean,
): Array<{ n: string; _content: string }> {
  const attributes: Array<{ n: string; _content: string }> = [
    { n: 'zimbraAuthMech', _content: values.zimbraAuthMech },
    { n: 'zimbraPasswordChangeListener', _content: values.zimbraPasswordChangeListener },
    {
      n: 'zimbraAuthFallbackToLocal',
      _content: values.zimbraAuthFallbackToLocal ? 'TRUE' : 'FALSE',
    },
    { n: 'zimbraAuthLdapURL', _content: values.zimbraAuthLdapURL },
    { n: 'zimbraAuthLdapSearchBindDn', _content: values.zimbraAuthLdapSearchBindDn },
    { n: 'zimbraAuthLdapSearchBindPassword', _content: values.zimbraAuthLdapSearchBindPassword },
    {
      n: 'zimbraAuthLdapStartTlsEnabled',
      _content: values.zimbraAuthLdapStartTlsEnabled ? 'TRUE' : 'FALSE',
    },
    { n: 'zimbraAuthLdapSearchFilter', _content: values.zimbraAuthLdapSearchFilter },
    { n: 'zimbraAuthLdapSearchBase', _content: values.zimbraAuthLdapSearchBase },
  ];

  if (isAdvanced) {
    attributes.push({
      n: 'zimbraFeatureResetPasswordStatus',
      _content: values.zimbraFeatureResetPasswordStatus ? ENABLED : DISABLED,
    });
  }

  return attributes;
}

export function ldapUrlTooltipItems(t: TFunction, authMech: string): Array<{ label: string }> {
  const portHint = authMech === ZIMBRA_AUTH_METHOD.EXTERNAL ? '[:3268]' : '[:389]';
  return [
    {
      label: `${t('label.ex', 'ex.')} ldap[s]://${t(
        'label.external_ldap_server',
        'external-ldap-server',
      )}${portHint}`,
    },
  ];
}

export function filterTooltipItems(t: TFunction): Array<{ label: string }> {
  return [{ label: `${t('label.ex', 'ex.')} (ou=text)` }];
}
