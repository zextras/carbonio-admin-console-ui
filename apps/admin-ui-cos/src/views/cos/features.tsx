/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, InheritedSwitch, ListRow, Padding, Row, Text } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const Features: FC<{
  featuresDetail: Record<string, string>;
  setFeaturesDetail: CallableFunction;
  cosDetail?: Record<string, string>;
  accSpecificDetail?: Record<string, string>;
  setEmptyValue?: CallableFunction;
  readonlyFeatures?: boolean;
  cosLevelFeatures?: boolean;
}> = ({
  featuresDetail,
  setFeaturesDetail,
  cosDetail,
  accSpecificDetail,
  setEmptyValue,
  readonlyFeatures = false,
  cosLevelFeatures = false,
}) => {
  const [t] = useTranslation();
  const isAdvanced = useIsAdvanced();

  const changeSwitchOption = useCallback(
    (key: string): void => {
      setFeaturesDetail((prev: Record<string, string>) => ({
        ...prev,
        [key]: featuresDetail[key] === 'TRUE' ? 'FALSE' : 'TRUE',
      }));
    },
    [featuresDetail, setFeaturesDetail],
  );

  return (
    <Container mainAlignment="flex-start" width="100%" height="auto" orientation="vertical">
      <Row
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
        width="100%"
      >
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          width="50%"
          orientation="vertical"
          padding={{ bottom: 'large' }}
        >
          <Text weight="bold">{t('label.general_lbl', 'General')}</Text>
          <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
            <InheritedSwitch
              subValue={featuresDetail?.zimbraFeatureOptionsEnabled}
              onChange={changeSwitchOption}
              label={t('label.can_access_settings', 'Can access Settings')}
              iconColor="primary"
              inheritedValue={cosDetail?.zimbraFeatureOptionsEnabled}
              fromSubValue={accSpecificDetail?.zimbraFeatureOptionsEnabled}
              inputName={'zimbraFeatureOptionsEnabled'}
              onChangeReset={(): void => setEmptyValue?.('zimbraFeatureOptionsEnabled')}
              disabled={readonlyFeatures}
            />
          </Row>
          {isAdvanced && (
            <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
              <InheritedSwitch
                subValue={featuresDetail?.zimbraFeatureMobileSyncEnabled}
                onChange={changeSwitchOption}
                label={t('cos.features.active_sync_access', 'Active Sync Access')}
                iconColor="primary"
                inheritedValue={cosDetail?.zimbraFeatureMobileSyncEnabled}
                fromSubValue={accSpecificDetail?.zimbraFeatureMobileSyncEnabled}
                inputName={'zimbraFeatureMobileSyncEnabled'}
                onChangeReset={(): void => setEmptyValue?.('zimbraFeatureMobileSyncEnabled')}
                disabled={readonlyFeatures}
              />
            </Row>
          )}
        </Container>
        <divider-wc></divider-wc>
      </Row>
      {cosLevelFeatures && (
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
            <Text weight="bold">
              {t('cos.features.twoFactorAuthenticator', 'Two-Factor authenticator')}
            </Text>
            <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
              <InheritedSwitch
                subValue={featuresDetail?.carbonioFeatureOTPMgmtEnabled}
                onChange={changeSwitchOption}
                label={t('cos.features.allowUsersToConfigure2FA', 'Allow users to configure 2FA')}
                iconColor="primary"
                inheritedValue={cosDetail?.carbonioFeatureOTPMgmtEnabled}
                fromSubValue={accSpecificDetail?.carbonioFeatureOTPMgmtEnabled}
                inputName={'carbonioFeatureOTPMgmtEnabled'}
                onChangeReset={(): void => setEmptyValue?.('carbonioFeatureOTPMgmtEnabled')}
                disabled={readonlyFeatures}
              />
            </Row>
            <Padding left={'extralarge'} bottom={'large'}>
              <Row padding={{ left: 'small' }}>
                <Text color="gray1" size="small" overflow="break-word">
                  {t(
                    'cos.features.allowUsersToConfigure2FAInfo',
                    'Users will be able to set up and manage their One-Time Password (OTP) from their profile settings.',
                  )}
                </Text>
              </Row>
            </Padding>
            {isAdvanced && (
              <Row mainAlignment="flex-start" width="100%" padding={{ vertical: 'large' }}>
                <Text weight="bold">
                  {t(
                    'cos.features.twoFactorAuthSetupEnforcement',
                    'Two-Factor authenticator setup enforcement',
                  )}
                </Text>
                <Container
                  height="fit"
                  crossAlignment="flex-start"
                  background="gray6"
                  padding={{ top: 'large' }}
                >
                  <ListRow>
                    <Container crossAlignment="flex-start">
                      <InheritedSwitch
                        subValue={featuresDetail?.carbonioOtpWizardFromUntrusted}
                        onChange={changeSwitchOption}
                        label={t(
                          'cos.features.enforceOnUntrustedNetworks',
                          'Enforce on Untrusted Networks',
                        )}
                        iconColor="primary"
                        inheritedValue={cosDetail?.carbonioOtpWizardFromUntrusted}
                        fromSubValue={accSpecificDetail?.carbonioOtpWizardFromUntrusted}
                        inputName={'carbonioOtpWizardFromUntrusted'}
                        onChangeReset={(): void =>
                          setEmptyValue?.('carbonioOtpWizardFromUntrusted')
                        }
                        disabled={readonlyFeatures}
                      />
                      <Padding left={'extralarge'}>
                        <Row padding={{ left: 'small' }}>
                          <Text color="gray1" size="small" overflow="break-word">
                            {t(
                              'domain.accounts.enforceOnUntrustedNetworksInfo',
                              'Prompts unconfigured users to set up 2FA when login from public or unknown networks.',
                            )}
                          </Text>
                        </Row>
                      </Padding>
                    </Container>
                  </ListRow>
                </Container>
                {/* </Row> */}
              </Row>
            )}
          </Container>
          <divider-wc></divider-wc>
        </Row>
      )}
      <Row
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
        width="100%"
      >
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          width="50%"
          orientation="vertical"
          padding={{ bottom: 'large' }}
        >
          <Text weight="bold">{t('label.mail', 'Mail')}</Text>
          <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
            <InheritedSwitch
              subValue={featuresDetail?.carbonioFeatureMailsAppEnabled}
              onChange={changeSwitchOption}
              label={t('label.mobile_app', 'Mobile App')}
              iconColor="primary"
              inheritedValue={cosDetail?.carbonioFeatureMailsAppEnabled}
              fromSubValue={accSpecificDetail?.carbonioFeatureMailsAppEnabled}
              inputName={'carbonioFeatureMailsAppEnabled'}
              onChangeReset={(): void => setEmptyValue?.('carbonioFeatureMailsAppEnabled')}
              disabled={readonlyFeatures}
            />
          </Row>
          <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
            <InheritedSwitch
              subValue={featuresDetail?.zimbraFeatureSignaturesEnabled}
              onChange={changeSwitchOption}
              label={t('label.mail_signatures', 'Mail Signatures')}
              iconColor="primary"
              inheritedValue={cosDetail?.zimbraFeatureSignaturesEnabled}
              fromSubValue={accSpecificDetail?.zimbraFeatureSignaturesEnabled}
              inputName={'zimbraFeatureSignaturesEnabled'}
              onChangeReset={(): void => setEmptyValue?.('zimbraFeatureSignaturesEnabled')}
              disabled={readonlyFeatures}
            />
          </Row>
          <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
            <InheritedSwitch
              subValue={featuresDetail?.zimbraFeatureOutOfOfficeReplyEnabled}
              onChange={changeSwitchOption}
              label={t('label.out_of_the_office_reply', 'Out of Office Reply')}
              iconColor="primary"
              inheritedValue={cosDetail?.zimbraFeatureOutOfOfficeReplyEnabled}
              fromSubValue={accSpecificDetail?.zimbraFeatureOutOfOfficeReplyEnabled}
              inputName={'zimbraFeatureOutOfOfficeReplyEnabled'}
              onChangeReset={(): void => setEmptyValue?.('zimbraFeatureOutOfOfficeReplyEnabled')}
              disabled={readonlyFeatures}
            />
          </Row>
        </Container>
        <divider-wc></divider-wc>
      </Row>
      <Row
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
        width="100%"
      >
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          width="50%"
          orientation="vertical"
          padding={{ bottom: 'large' }}
        >
          <Text weight="bold">{t('label.contacts', 'Contacts')}</Text>
          <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
            <InheritedSwitch
              subValue={featuresDetail?.zimbraFeatureContactsEnabled}
              onChange={changeSwitchOption}
              label={t('label.web_feature', 'Web Feature')}
              iconColor="primary"
              inheritedValue={cosDetail?.zimbraFeatureContactsEnabled}
              fromSubValue={accSpecificDetail?.zimbraFeatureContactsEnabled}
              inputName={'zimbraFeatureContactsEnabled'}
              onChangeReset={(): void => setEmptyValue?.('zimbraFeatureContactsEnabled')}
              disabled={readonlyFeatures}
            />
          </Row>
        </Container>
        <Container
          mainAlignment="flex-start"
          width="50%"
          crossAlignment="flex-start"
          orientation="vertical"
          padding={{ bottom: 'large' }}
        >
          <Text weight="bold">{t('label.calendar', 'Calendar')}</Text>
          <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
            <InheritedSwitch
              subValue={featuresDetail?.zimbraFeatureCalendarEnabled}
              onChange={changeSwitchOption}
              label={t('label.web_feature', 'Web Feature')}
              iconColor="primary"
              inheritedValue={cosDetail?.zimbraFeatureCalendarEnabled}
              fromSubValue={accSpecificDetail?.zimbraFeatureCalendarEnabled}
              inputName={'zimbraFeatureCalendarEnabled'}
              onChangeReset={(): void => setEmptyValue?.('zimbraFeatureCalendarEnabled')}
              disabled={readonlyFeatures}
            />
          </Row>
        </Container>
        <divider-wc></divider-wc>
      </Row>
      <Row
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
        width="100%"
      >
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          width="50%"
          orientation="vertical"
          padding={{ bottom: 'large' }}
        >
          <Text weight="bold">{t('label.files', 'Files')}</Text>
          <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
            <InheritedSwitch
              subValue={featuresDetail?.carbonioFeatureFilesEnabled}
              onChange={changeSwitchOption}
              label={t('label.web_feature', 'Web Feature')}
              iconColor="primary"
              inheritedValue={cosDetail?.carbonioFeatureFilesEnabled}
              fromSubValue={accSpecificDetail?.carbonioFeatureFilesEnabled}
              inputName={'carbonioFeatureFilesEnabled'}
              onChangeReset={(): void => setEmptyValue?.('carbonioFeatureFilesEnabled')}
              disabled={readonlyFeatures}
            />
          </Row>
          <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
            <InheritedSwitch
              subValue={featuresDetail?.carbonioFeatureFilesAppEnabled}
              onChange={changeSwitchOption}
              label={t('label.mobile_app', 'Mobile App')}
              iconColor="primary"
              inheritedValue={cosDetail?.carbonioFeatureFilesAppEnabled}
              fromSubValue={accSpecificDetail?.carbonioFeatureFilesAppEnabled}
              inputName={'carbonioFeatureFilesAppEnabled'}
              onChangeReset={(): void => setEmptyValue?.('carbonioFeatureFilesAppEnabled')}
              disabled={featuresDetail.carbonioFeatureFilesEnabled !== 'TRUE' || readonlyFeatures}
            />
          </Row>
        </Container>
        <Container
          mainAlignment="flex-start"
          width="50%"
          crossAlignment="flex-start"
          orientation="vertical"
          padding={{ bottom: 'large' }}
        >
          <Text weight="bold">{t('label.tasks', 'Tasks')}</Text>
          <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
            <InheritedSwitch
              subValue={featuresDetail?.carbonioFeatureTasksEnabled}
              onChange={changeSwitchOption}
              label={t('label.web_feature', 'Web Feature')}
              iconColor="primary"
              inheritedValue={cosDetail?.carbonioFeatureTasksEnabled}
              fromSubValue={accSpecificDetail?.carbonioFeatureTasksEnabled}
              inputName={'carbonioFeatureTasksEnabled'}
              onChangeReset={(): void => setEmptyValue?.('carbonioFeatureTasksEnabled')}
              disabled={readonlyFeatures}
            />
          </Row>
        </Container>
      </Row>
    </Container>
  );
};
