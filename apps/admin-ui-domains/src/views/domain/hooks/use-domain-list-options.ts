/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { type ListItemType } from '@zextras/ui-components';
import {
  getAllRights,
  useAllConfig,
  useBackupServers,
  useCurrentUserRights,
  useIsAdvanced,
} from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import {
  ACCOUNTS,
  ACTIVE_SYNC,
  ADDRESS_BOOK,
  AUTHENTICATION,
  BOOLEAN_FALSE,
  CONFIG,
  DELEGATES_DOMAIN_ADMINS,
  DISCLAIMER,
  DISTRIBUTION_LIST,
  FALSE,
  GAL,
  GENERAL_SETTINGS,
  GLOBAL_2FA_ROUTE,
  GLOBAL_ACTIVE_SYNC_ROUTE,
  GLOBAL_ADDRESS_BOOK_ROUTE,
  GLOBAL_ADMINISTRATORS,
  GLOBAL_DOMAIN_ROUTE,
  GLOBAL_QUARANTINE_ROUTE,
  GLOBAL_SETTINGS_ROUTE,
  GLOBAL_WHITELABEL_SETTINGS,
  RESOURCES,
  RESTORE_ACCOUNT,
  SAML,
  SECURITY_GROUP,
  TWO_FACTOR_AUTHENTICATION,
  VIRTUAL_HOSTS,
  WHITELABEL_SETTINGS,
  ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
} from '../../../constants';
import type { Domain } from '../../../store/types';

export type UseDomainListOptionsParams = {
  isDomainSelect: boolean;
  domainInformation: Domain | undefined;
};

export type UseDomainListOptionsReturn = {
  manageOptions: Array<ListItemType>;
  detailItems: Array<ListItemType>;
  globalOptionsItems: Array<ListItemType>;
  isShowGlobalConfig: boolean;
};

export const useDomainListOptions = ({
  isDomainSelect,
  domainInformation,
}: UseDomainListOptionsParams): UseDomainListOptionsReturn => {
  const [t] = useTranslation();
  const isAdvanced = useIsAdvanced();
  const { data: backupData } = useBackupServers({ enabled: isAdvanced });
  const { data: rights } = useCurrentUserRights();
  const { data: globalConfigInformation = [] } = useAllConfig();

  const is2FAAvailable =
    domainInformation?.a?.find((item) => item?.n === 'zimbraAuthMech') === undefined;

  const isDisclaimerEnable = globalConfigInformation.find(
    (item) => item?.n === ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
  )?._content;

  const isShowGlobalConfig = (() => {
    if (!rights || rights.length === 0) return false;
    const allRights = getAllRights(rights, CONFIG);
    if (!allRights || allRights.length === 0) return false;
    const right = allRights[0];
    if (!right?.all || !Array.isArray(right?.all) || right?.all.length === 0) return false;
    if (!right.all[0].getAttrs || right.all[0].getAttrs.length === 0) return false;
    return right.all[0].getAttrs.some((item) => item?.all === true);
  })();

  const detailOptions: Array<ListItemType> = [
    {
      id: GENERAL_SETTINGS,
      name: t('label.general_settings', 'General Settings'),
      isSelected: isDomainSelect,
    },
    {
      id: GAL,
      name: t('label.global_address_list', 'Global Address List'),
      isSelected: isDomainSelect,
    },
    {
      id: AUTHENTICATION,
      name: t('label.authentication', 'Authentication'),
      isSelected: isDomainSelect,
    },
    {
      id: VIRTUAL_HOSTS,
      name: t('label.virtual_hosts_and_certificates', 'Virtual Hosts & Certificate'),
      isSelected: isDomainSelect,
    },
    {
      id: WHITELABEL_SETTINGS,
      name: t('label.whitelabel_settings', 'Whitelabel Settings'),
      isSelected: isDomainSelect,
    },
    {
      id: TWO_FACTOR_AUTHENTICATION,
      name: t('label.2-factor-authentication', '2-Factor-Authentication'),
      isSelected: isDomainSelect && is2FAAvailable,
    },
    {
      id: SAML,
      name: t('label.saml', 'SAML'),
      isSelected: isDomainSelect,
    },
    {
      id: DISCLAIMER,
      name: t('label.disclaimer', 'Disclaimer'),
      isSelected: isDisclaimerEnable === FALSE ? BOOLEAN_FALSE : isDomainSelect,
    },
  ];

  const allListItemType: Array<ListItemType> = [
    {
      id: ACCOUNTS,
      name: t('label.accounts', 'Accounts'),
      isSelected: isDomainSelect,
    },
    {
      id: DELEGATES_DOMAIN_ADMINS,
      name: t('label.delegates_domain_admins', 'Delegated Domain Admins'),
      isSelected: isDomainSelect,
    },
    {
      id: DISTRIBUTION_LIST,
      name: t('label.distribution_list', 'Distribution List'),
      isSelected: isDomainSelect,
    },
    {
      id: RESOURCES,
      name: t('label.resources', 'Resources'),
      isSelected: isDomainSelect,
    },
    {
      id: ACTIVE_SYNC,
      name: t('label.active_sync', 'ActiveSync'),
      isSelected: isDomainSelect,
    },
    {
      id: ADDRESS_BOOK,
      name: t('label.ldap_addressbook', 'LDAP Address Book'),
      isSelected: isDomainSelect,
    },
    {
      id: RESTORE_ACCOUNT,
      name: t('label.restore_account', 'Restore Account'),
      isSelected: isDomainSelect,
    },
  ];

  const globalOptionItems: Array<ListItemType> = [
    {
      id: GLOBAL_SETTINGS_ROUTE,
      name: t('label.settings', 'Settings'),
      isSelected: true,
    },
    {
      id: GLOBAL_ADMINISTRATORS,
      name: t('label.administrators', 'Administrators'),
      isSelected: true,
    },
    {
      id: GLOBAL_WHITELABEL_SETTINGS,
      name: t('label.whitelabel_settings', 'Whitelabel Settings'),
      isSelected: true,
    },
    {
      id: GLOBAL_DOMAIN_ROUTE,
      name: t('label.domains', 'Domains'),
      isSelected: true,
    },
    {
      id: GLOBAL_2FA_ROUTE,
      name: t('label.2fa', '2-Factor-Authentication'),
      isSelected: true,
    },
    {
      id: GLOBAL_QUARANTINE_ROUTE,
      name: t('label.quarantine', 'Quarantine'),
      isSelected: true,
    },
    {
      id: GLOBAL_ACTIVE_SYNC_ROUTE,
      name: t('label.active_sync', 'ActiveSync'),
      isSelected: true,
    },
    {
      id: GLOBAL_ADDRESS_BOOK_ROUTE,
      name: t('label.services', 'Services'),
      isSelected: true,
    },
  ];

  const manageItems: Array<ListItemType> = isAdvanced
    ? allListItemType
    : allListItemType.filter(
        (item) =>
          item.id !== RESTORE_ACCOUNT &&
          item.id !== ACTIVE_SYNC &&
          item.id !== ADDRESS_BOOK &&
          item.id !== DELEGATES_DOMAIN_ADMINS &&
          item.id !== SECURITY_GROUP,
      );

  const detailItems: Array<ListItemType> = detailOptions.filter((item) => {
    if (!isAdvanced) {
      if (
        item.id === WHITELABEL_SETTINGS ||
        item.id === SAML ||
        item.id === TWO_FACTOR_AUTHENTICATION
      ) {
        return false;
      }
    }
    return true;
  });

  const globalOptionsItems: Array<ListItemType> = isAdvanced
    ? globalOptionItems
    : globalOptionItems.filter(
        (item) =>
          item.id !== GLOBAL_WHITELABEL_SETTINGS &&
          item.id !== GLOBAL_2FA_ROUTE &&
          item.id !== GLOBAL_ACTIVE_SYNC_ROUTE &&
          item.id !== GLOBAL_ADDRESS_BOOK_ROUTE,
      );

  const manageOptions: Array<ListItemType> = (() => {
    const items =
      backupData && !backupData?.backupModuleEnable && !backupData?.isBackupModuleLicensed
        ? manageItems.filter((item) => item.id !== RESTORE_ACCOUNT)
        : manageItems;
    return items.map((item) => ({
      ...item,
      isSelected: isDomainSelect,
    }));
  })();

  return {
    manageOptions,
    detailItems,
    globalOptionsItems,
    isShowGlobalConfig,
  };
};
