/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, DropDownInput, Padding, Row } from '@zextras/ui-components';
import { replaceHistory, type SoapEntity, useDebouncedValue } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GENERAL_SETTINGS, MAX_DOMAIN_DISPLAY } from '../../../constants';
import { useQueryErrorSnackbar } from '../../../hooks/use-query-error-snackbar';
import { useDomainSearch } from '../../../services/use-domain-search';
import type { Domain } from '../../../store/types';
import { DomainOverflowMessage } from './domain-overflow-message';
import { DomainSearchResultItem } from './domain-search-result-item';

type DomainSearchDropdownProps = {
  isDomainSelect: boolean;
  domainInformation: Domain | undefined;
};

export const DomainSearchDropdown = ({
  isDomainSelect,
  domainInformation,
}: DomainSearchDropdownProps) => {
  const [t] = useTranslation();
  const [isDomainListExpand, setIsDomainListExpand] = useState(false);
  const [searchDomainName, setSearchDomainName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 700);

  const { data, error } = useDomainSearch({
    searchQuery: debouncedSearch,
    limit: 50,
    offset: 0,
  });
  const domainList = data?.domain ?? [];
  const isShowError = (data?.searchTotal ?? 0) <= 0 && !error;

  useQueryErrorSnackbar(error, { key: 'domain-list-error', timeout: 5000, hideButton: false });

  const [prevDomainId, setPrevDomainId] = useState<string | undefined>(undefined);
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

  const customIconDetail = {
    onClick: (): void => {
      setIsDomainListExpand(!isDomainListExpand);
    },
    size: '1.25rem',
    icon: searchDomainName === '' ? ('GlobeOutline' as const) : ('CloseOutline' as const),
  };

  const handleDomainSelect = (domain: SoapEntity): void => {
    setSearchDomainName(domain?.name);
    setSearchQuery('');
    setIsDomainListExpand(false);
    replaceHistory(`/${domain?.id}/${GENERAL_SETTINGS}`);
  };

  const items =
    domainList.length > MAX_DOMAIN_DISPLAY
      ? [{ customComponent: <DomainOverflowMessage /> }]
      : domainList.map((domain) => ({
          id: domain.id,
          label: domain.name,
          customComponent: <DomainSearchResultItem domain={domain} onSelect={handleDomainSelect} />,
        }));

  return (
    <>
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
    </>
  );
};
