/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { ChipInput, type ChipItem, Container, getFieldErrorProps, Input, ListRow, Row } from '@zextras/ui-components';
import { some } from 'lodash-es';
import { useTranslation } from 'react-i18next';

import { isValidEmail } from '../../../utility/utils';
import { DOMAIN_GENERAL_VALIDATION_MESSAGES } from '../schema';
import type { DomainGeneralSettingsFormApi } from '../use-domain-general-form';

type DomainNotificationsSectionProps = {
  form: DomainGeneralSettingsFormApi;
};

export const DomainNotificationsSection = ({ form }: DomainNotificationsSectionProps) => {
  const [t] = useTranslation();
  const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);

  return (
    <>
      <Row mainAlignment="flex-start" width="100%" background="gray6" padding={{ top: 'large' }}>
        <ds-text as="h2" size="medium" weight="bold" color="gray0">
          {t('label.domain_system_notifications', 'Domain System Notifications')}
        </ds-text>
      </Row>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ horizontal: 'small', top: 'large', bottom: 'small' }}
        >
          <form.Field name="carbonioNotificationFrom">
            {(field) => {
              const error = getFieldErrorProps(
                field,
                isSubmitted,
                t,
                DOMAIN_GENERAL_VALIDATION_MESSAGES,
              );
              return (
                <Input
                  isRequired
                  label={t('label.notification_sender', 'Notification Sender')}
                  backgroundColor="gray5"
                  value={field.state.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    field.handleChange(e.target.value);
                  }}
                  onBlur={() => field.handleBlur()}
                  hasError={error.hasError}
                  description={error.description}
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
          padding={{ horizontal: 'small', top: 'large', bottom: 'extralarge' }}
        >
          <form.Field name="carbonioNotificationRecipients">
            {(field) => (
              <ChipInput<string>
                isRequired
                placeholder={t('label.send_notifications_to', 'Send notifications to...')}
                background="gray5"
                defaultValue={field.state.value}
                value={field.state.value}
                onChange={(emails: Array<ChipItem<string>>) => {
                  const data = emails.flatMap((email) => {
                    const label = email.label ?? '';
                    return isValidEmail(label) ? [{ label }] : [];
                  });
                  field.handleChange(data);
                }}
                hasError={some(field.state.value || [], { error: true })}
                maxChips={null}
              />
            )}
          </form.Field>
        </Container>
      </ListRow>
    </>
  );
};
