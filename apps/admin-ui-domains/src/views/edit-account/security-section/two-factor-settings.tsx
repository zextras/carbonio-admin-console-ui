/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, InheritedSwitch, ListRow, Padding, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { FALSE } from '../../../constants';
import {
  useAccountForm,
  useSetAccountValues,
  useToggleAccountValue,
} from '../account-form-context';
import { GracePeriodDatePicker } from './grace-period';

export const TwoFactorSettings = () => {
  const { form, accSpecificDetail, cosDetail } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const setAccountValues = useSetAccountValues();
  const toggleAccountValue = useToggleAccountValue();
  const [t] = useTranslation();

  const setEmptyValue = (keyName: string) => {
    setAccountValues((prev: Record<string, any>) => ({ ...prev, [keyName]: undefined }));
  };

  return (
    <Row mainAlignment="flex-start" width="100%" padding={{ all: 'large' }}>
      <ds-text as="h2" weight="bold">
        {t(
          'domain.accounts.twoFactorAuthSetupEnforcement',
          'Two-Factor authenticator setup enforcement',
        )}
      </ds-text>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background="gray6"
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container crossAlignment="flex-start">
              <InheritedSwitch
                subValue={values?.carbonioOtpWizardFromUntrusted}
                onChange={toggleAccountValue}
                label={t(
                  'domain.accounts.allowSetupFromUntrustedNetworks',
                  'Allow 2FA setup from untrusted networks',
                )}
                disabled={values?.carbonioFeatureOTPMgmtEnabled === FALSE}
                iconColor="primary"
                inheritedValue={cosDetail.carbonioOtpWizardFromUntrusted}
                fromSubValue={accSpecificDetail?.carbonioOtpWizardFromUntrusted}
                inputName={'carbonioOtpWizardFromUntrusted'}
                onChangeReset={(): void => setEmptyValue('carbonioOtpWizardFromUntrusted')}
              />
              <Padding left={'extralarge'}>
                <Row padding={{ left: 'small' }}>
                  <ds-text
                    as="small"
                    color="gray1"
                    size="small"
                    overflow="break-word"
                    disabled={values?.carbonioFeatureOTPMgmtEnabled === FALSE}
                  >
                    {t(
                      'domain.accounts.allowSetupFromUntrustedNetworksInfo',
                      'Lets users without an OTP complete the 2FA setup wizard at sign-in from untrusted networks. Disable this option to block access from untrusted networks until 2FA is already configured.',
                    )}
                  </ds-text>
                </Row>
              </Padding>
            </Container>
          </ListRow>
          <ListRow padding={{ top: 'large' }}>
            <Container crossAlignment="flex-start">
              <InheritedSwitch
                subValue={values?.carbonioOtpGracePeriodEnabled}
                onChange={toggleAccountValue}
                label={t(
                  'domain.accounts.allowSetupDeferralDuringGracePeriod',
                  'Allow setup deferral during grace period',
                )}
                disabled={
                  values?.carbonioFeatureOTPMgmtEnabled === FALSE ||
                  values?.carbonioOtpWizardFromUntrusted === FALSE
                }
                iconColor="primary"
                inheritedValue={cosDetail.carbonioOtpGracePeriodEnabled}
                fromSubValue={accSpecificDetail?.carbonioOtpGracePeriodEnabled}
                inputName={'carbonioOtpGracePeriodEnabled'}
                onChangeReset={(): void => setEmptyValue('carbonioOtpGracePeriodEnabled')}
              />
              <Padding left={'extralarge'}>
                <Row padding={{ left: 'small' }}>
                  <ds-text
                    as="small"
                    color="gray1"
                    size="small"
                    overflow="break-word"
                    disabled={
                      values?.carbonioFeatureOTPMgmtEnabled === FALSE ||
                      values?.carbonioOtpWizardFromUntrusted === FALSE
                    }
                  >
                    {t(
                      'domain.accounts.allowSetupDeferralDuringGracePeriodInfo',
                      'Users can skip the wizard for a limited time. The prompt will reappear at every login until setup is completed or the grace period expires.',
                    )}
                  </ds-text>
                </Row>
              </Padding>
            </Container>
          </ListRow>
          <GracePeriodDatePicker />
        </Container>
      </Row>
    </Row>
  );
};
