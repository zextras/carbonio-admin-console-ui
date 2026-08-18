/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, DropDownInput, Input, Padding, Row } from '@zextras/ui-components';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { DomainItem } from '../../../types';
import { MAX_DOMAIN_DISPLAY } from '../../constants';
import { FunnelSearchIcon } from './funnel-search-icon';

const customIconStyle = {
  width: '1.25rem',
  height: '1.25rem',
};

const loadingItems = [
  {
    customComponent: (
      <Container>
        <ds-spinner></ds-spinner>
      </Container>
    ),
  },
];

type LegalHoldFiltersProps = {
  isLoading: boolean;
  isDomainSelect: boolean;
  isShowError: boolean;
  searchDomainName: string;
  searchAccountName: string;
  domainList: Array<DomainItem>;
  onSearchDomainChange: (value: string) => void;
  onClearDomain: () => void;
  onSelectDomain: (domain: DomainItem) => void;
  onSearchAccountChange: (value: string) => void;
};

export const LegalHoldFilters = ({
  isLoading,
  isDomainSelect,
  isShowError,
  searchDomainName,
  searchAccountName,
  domainList,
  onSearchDomainChange,
  onClearDomain,
  onSelectDomain,
  onSearchAccountChange,
}: LegalHoldFiltersProps) => {
  const [t] = useTranslation();

  const items =
    domainList.length > MAX_DOMAIN_DISPLAY
      ? [
          {
            customComponent: (
              <>
                <Row mainAlignment="flex-start">
                  <Padding horizontal="small">
                    <ds-icon icon="InfoOutline" style={customIconStyle}></ds-icon>
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
      : domainList.map((domain: DomainItem) => ({
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
                onSelectDomain(domain);
              }}
            >
              {domain.name}
            </Row>
          ),
        }));

  return (
    <Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
      <Row
        mainAlignment="flex-start"
        width="35%"
        crossAlignment="flex-start"
        padding={{ right: 'large' }}
      >
        <DropDownInput
          items={isLoading ? loadingItems : items}
          inputLabel={
            isDomainSelect
              ? t('domain.i_want_to_see_this_domain', 'I want to see this domain')
              : t('domain.type_the_exact_domain_name', 'Type the exact domain name')
          }
          hasError={isShowError}
          onChange={(ev: ChangeEvent<HTMLInputElement>) => {
            onSearchDomainChange(ev.target.value);
          }}
          inputValue={searchDomainName}
          isCustomIcon
          customIconDetail={{
            onClick: onClearDomain,
            icon: searchDomainName === '' ? ('ChevronDown' as const) : ('CloseOutline' as const),
          }}
        />
      </Row>
      <Row width="65%" mainAlignment="flex-start" crossAlignment="flex-start">
        <Input
          label={t('label.search_an_account', 'Search an Account')}
          backgroundColor="gray5"
          CustomIcon={FunnelSearchIcon}
          defaultValue={searchAccountName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            onSearchAccountChange(e.target.value);
          }}
        />
      </Row>
    </Row>
  );
};
