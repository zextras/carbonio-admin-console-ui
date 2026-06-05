/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { CosValidatedInput } from '../fields/validated-input';
import { CosFormApi } from '../types';

type ForwardingProps = {
  form: CosFormApi;
  readonlyCOS: boolean;
};

const COSForwarding = ({ form, readonlyCOS }: ForwardingProps) => {
  const [t] = useTranslation();
  const labels = {
    cosForwarding: t('cos.forwarding', 'Forwarding'),
    address: {
      maxLength: t(
        'cos.limit_user_specified_forwarding_addresses',
        'Limit user-specified forwarding addresses to (char)',
      ),
      maxNumAddress: t(
        'cos.max_user_specific_forwarding_address',
        'Max user-specific forwarding address',
      ),
    },
  };

  return (
    <Row
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ all: 'large' }}
      width="100%"
    >
      <ds-text as="strong" weight="bold">
        {labels.cosForwarding}
      </ds-text>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container padding={{ right: 'small' }}>
              <CosValidatedInput
                form={form}
                name="zimbraMailForwardingAddressMaxLength"
                label={labels.address.maxLength}
                disabled={readonlyCOS}
              />
            </Container>
            <Container padding={{ left: 'small' }}>
              <CosValidatedInput
                form={form}
                name="zimbraMailForwardingAddressMaxNumAddrs"
                label={labels.address.maxNumAddress}
                disabled={readonlyCOS}
              />
            </Container>
          </ListRow>
        </Container>
      </Row>
    </Row>
  );
};

export default COSForwarding;
