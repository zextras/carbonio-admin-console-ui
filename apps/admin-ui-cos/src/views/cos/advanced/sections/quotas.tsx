/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { CosValidatedInput } from '../fields/validated-input';
import { useCosQuotaState } from '../hooks/use-cos-quota-state';
import { CosFormApi } from '../types';
import { COSQuotasNew } from './quotas-new';

type QuotaProps = {
  form: CosFormApi;
  quotaState: ReturnType<typeof useCosQuotaState>;
  readonlyCOS: boolean;
};

export const COSQuotas = ({ form, quotaState, readonlyCOS }: QuotaProps) => {
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
      <ds-text as="strong" weight="bold">
        {labels.quotas}
      </ds-text>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large' }}
        >
          <ListRow crossAlignment={'flex-end'}>
            <COSQuotasNew
              totalComputedQuotaLimit={quotaState.totalComputedQuotaLimit}
              totalQuotaSource={quotaState.totalQuotaSource}
              initialTotalComputedQuotaLimit={quotaState.initialTotalComputedQuotaLimit}
              onChange={quotaState.onTotalQuotaChange}
              readonlyCOS={readonlyCOS}
              showRevertButton={quotaState.showQuotaRevertButton}
            />
            <Container>
              <CosValidatedInput
                form={form}
                name="zimbraContactMaxNumEntries"
                label={labels.maxContactsAllowedInTheFolder}
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
