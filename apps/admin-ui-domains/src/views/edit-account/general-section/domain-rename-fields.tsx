/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { DropDownInput, Input, Row, useSnackbar } from '@zextras/ui-components';
import { useDebouncedValue } from '@zextras/ui-shared';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDomainSearch } from '../../../services/use-domain-search';
import { generateSnackbarFromError } from '../../error/generate-snackbar-error';
import { useAccountForm, useSetAccountValues } from '../account-form-context';
import { buildDomainDropdownItems } from './utils';

type DomainSearchResponse = {
  searchTotal?: number;
  domain?: Array<{ id: string; name: string }>;
};

export const DomainRenameFields = () => {
  const { form } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const setAccountValues = useSetAccountValues();
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

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

  const { data: domainSearchData, isError, error } = useDomainSearch({
    searchQuery: debouncedSearchDomain,
    limit: 50,
    offset: 0,
  });

  const searchResponse = domainSearchData as DomainSearchResponse | undefined;
  const domainList =
    !!searchResponse && (searchResponse?.searchTotal ?? 0) > 0
      ? (searchResponse?.domain ?? [])
      : [];

  useEffect(() => {
    if (isError) {
      createSnackbar(generateSnackbarFromError(error, t));
    }
  }, [isError, error, createSnackbar, t]);

  const [prevFormDomainName, setPrevFormDomainName] = useState<string | undefined>(undefined);
  if (values?.domainName !== prevFormDomainName) {
    setPrevFormDomainName(values?.domainName);
    setIsDomainSelect(true);
    setSearchDomainName(values?.domainName);
  }

  const items = buildDomainDropdownItems(domainList, selectedDomain, t);

  const changeUserNaneDetail = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      uid: e.target.value?.replaceAll(' ', '')?.toLowerCase(),
    }));
  };

  return (
    <>
      <Row width="47%" mainAlignment="flex-start">
        <Input
          backgroundColor="gray5"
          label={t('label.advance_edit_user', 'User')}
          onChange={changeUserNaneDetail}
          inputName="uid"
          value={values?.uid}
          autoComplete="new-password"
        />
      </Row>
      <Row mainAlignment="center" crossAlignment="center" padding={{ top: 'small' }}>
        <ds-icon icon="AtOutline" size="large"></ds-icon>
      </Row>
      <Row width="47%" mainAlignment="flex-start">
        <Row mainAlignment="flex-start" crossAlignment="flex-start" width="100%">
          <DropDownInput
            items={items}
            maxWidth="400px"
            width="365px"
            inputLabel={
              isDomainSelect
                ? t('label.domain_name', 'Domain Name')
                : t('domain.type_here_a_domain', 'Type here a domain')
            }
            onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
              setIsDomainSelect(false);
              setSearchDomainName(ev.target.value);
            }}
            inputValue={searchDomainName}
            isCustomIcon={false}
          />
        </Row>
      </Row>
    </>
  );
};
