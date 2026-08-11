/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  DropDownInput,
  ListItems,
  ListPanelItem,
  Padding,
  Row,
  useSnackbar,
} from '@zextras/ui-components';
import { replaceHistory, useDebouncedValue, useDomainById } from '@zextras/ui-shared';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  GENERAL_SETTINGS,
  IS_DETAIL_LIST_EXPANDED,
  IS_MANAGE_LIST_EXPANDED,
  MAX_DOMAIN_DISPLAY,
} from '../../constants';
import { type SoapEntity } from '../../services/search-domain-service';
import { useDomainSearch } from '../../services/use-domain-search';
import type { Domain } from '../../store/types';
import { GlobalListPanel } from './global-list-panel';
import { useDomainListOptions } from './hooks/use-domain-list-options';
import { useDomainNavigation } from './hooks/use-domain-navigation';

export const DomainListPanel = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { isDomainSelect, selectedDomainId, domainView, navigateToView } = useDomainNavigation();
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

  const { manageOptions, detailItems, globalOptionsItems, isShowGlobalConfig } =
    useDomainListOptions({ isDomainSelect, domainInformation });

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
