/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { FeatureSwitchField } from '../../fields/feature-switch-field';
import type { CosFeaturesFormApi } from '../../types';

type ContactsCalendarSectionProps = {
  form: CosFeaturesFormApi;
  readonlyCOS: boolean;
};

export const ContactsCalendarSection = ({ form, readonlyCOS }: ContactsCalendarSectionProps) => {
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
            label={t('label.allow_access_to_contacts', 'Allow access to Contacts')}
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
            label={t('label.allow_access_to_calendars', 'Allow access to Calendars')}
            disabled={readonlyCOS}
          />
        </Row>
      </Container>
    </Row>
  );
};
