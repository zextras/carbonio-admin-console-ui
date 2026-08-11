/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  DropDownInput,
  ListItems,
  type ListItemType,
  ListPanelItem,
  Padding,
  Row,
  useSnackbar,
} from '@zextras/ui-components';
import {
  getAllRights,
  replaceHistory,
  useAllConfig,
  useBackupServers,
  useCurrentUserRights,
  useDebouncedValue,
  useDomainById,
  useIsAdvanced,
} from '@zextras/ui-shared';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath, useLocation } from 'react-router';

import {
  ACCOUNTS,
  ACTIVE_SYNC,
  AUTHENTICATION,
  BOOLEAN_FALSE,
  CONFIG,
  DELEGATES_DOMAIN_ADMINS,
  DISCLAIMER,
  DISTRIBUTION_LIST,
  DOMAINS_ROUTE_ID,
  FALSE,
  GAL,
  GENERAL_SETTINGS,
  GLOBAL_2FA_ROUTE,
  GLOBAL_ACTIVE_SYNC_ROUTE,
  GLOBAL_ADMINISTRATORS,
  GLOBAL_DOMAIN_ROUTE,
  GLOBAL_QUARANTINE_ROUTE,
  GLOBAL_ROUTE,
  GLOBAL_SETTINGS_ROUTE,
  GLOBAL_WHITELABEL_SETTINGS,
  IS_DETAIL_LIST_EXPANDED,
  IS_MANAGE_LIST_EXPANDED,
  MANAGE_APP_ID,
  MAX_DOMAIN_DISPLAY,
  RESOURCES,
  RESTORE_ACCOUNT,
  SAML,
  SECURITY_GROUP,
  TWO_FACTOR_AUTHENTICATION,
  VIRTUAL_HOSTS,
  WHITELABEL_SETTINGS,
  ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
} from '../../constants';
import { type SoapEntity } from '../../services/search-domain-service';
import { useDomainSearch } from '../../services/use-domain-search';
import type { Domain } from '../../store/types';
import { GlobalListPanel } from './global-list-panel';

const DOMAINS_BASE = `/${MANAGE_APP_ID}/${DOMAINS_ROUTE_ID}`;

export const DomainListPanel = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const locationService = useLocation();
  const [isDomainListExpand, setIsDomainListExpand] = useState(false);
  const [searchDomainName, setSearchDomainName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 700);
  const [isDetailListExpanded, setIsDetailListExpanded] = useState(
    () => localStorage.getItem(IS_DETAIL_LIST_EXPANDED) !== 'false',
  );
  const [isManageListExpanded, setIsManageListExpanded] = useState(
    () => localStorage.getItem(IS_MANAGE_LIST_EXPANDED) !== 'false',
  );

  const globalMatch =
    matchPath(`${DOMAINS_BASE}/${GLOBAL_ROUTE}/*`, locationService.pathname) ??
    matchPath(`${DOMAINS_BASE}/${GLOBAL_ROUTE}`, locationService.pathname);
  const isGlobalRoute = !!globalMatch;
  const domainMatch = isGlobalRoute
    ? null
    : matchPath(`${DOMAINS_BASE}/:domainId/:operation`, locationService.pathname);
  const selectedDomainId = domainMatch?.params.domainId ?? '';
  const isDomainSelect = !!selectedDomainId;
  const globalSub = globalMatch
    ? (globalMatch.params as Record<string, string | undefined>)['*'] ?? ''
    : '';
  const globalView = globalSub ? `${GLOBAL_ROUTE}/${globalSub}` : GLOBAL_SETTINGS_ROUTE;
  const domainView = isGlobalRoute
    ? globalView
    : domainMatch?.params.operation ?? GLOBAL_DOMAIN_ROUTE;

  const { data: domainInformation } = useDomainById<Domain>({
    domainId: selectedDomainId || undefined,
  });

  const { data, error } = useDomainSearch({
    searchQuery: debouncedSearch,
    limit: 50,
    offset: 0,
  });
  const domainList = data?.domain ?? [];
  const isShowError = (data?.searchTotal ?? 0) <= 0 && !error;

  useEffect(() => {
    if (error) {
      createSnackbar({
        key: 'domain-list-error',
        severity: 'error',
        label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 5000,
        replace: true,
      });
    }
  }, [createSnackbar, error, t]);

  const isAdvanced = useIsAdvanced();
  const { data: backupData } = useBackupServers({
    enabled: isAdvanced,
  });
  const [isShowGlobalConfig, setIsShowGlobalConfig] = useState<boolean>(false);
  const { data: rights } = useCurrentUserRights();
  const { data: globalConfigInformation = [] } = useAllConfig();
  const is2FAAvailable =
    domainInformation?.a?.find((item) => item?.n === 'zimbraAuthMech') === undefined;

  useEffect(() => {
    if (rights && rights.length > 0) {
      const allRights = getAllRights(rights, CONFIG);
      if (allRights && allRights.length > 0) {
        const right = allRights[0];
        if (
          right?.all &&
          Array.isArray(right?.all) &&
          right?.all.length > 0 &&
          right?.all[0].getAttrs &&
          right?.all[0].getAttrs.length > 0
        ) {
          right?.all[0].getAttrs.forEach((item: Record<string, unknown>) => {
            if (item?.all && item?.all === true) {
              setIsShowGlobalConfig(true);
            }
          });
        }
      }
    }
  }, [rights]);

  const [prevDomainId, setPrevDomainId] = useState(domainInformation?.id);
  const [prevIsDomainSelect, setPrevIsDomainSelect] = useState(isDomainSelect);
  if (domainInformation?.id !== prevDomainId) {
    setPrevDomainId(domainInformation?.id);
    if (domainInformation?.name) {
      setSearchDomainName(domainInformation.name);
      setSearchQuery('');
      setIsDomainListExpand(false);
    }
  }
  if (isDomainSelect !== prevIsDomainSelect) {
    setPrevIsDomainSelect(isDomainSelect);
    if (!isDomainSelect) {
      setSearchDomainName('');
      setSearchQuery('');
    }
  }

  const navigateToView = (view: string) => {
    if (view.startsWith(`${GLOBAL_ROUTE}/`)) {
      replaceHistory(`/${view}`);
    } else if (isDomainSelect && selectedDomainId) {
      replaceHistory(`/${selectedDomainId}/${view}`);
    }
  };

  const isDisclaimerEnable = useMemo(
    () =>
      globalConfigInformation.find(
        (item) => item?.n === ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
      )?._content,
    [globalConfigInformation],
  );

  const detailOptions = useMemo(
    () => [
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
    ],
    [t, isDomainSelect, is2FAAvailable, isDisclaimerEnable],
  );

  const allListItemType = useMemo(
    () => [
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
        id: RESTORE_ACCOUNT,
        name: t('label.restore_account', 'Restore Account'),
        isSelected: isDomainSelect,
      },
    ],
    [t, isDomainSelect],
  );

  const globalOptionItems = useMemo(
    () => [
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
    ],
    [t],
  );

  const manageItems = useMemo(
    () =>
      !isAdvanced
        ? allListItemType.filter(
            (item: ListItemType) =>
              item?.id !== RESTORE_ACCOUNT &&
              item?.id !== ACTIVE_SYNC &&
              item?.id !== DELEGATES_DOMAIN_ADMINS &&
              item?.id !== SECURITY_GROUP,
          )
        : allListItemType,
    [allListItemType, isAdvanced],
  );

  const detailItems = useMemo(
    () =>
      detailOptions.filter((item: ListItemType) => {
        if (!isAdvanced) {
          if (
            item?.id === WHITELABEL_SETTINGS ||
            item?.id === SAML ||
            item?.id === TWO_FACTOR_AUTHENTICATION
          ) {
            return false;
          }
        }
        return true;
      }),
    [detailOptions, isAdvanced],
  );

  const globalOptionsItems = useMemo(
    () =>
      !isAdvanced
        ? globalOptionItems.filter(
            (item: ListItemType) =>
              item?.id !== GLOBAL_WHITELABEL_SETTINGS &&
              item?.id !== GLOBAL_2FA_ROUTE &&
              item.id !== GLOBAL_ACTIVE_SYNC_ROUTE,
          )
        : globalOptionItems,
    [globalOptionItems, isAdvanced],
  );

  // Derived: manage options are always consistent with manageItems, backup status, and selection
  const manageOptions = useMemo(() => {
    const items =
      backupData && !backupData?.backupModuleEnable && !backupData?.isBackupModuleLicensed
        ? manageItems.filter((item: ListItemType) => item?.id !== RESTORE_ACCOUNT)
        : manageItems;
    return items.map((item: ListItemType) => ({
      ...item,
      isSelected: isDomainSelect,
    }));
  }, [manageItems, backupData, isDomainSelect]);

  const toggleDetailView = (): void => {
    if (isDetailListExpanded) {
      setIsDetailListExpanded(false);
      localStorage.setItem(IS_DETAIL_LIST_EXPANDED, 'false');
    } else {
      setIsDetailListExpanded(true);
      localStorage.removeItem(IS_DETAIL_LIST_EXPANDED);
    }
  };

  const toggleManageView = (): void => {
    if (isManageListExpanded) {
      setIsManageListExpanded(false);
      localStorage.setItem(IS_MANAGE_LIST_EXPANDED, 'false');
    } else {
      setIsManageListExpanded(true);
      localStorage.removeItem(IS_MANAGE_LIST_EXPANDED);
    }
  };

  const customIconDetail = {
    onClick: (): void => {
      setIsDomainListExpand(!isDomainListExpand);
    },
    size: '1.25rem',
    icon: searchDomainName === '' ? ('GlobeOutline' as const) : ('CloseOutline' as const),
  };

  const items =
    domainList.length > MAX_DOMAIN_DISPLAY
      ? [
          {
            customComponent: (
              <>
                <Row mainAlignment="flex-start">
                  <Padding horizontal="small">
                    <ds-icon
                      style={{ width: '1.25rem', height: '1.25rem' }}
                      icon="InfoOutline"
                    ></ds-icon>
                  </Padding>
                </Row>
                <Row
                  mainAlignment="flex-start"
                  width="100%"
                  padding={{
                    all: 'small',
                  }}
                >
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
        ]
      : domainList.map((domain) => ({
          id: domain.id,
          label: domain.name,
          customComponent: (
            <Row
              style={{
                display: 'block',
                textAlign: 'left',
                height: 'inherit',
                padding: '0.188rem',
                width: 'inherit',
              }}
              onClick={(): void => {
                const domainEntity: SoapEntity = domain;
                setSearchDomainName(domainEntity?.name);
                setSearchQuery('');
                setIsDomainListExpand(false);
                replaceHistory(`/${domain?.id}/${GENERAL_SETTINGS}`);
              }}
            >
              {domain?.name}
            </Row>
          ),
        }));

  useEffect(() => {
    if (locationService.pathname === DOMAINS_BASE) {
      replaceHistory(`/${GLOBAL_DOMAIN_ROUTE}`);
    }
  }, [locationService.pathname]);

  return (
    <Container
      orientation="column"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      background="gray5"
      style={{ overflow: 'auto', borderTop: '0.063rem solid #FFFFFF' }}
    >
      {isShowGlobalConfig && globalOptionsItems.length > 0 && (
        <GlobalListPanel
          globalOptionItems={globalOptionsItems}
          selectedOperationItem={domainView}
          setSelectedOperationItem={navigateToView}
        />
      )}

      <Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
        <DropDownInput
          items={items}
          inputLabel={
            isDomainSelect
              ? t('domain.i_want_to_see_this_domain', 'I want to see this domain')
              : t('domain.type_the exact_domain_name', 'Type the exact domain name')
          }
          hasError={isShowError}
          onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
            setSearchDomainName(ev.target.value);
            setSearchQuery(ev.target.value);
          }}
          inputValue={searchDomainName}
          isCustomIcon
          customIconDetail={customIconDetail}
        />
      </Row>
      {isShowError && (
        <Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
          <Padding top="large" left="small">
            <ds-text as="small" size="extrasmall" weight="regular" color="error">
              {t(
                'label.not_found_check_the_text_and_try_again',
                'Not found - check the text and try again',
              )}
            </ds-text>
          </Padding>
        </Container>
      )}
      <ListPanelItem
        title={t('domain.manage', 'Manage')}
        isListExpanded={isManageListExpanded}
        setToggleView={toggleManageView}
      />
      {isManageListExpanded && (
        <ListItems
          items={manageOptions}
          selectedOperationItem={domainView}
          setSelectedOperationItem={navigateToView}
        />
      )}
      <ListPanelItem
        title={t('label.details', 'Details')}
        isListExpanded={isDetailListExpanded}
        setToggleView={toggleDetailView}
      />
      {isDetailListExpanded && (
        <ListItems
          items={detailItems}
          selectedOperationItem={domainView}
          setSelectedOperationItem={navigateToView}
        />
      )}
    </Container>
  );
};
