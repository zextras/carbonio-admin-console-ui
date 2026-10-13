/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ComboboxInput, type ComboboxItem, LegacyInput, Row } from '@zextras/ui-components';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { DomainItem } from '../../../types';
import { MAX_DOMAIN_DISPLAY } from '../../constants';
import { FunnelSearchIcon } from './funnel-search-icon';

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

  const items: Array<ComboboxItem> =
    domainList.length > MAX_DOMAIN_DISPLAY
      ? [
          {
            id: 'too-many-domains',
            label: t(
              'many_domain_info_msg',
              'So many domains! Which one would you like to see? Start typing to filter.',
            ),
            disabled: true,
            icon: 'InfoOutline',
          },
        ]
      : domainList.map((domain: DomainItem) => ({
          id: domain.id,
          label: domain.name,
        }));

  return (
    <Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
      <Row
        mainAlignment="flex-start"
        width="35%"
        crossAlignment="flex-start"
        padding={{ right: 'large' }}
      >
        <ComboboxInput
          label={
            isDomainSelect
              ? t('domain.i_want_to_see_this_domain', 'I want to see this domain')
              : t('domain.type_the_exact_domain_name', 'Type the exact domain name')
          }
          items={items}
          loading={isLoading}
          value={searchDomainName}
          hasError={isShowError}
          onChange={(ev: ChangeEvent<HTMLInputElement>) => {
            onSearchDomainChange(ev.target.value);
          }}
          onSelect={(item) => {
            const domain = domainList.find((candidate) => candidate.id === item.id);
            if (domain) onSelectDomain(domain);
          }}
          onClear={onClearDomain}
        />
      </Row>
      <Row width="65%" mainAlignment="flex-start" crossAlignment="flex-start">
        <LegacyInput
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
