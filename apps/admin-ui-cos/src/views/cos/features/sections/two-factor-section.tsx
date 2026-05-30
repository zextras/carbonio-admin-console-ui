/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, DatePicker, ListRow, Padding, Row, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { FeatureSwitchField } from '../../fields/feature-switch-field';
import type { CosFeaturesFormApi } from '../../types';

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
                <Container crossAlignment="flex-start">
                  <form.Field name="carbonioOtpWizardFromUntrusted">
                    {(field) => (
                      <form.Field name="carbonioFeatureOTPMgmtEnabled">
                        {(otpMgmtField) => (
                          <Switch
                            value={field.state.value === 'TRUE'}
                            onClick={() =>
                              field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                            }
                            label={t(
                              'cos.features.allowSetupFromUntrustedNetworks',
                              'Allow 2FA setup from untrusted networks',
                            )}
                            iconColor="primary"
                            disabled={readonlyCOS || otpMgmtField.state.value === 'FALSE'}
                          />
                        )}
                      </form.Field>
                    )}
                  </form.Field>
                  <Padding left={'extralarge'}>
                    <Row padding={{ left: 'small' }}>
                      <form.Field name="carbonioFeatureOTPMgmtEnabled">
                        {(otpMgmtField) => (
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
                        )}
                      </form.Field>
                    </Row>
                  </Padding>
                </Container>
              </ListRow>
              <ListRow padding={{ top: 'large' }}>
                <Container crossAlignment="flex-start">
                  <form.Field name="carbonioOtpGracePeriodEnabled">
                    {(field) => (
                      <form.Field name="carbonioFeatureOTPMgmtEnabled">
                        {(otpMgmtField) => (
                          <form.Field name="carbonioOtpWizardFromUntrusted">
                            {(otpWizardField) => (
                              <Switch
                                value={field.state.value === 'TRUE'}
                                onClick={() =>
                                  field.handleChange(
                                    field.state.value === 'TRUE' ? 'FALSE' : 'TRUE',
                                  )
                                }
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
                            )}
                          </form.Field>
                        )}
                      </form.Field>
                    )}
                  </form.Field>
                  <Padding left={'extralarge'}>
                    <Row padding={{ left: 'small' }}>
                      <form.Field name="carbonioFeatureOTPMgmtEnabled">
                        {(otpMgmtField) => (
                          <form.Field name="carbonioOtpWizardFromUntrusted">
                            {(otpWizardField) => (
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
                                )}
                              </ds-text>
                            )}
                          </form.Field>
                        )}
                      </form.Field>
                    </Row>
                  </Padding>
                </Container>
              </ListRow>
              <ListRow padding={{ top: 'large' }}>
                <Padding left={'extralarge'} width="100%">
                  <Row width="100%">
                    <form.Field name="carbonioOtpGracePeriodEndingTime">
                      {(field) => {
                        const gentimeValue = field.state.value;
                        let defaultDate = null;
                        if (gentimeValue) {
                          const match = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/.exec(
                            gentimeValue,
                          );
                          if (match) {
                            defaultDate = new Date(
                              Date.UTC(
                                Number(match[1]),
                                Number(match[2]) - 1,
                                Number(match[3]),
                                Number(match[4]),
                                Number(match[5]),
                                Number(match[6]),
                              ),
                            );
                          }
                        }
                        return (
                          <form.Field name="carbonioOtpGracePeriodEnabled">
                            {(gracePeriodField) => (
                              <DatePicker
                                disabled={gracePeriodField.state.value === 'FALSE'}
                                width={'21.625rem'}
                                label={t(
                                  'cos.features.gracePeriodExpirationDate',
                                  'Set grace period expiration date',
                                )}
                                onChange={(d) => {
                                  if (!d) {
                                    field.handleChange('');
                                    return;
                                  }
                                  const gentime = `${d.getUTCFullYear()}${String(
                                    d.getUTCMonth() + 1,
                                  ).padStart(2, '0')}${String(d.getUTCDate()).padStart(
                                    2,
                                    '0',
                                  )}${String(d.getUTCHours()).padStart(2, '0')}${String(
                                    d.getUTCMinutes(),
                                  ).padStart(2, '0')}${String(d.getUTCSeconds()).padStart(
                                    2,
                                    '0',
                                  )}Z`;
                                  field.handleChange(gentime);
                                }}
                                dateFormat="dd/MM/yyyy"
                                minDate={new Date()}
                                selected={defaultDate}
                              />
                            )}
                          </form.Field>
                        );
                      }}
                    </form.Field>
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
