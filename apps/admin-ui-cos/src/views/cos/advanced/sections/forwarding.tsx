/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { withForm } from '../../../../form/form-hook';
import type { CosAdvancedFormValues } from '../types';

export default withForm({
  defaultValues: {} as CosAdvancedFormValues,
  props: { readonlyCOS: false as boolean },
  render: function Render({ form, readonlyCOS }) {
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
                <form.AppField name="zimbraMailForwardingAddressMaxLength">
                  {(field) => (
                    <field.ValidatedInput
                      label={labels.address.maxLength}
                      disabled={readonlyCOS}
                    />
                  )}
                </form.AppField>
              </Container>
              <Container padding={{ left: 'small' }}>
                <form.AppField name="zimbraMailForwardingAddressMaxNumAddrs">
                  {(field) => (
                    <field.ValidatedInput
                      label={labels.address.maxNumAddress}
                      disabled={readonlyCOS}
                    />
                  )}
                </form.AppField>
              </Container>
            </ListRow>
          </Container>
        </Row>
      </Row>
    );
  },
});
