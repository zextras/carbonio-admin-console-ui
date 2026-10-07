/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { ComboboxInput, type ComboboxItem, TextInput, Row } from '@zextras/ui-components';
import { useDebouncedValue } from '@zextras/ui-shared';
import { type ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MAX_DOMAIN_DISPLAY } from '../../../constants';
import { useQueryErrorSnackbar } from '../../../hooks/use-query-error-snackbar';
import { useDomainSearch } from '../../../services/use-domain-search';
import { useAccountForm, useSetAccountValues } from '../account-form-context';

type DomainSearchResponse = {
  searchTotal?: number;
  domain?: Array<{ id: string; name: string }>;
};

export const DomainRenameFields = () => {
  const { form } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const setAccountValues = useSetAccountValues();
  const [t] = useTranslation();

  const [isDomainSelect, setIsDomainSelect] = useState(false);
  const [searchDomainName, setSearchDomainName] = useState<string | undefined>(
    values?.domainName,
  );

  const selectedDomain = (domain: string) => {
    setIsDomainSelect(true);
    setSearchDomainName(domain);
    form.setFieldValue('domainName', domain);
  };

  const debouncedSearchDomain = useDebouncedValue(searchDomainName ?? '', 700);

  const { data: domainSearchData, error, isFetching } = useDomainSearch({
    searchQuery: debouncedSearchDomain,
    limit: 50,
    offset: 0,
  });

  const searchResponse = domainSearchData as DomainSearchResponse | undefined;
  const domainList =
    !!searchResponse && (searchResponse?.searchTotal ?? 0) > 0
      ? (searchResponse?.domain ?? [])
      : [];

  useQueryErrorSnackbar(error);

  const [prevFormDomainName, setPrevFormDomainName] = useState<string | undefined>(undefined);
  if (values?.domainName !== prevFormDomainName) {
    setPrevFormDomainName(values?.domainName);
    setIsDomainSelect(true);
    setSearchDomainName(values?.domainName);
  }

  const items: Array<ComboboxItem> =
    domainList.length > MAX_DOMAIN_DISPLAY
      ? [
          {
            id: 'overflow',
            label: t(
              'many_domain_info_msg',
              'So many domains! Which one would you like to see? Start typing to filter.',
            ),
            disabled: true,
            icon: 'InfoOutline',
          },
        ]
      : domainList.map((domain: { id: string; name: string }) => ({
          id: domain.id,
          label: domain.name,
        }));

  const changeUserNaneDetail = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      uid: e.target.value?.replaceAll(' ', '')?.toLowerCase(),
    }));
  };

  return (
    <>
      <Row width="47%" mainAlignment="flex-start">
        <TextInput
          label={t('label.advance_edit_user', 'User')}
          autoComplete="off"
          onChange={changeUserNaneDetail}
          name="uid"
          value={values?.uid ?? ''}
        />
      </Row>
      <Row mainAlignment="center" crossAlignment="center" padding={{ top: 'small' }}>
        <ds-icon icon="AtOutline" size="large"></ds-icon>
      </Row>
      <Row width="47%" mainAlignment="flex-start">
        <Row mainAlignment="flex-start" crossAlignment="flex-start" width="100%">
          <ComboboxInput
            items={items}
            label={
              isDomainSelect
                ? t('label.domain_name', 'Domain Name')
                : t('domain.type_here_a_domain', 'Type here a domain')
            }
            onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
              setIsDomainSelect(false);
              setSearchDomainName(ev.target.value);
            }}
            value={searchDomainName ?? ''}
            onSelect={(item: ComboboxItem): void => {
              const domain = domainList.find((d) => d.id === item.id);
              if (domain) selectedDomain(domain.name);
            }}
            loading={isFetching}
          />
        </Row>
      </Row>
    </>
  );
};
