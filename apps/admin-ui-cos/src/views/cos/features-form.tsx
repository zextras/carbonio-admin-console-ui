/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm, useStore } from '@tanstack/react-form';
import {
  Container,
  DateTimePicker,
  ListRow,
  Padding,
  Row,
  Switch,
  useSnackbar,
} from '@zextras/ui-components';
import { type GetCoreAttributesResponse, setCoreAttributes } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { Attribute } from '../../../types/attribute';
import {
  COS,
  MOBILE_CALENDAR_FEATURE_SYNC,
  MOBILE_CONTACT_FEATURE_SYNC,
  ZIMBRA_ADMIN_URN,
} from '../../constants';
import { ModifyCosBody } from '../../services/modify-cos-service';
import { useModifyCos } from '../../services/use-modify-cos';
import { FormPageLayout } from '../form-page-layout';
import { FeatureSwitchField } from './fields/feature-switch-field';
import type { CosFeaturesFormValues } from './types';

const COS_FEATURE_DEFAULTS: CosFeaturesFormValues = {
  carbonioFeatureMailsAppEnabled: 'FALSE',
  zimbraFeatureOutOfOfficeReplyEnabled: 'FALSE',
  zimbraFeatureSignaturesEnabled: 'FALSE',
  zimbraFeatureMobileSyncEnabled: 'FALSE',
  zimbraFeatureContactsEnabled: 'FALSE',
  zimbraFeatureCalendarEnabled: 'FALSE',
  carbonioFeatureFilesAppEnabled: 'FALSE',
  carbonioFeatureFilesEnabled: 'FALSE',
  carbonioFeatureTasksEnabled: 'FALSE',
  zimbraFeatureOptionsEnabled: 'FALSE',
  carbonioOtpWizardFromUntrusted: 'FALSE',
  carbonioFeatureOTPMgmtEnabled: 'FALSE',
  carbonioOtpGracePeriodEndingTime: '',
  carbonioOtpGracePeriodEnabled: 'FALSE',
  mobileContactFeatureSync: 'FALSE',
  mobileCalendarFeatureSync: 'FALSE',
};

function enabledToBool(value: string | undefined): string {
  return value === 'enabled' ? 'TRUE' : 'FALSE';
}

function buildDefaultValues(
  cosInformation: Array<Attribute> | undefined,
  mobileAttributesData: GetCoreAttributesResponse | undefined,
): CosFeaturesFormValues {
  const fromServer: Partial<CosFeaturesFormValues> = {};
  if (cosInformation?.length) {
    const allowed = new Set<string>(Object.keys(COS_FEATURE_DEFAULTS));
    cosInformation.forEach((item) => {
      if (item?.n && allowed.has(item.n)) {
        (fromServer as Record<string, string>)[item.n] = item._content;
      }
    });
  }
  return {
    ...COS_FEATURE_DEFAULTS,
    ...fromServer,
    mobileContactFeatureSync: enabledToBool(
      mobileAttributesData?.attributes?.mobileContactFeatureSync?.[0]?.value,
    ),
    mobileCalendarFeatureSync: enabledToBool(
      mobileAttributesData?.attributes?.mobileCalendarFeatureSync?.[0]?.value,
    ),
  };
}

type CosFeaturesFormProps = {
  cosInformation: Array<Attribute> | undefined;
  cosName: string | undefined;
  mobileAttributesData: GetCoreAttributesResponse | undefined;
  readonlyCOS: boolean;
  isAdvanced: boolean;
};

export const FeaturesForm = ({
  cosInformation,
  cosName,
  mobileAttributesData,
  readonlyCOS,
  isAdvanced,
}: CosFeaturesFormProps) => {
  const { cosId } = useParams();
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const modifyCosMutation = useModifyCos(cosId);

  const form = useForm({
    defaultValues: buildDefaultValues(cosInformation, mobileAttributesData),
    onSubmit: async ({ value }) => {
      const zimbraId = cosInformation?.find((a) => a.n === 'zimbraId')?._content ?? '';

      const originalMobileContactSync = enabledToBool(
        mobileAttributesData?.attributes?.mobileContactFeatureSync?.[0]?.value,
      );
      const originalMobileCalendarSync = enabledToBool(
        mobileAttributesData?.attributes?.mobileCalendarFeatureSync?.[0]?.value,
      );
      const hasMobileChanges =
        value.mobileContactFeatureSync !== originalMobileContactSync ||
        value.mobileCalendarFeatureSync !== originalMobileCalendarSync;

      if (hasMobileChanges && isAdvanced) {
        try {
          await setCoreAttributes({
            mobileCalendarFeatureSync: {
              value: value.mobileCalendarFeatureSync === 'TRUE' ? 'enabled' : 'disabled',
              objectName: cosName,
              configType: COS,
            },
            mobileContactFeatureSync: {
              value: value.mobileContactFeatureSync === 'TRUE' ? 'enabled' : 'disabled',
              objectName: cosName,
              configType: COS,
            },
          });
        } catch {
          createSnackbar({
            key: 'error',
            severity: 'error',
            label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
          return;
        }
      }

      const body: ModifyCosBody = {
        _jsns: ZIMBRA_ADMIN_URN,
        id: { _content: zimbraId },
        a: (Object.keys(value) as Array<keyof CosFeaturesFormValues>)
          .filter(
            (key) =>
              key !== MOBILE_CALENDAR_FEATURE_SYNC && key !== MOBILE_CONTACT_FEATURE_SYNC,
          )
          .map((key) => ({ n: key, _content: value[key] ?? '' })),
      };

      modifyCosMutation.mutate(body, {
        onSuccess: () => {
          form.reset(value, { keepDefaultValues: true });
        },
      });
    },
  });

  const isDirty = useStore(form.store, (state) => !state.isDefaultValue);

  return (
    <FormPageLayout
      title={t('label.features', 'Features')}
      onSave={() => form.handleSubmit()}
      onCancel={() => form.reset()}
      unsavedChanges={isDirty}
    >
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
              <FeatureSwitchField
                form={form}
                name="zimbraFeatureOptionsEnabled"
                label={t('label.can_access_settings', 'Can access Settings')}
                disabled={readonlyCOS}
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
                label={t(
                  'cos.features.allowUsersToConfigure2FA',
                  'Allow users to configure 2FA',
                )}
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
                                  field.handleChange(
                                    field.state.value === 'TRUE' ? 'FALSE' : 'TRUE',
                                  )
                                }
                                label={t(
                                  'cos.features.enforceOnUntrustedNetworks',
                                  'Enforce on Untrusted Networks',
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
                                  'cos.features.enforceOnUntrustedNetworksInfo',
                                  'Prompts unconfigured users to set up 2FA when login from public or unknown networks.',
                                )}
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
                                  <DateTimePicker
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
                                    includeTime={false}
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
              {t('label.mail', 'Mail')}
            </ds-text>
            <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
              <FeatureSwitchField
                form={form}
                name="carbonioFeatureMailsAppEnabled"
                label={t('label.mobile_app', 'Mobile App')}
                disabled={readonlyCOS}
              />
            </Row>
            <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
              <FeatureSwitchField
                form={form}
                name="zimbraFeatureSignaturesEnabled"
                label={t('label.mail_signatures', 'Mail Signatures')}
                disabled={readonlyCOS}
              />
            </Row>
            <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
              <FeatureSwitchField
                form={form}
                name="zimbraFeatureOutOfOfficeReplyEnabled"
                label={t('label.out_of_the_office_reply', 'Out of Office Reply')}
                disabled={readonlyCOS}
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
              <FeatureSwitchField
                form={form}
                name="zimbraFeatureContactsEnabled"
                label={t('label.web_feature', 'Web Feature')}
                disabled={readonlyCOS}
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
              <FeatureSwitchField
                form={form}
                name="zimbraFeatureCalendarEnabled"
                label={t('label.web_feature', 'Web Feature')}
                disabled={readonlyCOS}
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
              <FeatureSwitchField
                form={form}
                name="carbonioFeatureFilesEnabled"
                label={t('label.web_feature', 'Web Feature')}
                disabled={readonlyCOS}
              />
            </Row>
            <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
              <form.Field name="carbonioFeatureFilesAppEnabled">
                {(field) => (
                  <form.Field name="carbonioFeatureFilesEnabled">
                    {(filesEnabledField) => (
                      <Switch
                        value={field.state.value === 'TRUE'}
                        onClick={() =>
                          field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                        }
                        label={t('label.mobile_app', 'Mobile App')}
                        iconColor="primary"
                        disabled={filesEnabledField.state.value !== 'TRUE' || readonlyCOS}
                      />
                    )}
                  </form.Field>
                )}
              </form.Field>
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
              <FeatureSwitchField
                form={form}
                name="carbonioFeatureTasksEnabled"
                label={t('label.web_feature', 'Web Feature')}
                disabled={readonlyCOS}
              />
            </Row>
          </Container>
        </Row>
      </Container>
    </FormPageLayout>
  );
};
