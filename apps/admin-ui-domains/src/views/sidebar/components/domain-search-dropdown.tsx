/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ComboboxInput, type ComboboxItem } from '@zextras/ui-components';
import { replaceHistory, type SoapEntity, useDebouncedValue } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ACCOUNTS, MAX_DOMAIN_DISPLAY } from '../../../constants';
import { useQueryErrorSnackbar } from '../../../hooks/use-query-error-snackbar';
import { useDomainSearch } from '../../../services/use-domain-search';
import type { Domain } from '../../../store/types';

type DomainSearchDropdownProps = {
  isDomainSelect: boolean;
  domainInformation: Domain | undefined;
};

export const DomainSearchDropdown = ({
  isDomainSelect,
  domainInformation,
}: DomainSearchDropdownProps) => {
  const [t] = useTranslation();
  const [searchText, setSearchText] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 700);

  const { data, error, isFetching } = useDomainSearch({
    searchQuery: debouncedSearch,
    limit: 50,
    offset: 0,
  });
  const domainList = data?.domain ?? [];
  const isShowError = (data?.searchTotal ?? 0) <= 0 && !error;

  useQueryErrorSnackbar(error, { key: 'domain-list-error', timeout: 5000, hideButton: false });

  const selectedDomainName = isDomainSelect ? (domainInformation?.name ?? '') : '';
  const inputValue = searchText ?? selectedDomainName;

  function handleDomainSelect(domain: SoapEntity): void {
    setSearchText(null);
    setSearchQuery('');
    replaceHistory(`/${domain?.id}/${ACCOUNTS}`);
  }

  function handleSelectItem(item: ComboboxItem): void {
    const domain = domainList.find((d) => d.id === item.id);
    if (domain) handleDomainSelect(domain);
  }

  function handleClear(): void {
    setSearchText(null);
    setSearchQuery('');
  }

  const items: Array<ComboboxItem> =
    domainList.length > MAX_DOMAIN_DISPLAY
      ? [
          {
            id: 'domain-overflow',
            label: t(
              'many_domain_info_msg',
              'So many domains! Which one would you like to see? Start typing to filter.',
            ),
            disabled: true,
            icon: 'InfoOutline',
          },
        ]
      : domainList.map((domain) => ({ id: domain.id, label: domain.name }));

  return (
    <div className="w-full pt-lg">
      <ComboboxInput
        label={
          isDomainSelect
            ? t('domain.i_want_to_see_this_domain', 'I want to see this domain')
            : t('domain.type_the exact_domain_name', 'Type the exact domain name')
        }
        items={items}
        loading={isFetching}
        value={inputValue}
        onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
          setSearchText(ev.target.value);
          setSearchQuery(ev.target.value);
        }}
        onSelect={handleSelectItem}
        onClear={handleClear}
        hasError={isShowError}
        description={
          isShowError
            ? t(
                'label.not_found_check_the_text_and_try_again',
                'Not found - check the text and try again',
              )
            : undefined
        }
      />
    </div>
  );
};
