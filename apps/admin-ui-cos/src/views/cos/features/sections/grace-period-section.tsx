/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useField } from '@tanstack/react-form';
import { Container, Padding, Row, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { CosFeaturesFormApi } from '../../types';

type GracePeriodSectionProps = {
  form: CosFeaturesFormApi;
  readonlyCOS: boolean;
};

export const GracePeriodSection = ({ form, readonlyCOS }: GracePeriodSectionProps) => {
  const [t] = useTranslation();
  const field = useField({ form, name: 'carbonioOtpGracePeriodEnabled' });
  const otpMgmtField = useField({ form, name: 'carbonioFeatureOTPMgmtEnabled' });
  const otpWizardField = useField({ form, name: 'carbonioOtpWizardFromUntrusted' });

  return (
    <Container crossAlignment="flex-start">
      <Switch
        value={field.state.value === 'TRUE'}
        onClick={() => field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')}
        label={t(
          'cos.features.allowSetupDeferralDuringGracePeriod',
          'Allow setup deferral during grace period',
        )}
        iconColor="primary"
        disabled={
          readonlyCOS ||
          otpMgmtField.state.value === 'FALSE' ||
          otpWizardField.state.value === 'FALSE'
        }
      />
      <Padding left={'extralarge'}>
        <Row padding={{ left: 'small' }}>
          <ds-text
            as="span"
            color="gray1"
            size="small"
            overflow="break-word"
            disabled={
              readonlyCOS ||
              otpMgmtField.state.value === 'FALSE' ||
              otpWizardField.state.value === 'FALSE'
            }
          >
            {t(
              'cos.features.allowSetupDeferralDuringGracePeriodInfo',
              'Users can skip the wizard for a limited time. The prompt will reappear at every login until setup is completed or the grace period expires.',
            )}{' '}
          </ds-text>
        </Row>
      </Padding>
    </Container>
  );
};
