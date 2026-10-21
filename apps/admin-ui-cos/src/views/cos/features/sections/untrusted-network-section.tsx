/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useField } from '@tanstack/react-form';
import { Container, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { CosFeaturesFormApi } from '../../types';

type UntrustedNetworkSectionProps = {
  form: CosFeaturesFormApi;
  readonlyCOS: boolean;
};

export const UntrustedNetworkSection = ({ form, readonlyCOS }: UntrustedNetworkSectionProps) => {
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
        description={t(
          'cos.features.allowSetupFromUntrustedNetworksInfo',
          'Lets users without an OTP complete the 2FA setup wizard at sign-in from untrusted networks. Disable this option to block access from untrusted networks until 2FA is already configured.',
        )}
        disabled={readonlyCOS || otpMgmtField.state.value === 'FALSE'}
      />
    </Container>
  );
};
