/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, ListRow, Row } from '@zextras/ui-components';
import { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';

import { CosFormApi } from './cos-form-api';

type ForwardingProps = {
  form: CosFormApi;
  readonlyCOS: boolean;
};

const COSForwarding: FC<ForwardingProps> = ({ form, readonlyCOS }) => {
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
              <form.Field name="zimbraMailForwardingAddressMaxLength">
                {(field) => (
                  <Input
                    label={labels.address.maxLength}
                    value={field.state.value ?? ''}
                    backgroundColor="gray5"
                    inputName="zimbraMailForwardingAddressMaxLength"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
            <Container padding={{ left: 'small' }}>
              <form.Field name="zimbraMailForwardingAddressMaxNumAddrs">
                {(field) => (
                  <Input
                    label={labels.address.maxNumAddress}
                    value={field.state.value ?? ''}
                    backgroundColor="gray5"
                    inputName="zimbraMailForwardingAddressMaxNumAddrs"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
    </Row>
  );
};

export default COSForwarding;
