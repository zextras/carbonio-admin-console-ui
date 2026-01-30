/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  DateTimePicker,
  Input,
  Padding,
  Row,
  Text,
  useSnackbar,
} from '@zextras/ui-components';
import { noop } from 'lodash-es';
import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getDomainList } from '../../../../services/search-domain-service';
import { generateSnackbarFromError } from '../../../error/generate-snackbar-error';
import { getDatePickerContainerStyle } from '../../../utility/datepicker-utils';
import { RestoreDeleteAccountContext } from './restore-delete-account-context';

const RestoreDeleteAccountConfigSection: FC = () => {
  const { t } = useTranslation();
  const createSnackbar = useSnackbar();
  const { restoreAccountDetail } = useContext(RestoreDeleteAccountContext);
  const [searchDomainNameInput, setSearchDomainNameInput] = useState(
    restoreAccountDetail?.copyDomain || '',
  );
  const [searchDomainName, setSearchDomainName] = useState('');

  const handleChange = useCallback((domainNameInput: string | any) => {
    setSearchDomainNameInput(domainNameInput);
    setSearchDomainName('');
  }, []);

  const getDomainLists = useCallback(
    (domain: string): any => {
      getDomainList(domain, 0)
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
    },
    [createSnackbar, t],
  );

  useEffect(() => {
    getDomainLists(searchDomainName);
  }, [searchDomainName, getDomainLists, setSearchDomainNameInput, createSnackbar, t]);

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
            <Text size="small" weight="bold">
              {t('label.domain', 'Domain')}
            </Text>
          </Padding>
          <Padding left="large">
            <Input
              label={t('label.search', 'Search')}
              value={searchDomainNameInput}
              onChange={handleChange}
              inputName={searchDomainName}
            />
          </Padding>
        </Row>
        <Container style={getDatePickerContainerStyle()}>
          <DateTimePicker label="Date" width="100%" onChange={noop} />
        </Container>
      </Container>
    </Container>
  );
};

export default RestoreDeleteAccountConfigSection;
