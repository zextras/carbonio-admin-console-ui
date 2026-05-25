/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  DateTimePicker,
  InheritedSwitch,
  ListRow,
  Padding,
  Row,
} from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const Features: FC<{
  featuresDetail: Partial<Record<string, string>>;
  setFeaturesDetail: CallableFunction;
  cosDetail?: Partial<Record<string, string>>;
  accSpecificDetail?: Partial<Record<string, string>>;
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
        setFeaturesDetail((prev: Partial<Record<string, string>>) => ({
          ...prev,
          [key]: featuresDetail[key] === 'TRUE' ? 'FALSE' : 'TRUE',
        }));
      },
      [featuresDetail, setFeaturesDetail],
    );

    const gracePeriodDefaultDate = useMemo(() => {
      const gentimeValue =
        accSpecificDetail?.carbonioOtpGracePeriodEndingTime ??
        featuresDetail?.carbonioOtpGracePeriodEndingTime;
      if (gentimeValue) {
        const match = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/.exec(gentimeValue);
        if (match) {
          return new Date(
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
      if (featuresDetail?.carbonioOtpGracePeriodEnabled) {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date;
      }
      return null;
    }, [
      accSpecificDetail?.carbonioOtpGracePeriodEndingTime,
      featuresDetail?.carbonioOtpGracePeriodEndingTime,
      featuresDetail?.carbonioOtpGracePeriodEnabled,
    ]);
    const handleFromDateChange = useCallback(
      (d: Date | null) => {
        if (!d) {
          setFeaturesDetail((prev: Partial<Record<string, string>>) => ({
            ...prev,
            carbonioOtpGracePeriodEndingTime: '',
          }));
          return;
        }
        const gentime = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(
          d.getUTCDate(),
        ).padStart(2, '0')}${String(d.getUTCHours()).padStart(2, '0')}${String(
          d.getUTCMinutes(),
        ).padStart(2, '0')}${String(d.getUTCSeconds()).padStart(2, '0')}Z`;
        setFeaturesDetail((prev: Partial<Record<string, string>>) => ({
          ...prev,
          carbonioOtpGracePeriodEndingTime: gentime,
        }));
      },
      [setFeaturesDetail],
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
            <ds-text as="strong" weight="bold">
              {t('label.general_lbl', 'General')}
            </ds-text>
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
                      <InheritedSwitch
                        subValue={featuresDetail?.carbonioOtpWizardFromUntrusted}
                        onChange={changeSwitchOption}
                        label={t(
                          'cos.features.allowSetupFromUntrustedNetworks',
                          'Allow 2FA setup from untrusted networks',
                        )}
                        iconColor="primary"
                        inheritedValue={cosDetail?.carbonioOtpWizardFromUntrusted}
                        fromSubValue={accSpecificDetail?.carbonioOtpWizardFromUntrusted}
                        inputName={'carbonioOtpWizardFromUntrusted'}
                        onChangeReset={(): void =>
                          setEmptyValue?.('carbonioOtpWizardFromUntrusted')
                        }
                        disabled={
                          readonlyFeatures ||
                          featuresDetail?.carbonioFeatureOTPMgmtEnabled === 'FALSE'
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
                              readonlyFeatures ||
                              featuresDetail?.carbonioFeatureOTPMgmtEnabled === 'FALSE'
                            }
                          >
                            {t(
                              'cos.features.allowSetupFromUntrustedNetworksInfo',
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
                        subValue={featuresDetail?.carbonioOtpGracePeriodEnabled}
                        onChange={changeSwitchOption}
                        label={t(
                          'cos.features.allowSetupDeferralDuringGracePeriod',
                          'Allow setup deferral during grace period',
                        )}
                        iconColor="primary"
                        inheritedValue={cosDetail?.carbonioOtpGracePeriodEnabled}
                        fromSubValue={accSpecificDetail?.carbonioOtpGracePeriodEnabled}
                        inputName={'carbonioOtpGracePeriodEnabled'}
                        onChangeReset={(): void => setEmptyValue?.('carbonioOtpGracePeriodEnabled')}
                        disabled={
                          readonlyFeatures ||
                          featuresDetail?.carbonioFeatureOTPMgmtEnabled === 'FALSE' ||
                          featuresDetail?.carbonioOtpWizardFromUntrusted === 'FALSE'
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
                              readonlyFeatures ||
                              featuresDetail?.carbonioFeatureOTPMgmtEnabled === 'FALSE' ||
                              featuresDetail?.carbonioOtpWizardFromUntrusted === 'FALSE'
                            }
                          >
                            {t(
                              'cos.features.allowSetupDeferralDuringGracePeriodInfo',
                              'Users can skip the wizard for a limited time. The prompt will reappear at every login until setup is completed or the grace period expires.',
                            )}
                          </ds-text>
                        </Row>
                      </Padding>
                    </Container>
                  </ListRow>
                  <ListRow padding={{ top: 'large' }}>
                    <Padding left={'extralarge'} width="100%">
                      <Row width="100%">
                        <DateTimePicker
                          disabled={featuresDetail?.carbonioOtpGracePeriodEnabled === 'FALSE'}
                          width={'21.625rem'}
                          className="fffff"
                          label={t(
                            'cos.features.gracePeriodExpirationDate',
                            'Set grace period expiration date',
                          )}
                          onChange={handleFromDateChange}
                          dateFormat="dd/MM/yyyy"
                          includeTime={false}
                          minDate={new Date()}
                          defaultValue={gracePeriodDefaultDate}
                        />
                      </Row>
                    </Padding>
                  </ListRow>
                </Container>
                {/* </Row> */}
              </Row>
            )}
          </Container>
          <ds-divider></ds-divider>
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
              <ds-text as="strong" weight="bold">
                {t('cos.features.twoFactorAuthenticator', 'Two-Factor authenticator')}
              </ds-text>
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
                          disabled={
                            readonlyFeatures ||
                            featuresDetail?.carbonioFeatureOTPMgmtEnabled === 'FALSE'
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
                                readonlyFeatures ||
                                featuresDetail?.carbonioFeatureOTPMgmtEnabled === 'FALSE'
                              }
                            >
                              {t(
                                'cos.features.enforceOnUntrustedNetworksInfo',
                                'Prompts unconfigured users to set up 2FA when login from public or unknown networks.',
                              )}
                            </ds-text>
                          </Row>
                        </Padding>
                      </Container>
                    </ListRow>
                    <ListRow padding={{ top: 'large' }}>
                      <Container crossAlignment="flex-start">
                        <InheritedSwitch
                          subValue={featuresDetail?.carbonioOtpGracePeriodEnabled}
                          onChange={changeSwitchOption}
                          label={t(
                            'cos.features.allowSetupDeferralDuringGracePeriod',
                            'Allow setup deferral during grace period',
                          )}
                          iconColor="primary"
                          inheritedValue={cosDetail?.carbonioOtpGracePeriodEnabled}
                          fromSubValue={accSpecificDetail?.carbonioOtpGracePeriodEnabled}
                          inputName={'carbonioOtpGracePeriodEnabled'}
                          onChangeReset={(): void => setEmptyValue?.('carbonioOtpGracePeriodEnabled')}
                          disabled={
                            readonlyFeatures ||
                            featuresDetail?.carbonioFeatureOTPMgmtEnabled === 'FALSE' ||
                            featuresDetail?.carbonioOtpWizardFromUntrusted === 'FALSE'
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
                                readonlyFeatures ||
                                featuresDetail?.carbonioFeatureOTPMgmtEnabled === 'FALSE' ||
                                featuresDetail?.carbonioOtpWizardFromUntrusted === 'FALSE'
                              }
                            >
                              {t(
                                'cos.features.allowSetupDeferralDuringGracePeriodInfo',
                                'Users can skip the wizard for a limited time. The prompt will reappear at every login until setup is completed or the grace period expires.',
                              )}
                            </ds-text>
                          </Row>
                        </Padding>
                      </Container>
                    </ListRow>
                    <ListRow padding={{ top: 'large' }}>
                      <Padding left={'extralarge'} width="100%">
                        <Row width="100%">
                          <DateTimePicker
                            disabled={featuresDetail?.carbonioOtpGracePeriodEnabled === 'FALSE'}
                            width={'21.625rem'}
                            className="fffff"
                            label={t(
                              'cos.features.gracePeriodExpirationDate',
                              'Set grace period expiration date',
                            )}
                            onChange={handleFromDateChange}
                            dateFormat="dd/MM/yyyy"
                            includeTime={false}
                            minDate={new Date()}
                            defaultValue={gracePeriodDefaultDate}
                          />
                        </Row>
                      </Padding>
                    </ListRow>
                  </Container>
                  {/* </Row> */}
                </Row>
              )}
            </Container>
            <ds-divider></ds-divider>
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
            <ds-text as="strong" weight="bold">
              {t('label.mail', 'Mail')}
            </ds-text>
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
          <ds-divider></ds-divider>
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
            <ds-text as="strong" weight="bold">
              {t('label.contacts', 'Contacts')}
            </ds-text>
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
            <ds-text as="strong" weight="bold">
              {t('label.calendar', 'Calendar')}
            </ds-text>
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
          <ds-divider></ds-divider>
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
            <ds-text as="strong" weight="bold">
              {t('label.files', 'Files')}
            </ds-text>
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
            <ds-text as="strong" weight="bold">
              {t('label.tasks', 'Tasks')}
            </ds-text>
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
