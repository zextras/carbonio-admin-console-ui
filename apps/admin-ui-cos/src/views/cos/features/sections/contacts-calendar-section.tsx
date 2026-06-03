/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { withForm } from '../../../../form/form-hook';
import type { CosFeaturesFormValues } from '../../types';

export const ContactsCalendarSection = withForm({
  defaultValues: {} as CosFeaturesFormValues,
  props: { readonlyCOS: false as boolean },
  render: function Render({ form, readonlyCOS }) {
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
            <form.AppField name="zimbraFeatureContactsEnabled">
              {(field) => (
                <field.FeatureSwitchField
                  label={t('label.web_feature', 'Web Feature')}
                  disabled={readonlyCOS}
                />
              )}
            </form.AppField>
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
            <form.AppField name="zimbraFeatureCalendarEnabled">
              {(field) => (
                <field.FeatureSwitchField
                  label={t('label.web_feature', 'Web Feature')}
                  disabled={readonlyCOS}
                />
              )}
            </form.AppField>
          </Row>
        </Container>
      </Row>
    );
  },
});
