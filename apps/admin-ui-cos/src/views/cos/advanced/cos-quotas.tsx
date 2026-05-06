/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, ListRow, Row } from '@zextras/ui-components';
import { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';

import { AccountType } from '../../../../types/account';
import { ComputedLimit, QuotaSource } from '../../../services/get-cos-quota';
import COSQuotasNew from './cos-quotas-new';

type QuotaProps = {
  readonlyCOS: boolean;
  cosAdvanced: AccountType;
  changeValue: (e: ChangeEvent<HTMLInputElement>) => void;
  totalComputedQuotaLimit?: ComputedLimit;
  totalQuotaSource?: QuotaSource;
  initialTotalComputedQuotaLimit?: ComputedLimit;
  onTotalQuotaChange: (value?: ComputedLimit) => void;
};

const COSQuotas: FC<QuotaProps> = ({
  readonlyCOS,
  cosAdvanced,
  changeValue,
  totalComputedQuotaLimit,
  totalQuotaSource,
  initialTotalComputedQuotaLimit,
  onTotalQuotaChange,
}) => {
  const [t] = useTranslation();

  const labels = {
    quotas: t('cos.quotas', 'Quotas'),
    maxContactsAllowedInTheFolder: t(
      'cos.max_contacts_allowed_in_the_folder',
      'Max contacts allowed in the folder',
    ),
  };

  return (
    <Row
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ all: 'large' }}
      width="100%"
    >
      <ds-text as="strong" weight="bold">{labels.quotas}</ds-text>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large' }}
        >
          <ListRow crossAlignment={'flex-end'}>
            <COSQuotasNew
              totalComputedQuotaLimit={totalComputedQuotaLimit}
              totalQuotaSource={totalQuotaSource}
              initialTotalComputedQuotaLimit={initialTotalComputedQuotaLimit}
              onChange={onTotalQuotaChange}
              readonlyCOS={readonlyCOS}
            />
            <Container>
              <Input
                label={labels.maxContactsAllowedInTheFolder}
                value={cosAdvanced.zimbraContactMaxNumEntries}
                backgroundColor="gray5"
                inputName="zimbraContactMaxNumEntries"
                onChange={changeValue}
                disabled={readonlyCOS}
              />
            </Container>
          </ListRow>
        </Container>
      </Row>
      <ds-divider></ds-divider>
    </Row>
  );
};

export default COSQuotas;
