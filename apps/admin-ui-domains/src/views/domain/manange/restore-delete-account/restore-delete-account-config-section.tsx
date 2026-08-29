/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, Padding, Row, useSnackbar } from '@zextras/ui-components';
import { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getDomainList } from '../../../../services/search-domain-service';
import { generateSnackbarFromError } from '../../../error/generate-snackbar-error';
import { RestoreDeleteAccountContext } from './restore-delete-account-context';

const RestoreDeleteAccountConfigSection: FC = () => {
  const { t } = useTranslation();
  const createSnackbar = useSnackbar();
  const { restoreAccountDetail } = useContext(RestoreDeleteAccountContext);
  const [searchDomainNameInput, setSearchDomainNameInput] = useState(
    restoreAccountDetail?.copyDomain || '',
  );
  const [searchDomainName, setSearchDomainName] = useState('');

  const handleChange = (domainNameInput: string | any) => {
    setSearchDomainNameInput(domainNameInput);
    setSearchDomainName('');
  };

  useEffect(() => {
    getDomainList(searchDomainName, 0)
      .then((data: any) => {
        const searchResponse: any = data;
        if (!!searchResponse && searchResponse?.searchTotal > 0) {
          // do nothing if domain found
        } else {
          const errorSnack = generateSnackbarFromError(data, t);
          createSnackbar(errorSnack);
        }
      })
      .catch((error) => {
        const errorSnack = generateSnackbarFromError(error, t);
        createSnackbar(errorSnack);
      });
  }, [searchDomainName, createSnackbar, t]);

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
