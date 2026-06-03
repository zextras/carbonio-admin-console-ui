/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useField } from '@tanstack/react-form';
import { Container, Padding, Row, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { withForm } from '../../../../form/form-hook';
import type { CosFeaturesFormValues } from '../../types';

export const UntrustedNetworkSection = withForm({
  defaultValues: {} as CosFeaturesFormValues,
  props: { readonlyCOS: false as boolean },
  render: function Render({ form, readonlyCOS }) {
    const [t] = useTranslation();
    const field = useField({ form, name: 'carbonioOtpWizardFromUntrusted' });
    const otpMgmtField = useField({ form, name: 'carbonioFeatureOTPMgmtEnabled' });

    return (
      <Container crossAlignment="flex-start">
        <Switch
          value={field.state.value === 'TRUE'}
          onClick={() => field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')}
          label={t(
            'cos.features.allowSetupFromUntrustedNetworks',
            'Allow 2FA setup from untrusted networks',
          )}
          iconColor="primary"
          disabled={readonlyCOS || otpMgmtField.state.value === 'FALSE'}
        />
        <Padding left={'extralarge'}>
          <Row padding={{ left: 'small' }}>
            <ds-text
              as="span"
              color="gray1"
              size="small"
              overflow="break-word"
              disabled={readonlyCOS || otpMgmtField.state.value === 'FALSE'}
            >
              {t(
                'cos.features.allowSetupFromUntrustedNetworksInfo',
                'Lets users without an OTP complete the 2FA setup wizard at sign-in from untrusted networks. Disable this option to block access from untrusted networks until 2FA is already configured.',
              )}{' '}
            </ds-text>
          </Row>
        </Padding>
      </Container>
    );
  },
});
