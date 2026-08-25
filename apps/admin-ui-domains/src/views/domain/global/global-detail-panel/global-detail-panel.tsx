/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import {
  ChipInput,
  Container,
  FormPageLayout,
  Input,
  ListRow,
  Row,
  Switch,
  useSnackbar,
} from '@zextras/ui-components';
import { useAllConfig } from '@zextras/ui-shared';
import { filter } from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Attribute } from '../../../../../types';
import {
  CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE,
  FALSE,
  TRUE,
  ZIMBRA_AMAVIS_OUTBOUND_DISCLAIMERS_ONLY,
  ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
} from '../../../../constants';
import { modifyConfig } from '../../../../services/modify-config';
import { isValidEmail } from '../../../utility/utils';

type GlobalSettingsFormValues = {
  carbonioNotificationFrom: string;
  carbonioNotificationRecipients: Array<{ label?: string }>;
  zimbraDomainMandatoryMailSignatureEnabled: boolean;
  zimbraAmavisOutboundDisclaimersOnly: boolean;
  carbonioSearchAllDomainsByFeature: boolean;
};

const globalSettingsSchema = z.object({
  carbonioNotificationFrom: z.string().refine((value) => value === '' || isValidEmail(value), {
    message: 'label.notification_error_msg',
  }),
  carbonioNotificationRecipients: z.array(z.object({ label: z.string().optional() })),
  zimbraDomainMandatoryMailSignatureEnabled: z.boolean(),
  zimbraAmavisOutboundDisclaimersOnly: z.boolean(),
  carbonioSearchAllDomainsByFeature: z.boolean(),
});

function mapConfigToFormValues(configInformation: Array<Attribute>): GlobalSettingsFormValues {
  const notificationFrom = filter(configInformation, { n: 'carbonioNotificationFrom' });
  const notificationRecipients = filter(configInformation, {
    n: 'carbonioNotificationRecipients',
  });
  return {
    carbonioNotificationFrom: notificationFrom[0]?._content ?? '',
    carbonioNotificationRecipients: notificationRecipients.map((item) => ({
      label: item._content,
    })),
    zimbraDomainMandatoryMailSignatureEnabled:
      filter(configInformation, { n: ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED })[0]
        ?._content === TRUE,
    zimbraAmavisOutboundDisclaimersOnly:
      filter(configInformation, { n: ZIMBRA_AMAVIS_OUTBOUND_DISCLAIMERS_ONLY })[0]?._content ===
      TRUE,
    carbonioSearchAllDomainsByFeature:
      filter(configInformation, { n: CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE })[0]?._content ===
      TRUE,
  };
}

function mapFormValuesToAttributes(values: GlobalSettingsFormValues): Array<Attribute> {
  return [
    { n: 'carbonioNotificationFrom', _content: values.carbonioNotificationFrom },
    ...values.carbonioNotificationRecipients.map((item: { label?: string }) => ({
      n: 'carbonioNotificationRecipients',
      _content: item?.label ?? '',
    })),
    {
      n: ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
      _content: values.zimbraDomainMandatoryMailSignatureEnabled ? TRUE : FALSE,
    },
    {
      n: ZIMBRA_AMAVIS_OUTBOUND_DISCLAIMERS_ONLY,
      _content: values.zimbraAmavisOutboundDisclaimersOnly ? TRUE : FALSE,
    },
    {
      n: CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE,
      _content: values.carbonioSearchAllDomainsByFeature ? TRUE : FALSE,
    },
  ];
}

const GlobalDetailPanelContent = ({
  configInformation,
  invalidate,
}: {
  configInformation: Array<Attribute>;
  invalidate: () => void;
}) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  const initialDefaults = mapConfigToFormValues(configInformation);

  const form = useForm({
    defaultValues: initialDefaults,
    validators: { onChange: globalSettingsSchema, onSubmit: globalSettingsSchema },
    onSubmit: async ({ value }) => {
      try {
        await modifyConfig(mapFormValuesToAttributes(value));

        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('label.change_save_success_msg', 'The change has been saved successfully'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });

        if (
          value.zimbraDomainMandatoryMailSignatureEnabled &&
          value.zimbraDomainMandatoryMailSignatureEnabled !==
            initialDefaults.zimbraDomainMandatoryMailSignatureEnabled
        ) {
          setTimeout(() => {
            createSnackbar({
              key: 'success',
              severity: 'success',
              label: t(
                'label.mandatory_disclaimer_are_enable_for_all_domain',
                'The mandatory disclaimers are enabled for all domains',
              ),
              autoHideTimeout: 2000,
              hideButton: true,
              replace: true,
            });
          }, 2000);
        }
        if (
          value.zimbraAmavisOutboundDisclaimersOnly &&
          value.zimbraAmavisOutboundDisclaimersOnly !==
            initialDefaults.zimbraAmavisOutboundDisclaimersOnly
        ) {
          setTimeout(() => {
            createSnackbar({
              key: 'success',
              severity: 'success',
              label: t(
                'label.mandatory_disclaimer_are_enable_only_for_outbound_deliveries',
                'The mandatory disclaimers are enabled only for outbound deliveries',
              ),
              autoHideTimeout: 3000,
              hideButton: true,
              replace: true,
            });
          }, 4000);
        }

        form.reset(value, { keepDefaultValues: true });
        invalidate();
      } catch {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      }
    },
  });

  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);

  return (
    <Container
      height="calc(100vh - 105px)"
      background="gray6"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      style={{ overflowY: 'auto' }}
    >
      <FormPageLayout
        title={t('label.settings', 'Settings')}
        unsavedChanges={isDirty}
        onCancel={() => form.reset()}
        onSave={() => form.handleSubmit()}
      >
        <Row mainAlignment="flex-start" width="100%" background="gray6" padding={{ top: 'small' }}>
          <ds-text as="h2" size="small" weight="bold" color="gray0">
            {t('label.domain_system_notifications', 'Domain System Notifications')}
          </ds-text>
        </Row>
        <ListRow>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            padding={{ top: 'large', bottom: 'small' }}
          >
            <form.Field name="carbonioNotificationFrom">
              {(field) => {
                const hasError = field.state.meta.errors.length > 0;
                return (
                  <Input
                    isRequired
                    inputName="carbonioNotificationFrom"
                    label={t('label.notification_sender', 'Notification Sender')}
                    backgroundColor="gray5"
                    value={field.state.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                      field.handleChange(e.target.value);
                    }}
                    hasError={hasError}
                    description={
                      hasError
                        ? t('label.notification_error_msg', 'Enter a valid email address.')
                        : undefined
                    }
                  />
                );
              }}
            </form.Field>
          </Container>
        </ListRow>
        <ListRow>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            padding={{ top: 'large', bottom: 'small' }}
          >
            <form.Field name="carbonioNotificationRecipients">
              {(field) => (
                <ChipInput
                  isRequired
                  placeholder={t('label.send_notifications_to', 'Send notifications to...')}
                  background="gray5"
                  value={field.state.value}
                  onChange={(emails: Array<{ label?: string }>): void => {
                    field.handleChange(emails.filter((email) => isValidEmail(email.label ?? '')));
                  }}
                />
              )}
            </form.Field>
          </Container>
        </ListRow>

        <ListRow>
          <Container
            crossAlignment="flex-start"
            mainAlignment="flex-start"
            height="auto"
            padding={{
              top: 'extralarge',
            }}
          >
            <form.Field name="zimbraDomainMandatoryMailSignatureEnabled">
              {(field) => (
                <Switch
                  label={t(
                    'label.enable_disclaimers_for_all_domains',
                    'Mandatory disclaimer for all domains',
                  )}
                  iconColor="primary"
                  value={field.state.value}
                  onClick={(): void => field.handleChange(!field.state.value)}
                />
              )}
            </form.Field>
          </Container>
          <Container
            crossAlignment="flex-start"
            mainAlignment="flex-start"
            height="auto"
            padding={{
              top: 'extralarge',
            }}
          >
            <form.Field name="zimbraAmavisOutboundDisclaimersOnly">
              {(field) => (
                <Switch
                  label={t(
                    'label.only_allow_outbound_disclaimers',
                    'Only allow outbound disclaimers',
                  )}
                  iconColor="primary"
                  value={field.state.value}
                  onClick={(): void => field.handleChange(!field.state.value)}
                />
              )}
            </form.Field>
          </Container>
        </ListRow>

        <ListRow>
          <Container
            crossAlignment="flex-start"
            mainAlignment="flex-start"
            height="auto"
            padding={{
              top: 'extralarge',
            }}
          >
            <form.Field name="carbonioSearchAllDomainsByFeature">
              {(field) => (
                <Switch
                  label={t(
                    'domain.globalSettings.allowSearchUserFromAllDomains',
                    `Allow searching users' information in all domains`,
                  )}
                  iconColor="primary"
                  value={field.state.value}
                  onClick={(): void => field.handleChange(!field.state.value)}
                />
              )}
            </form.Field>
          </Container>
        </ListRow>
      </FormPageLayout>
    </Container>
  );
};

export const GlobalDetailPanel = () => {
  const { data: configInformation = [], isPending, invalidate } = useAllConfig();

  if (isPending) {
    return (
      <Container background="white" mainAlignment="flex-start">
        <Container mainAlignment="center" height="calc(100vh - 12.5rem)">
          <ds-spinner></ds-spinner>
        </Container>
      </Container>
    );
  }

  return <GlobalDetailPanelContent configInformation={configInformation} invalidate={invalidate} />;
};
