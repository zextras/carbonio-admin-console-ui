/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQuery } from '@tanstack/react-query';
import { Container, Input, Padding, Row } from '@zextras/ui-components';
import { ChangeEvent, FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useQueryErrorSnackbar } from '../../../../hooks/use-query-error-snackbar';
import { getDomainList } from '../../../../services/search-domain-service';
import { RestoreDeleteAccountContext } from './restore-delete-account-context';

const restoreDomainListQueryKeys = {
  all: ['restore-delete-account-domain-list'] as const,
  search: (search: string) => [...restoreDomainListQueryKeys.all, search] as const,
};

const RestoreDeleteAccountConfigSection: FC = () => {
  const { t } = useTranslation();
  const { restoreAccountDetail } = useContext(RestoreDeleteAccountContext);
  const [searchDomainNameInput, setSearchDomainNameInput] = useState(
    restoreAccountDetail?.copyDomain || '',
  );
  const [searchDomainName, setSearchDomainName] = useState('');

  const handleChange = (domainNameInput: ChangeEvent<HTMLDivElement, Element>) => {
    setSearchDomainNameInput(domainNameInput);
    setSearchDomainName('');
  };

  const {
    data: domainSearchData,
    error: domainSearchError,
    isPending,
  } = useQuery({
    queryKey: restoreDomainListQueryKeys.search(searchDomainName),
    queryFn: () => getDomainList(searchDomainName, 0),
  });

  const noDomainFoundError =
    !isPending && (domainSearchData?.searchTotal ?? 0) === 0
      ? t('label.something_wrong_error_msg', 'Something went wrong. Please try again.')
      : null;
  useQueryErrorSnackbar(domainSearchError ?? noDomainFoundError);

  return (
    <Container
      background="gray5"
      padding={{ top: 'large' }}
      mainAlignment="flex-start"
      width="100%"
    >
      <Container background="gray5" padding={{ top: 'large' }} width="100%">
        <Row>
          <Padding right="large">
            <ds-text as="h3" size="small" weight="bold">
              {t('label.domain', 'Domain')}
            </ds-text>
          </Padding>
          <Padding left="large">
            <Input
              isRequired
              label={t('label.search', 'Search')}
              value={searchDomainNameInput}
              onChange={handleChange}
              inputName={searchDomainName}
            />
          </Padding>
        </Row>
      </Container>
    </Container>
  );
};

export default RestoreDeleteAccountConfigSection;
