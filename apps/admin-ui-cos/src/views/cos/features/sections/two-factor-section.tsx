/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, Padding, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { FeatureSwitchField } from '../../fields/feature-switch-field';
import type { CosFeaturesFormApi } from '../../types';
import { GracePeriodEndDatePicker } from './grace-period-end-date-picker';
import { GracePeriodSection } from './grace-period-section';
import { UntrustedNetworkSection } from './untrusted-network-section';

type TwoFactorSectionProps = {
  form: CosFeaturesFormApi;
  readonlyCOS: boolean;
  isAdvanced: boolean;
};

export const TwoFactorSection = ({ form, readonlyCOS, isAdvanced }: TwoFactorSectionProps) => {
  const [t] = useTranslation();

  return (
    <Row
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
      width="100%"
    >
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        orientation="vertical"
        padding={{ bottom: 'large' }}
      >
        <ds-text as="strong" weight="bold">
          {t('cos.features.twoFactorAuthenticator', 'Two-Factor authenticator')}
        </ds-text>
        <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
          <FeatureSwitchField
            form={form}
            name="carbonioFeatureOTPMgmtEnabled"
            label={t('cos.features.allowUsersToConfigure2FA', 'Allow users to configure 2FA')}
            disabled={readonlyCOS}
          />
        </Row>
        <Padding left={'extralarge'} bottom={'large'}>
          <Row padding={{ left: 'small' }}>
            <ds-text as="span" color="gray1" size="small" overflow="break-word">
              {t(
                'cos.features.allowUsersToConfigure2FAInfo',
                'Users will be able to set up and manage their One-Time Password (OTP) from their profile settings.',
              )}
            </ds-text>
          </Row>
        </Padding>
        {isAdvanced && (
          <Row mainAlignment="flex-start" width="100%" padding={{ vertical: 'large' }}>
            <ds-text as="strong" weight="bold">
              {t(
                'cos.features.twoFactorAuthSetupEnforcement',
                'Two-Factor authenticator setup enforcement',
              )}
            </ds-text>
            <Container
              height="fit"
              crossAlignment="flex-start"
              background="gray6"
              padding={{ top: 'large' }}
            >
              <ListRow>
                <UntrustedNetworkSection form={form} readonlyCOS={readonlyCOS} />
              </ListRow>
              <ListRow padding={{ top: 'large' }}>
                <GracePeriodSection form={form} readonlyCOS={readonlyCOS} />
              </ListRow>
              <ListRow padding={{ top: 'large' }}>
                <Padding left={'extralarge'} width="100%">
                  <Row width="100%">
                    <GracePeriodEndDatePicker form={form} />
                  </Row>
                </Padding>
              </ListRow>
            </Container>
          </Row>
        )}
      </Container>
    </Row>
  );
};
