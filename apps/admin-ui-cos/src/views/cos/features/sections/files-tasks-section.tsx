/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useField } from '@tanstack/react-form';
import { Container, Row, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { withForm } from '../../../../form/form-hook';
import type { CosFeaturesFormValues } from '../../types';

export const FilesTasksSection = withForm({
  defaultValues: {} as CosFeaturesFormValues,
  props: { readonlyCOS: false as boolean },
  render: function Render({ form, readonlyCOS }) {
    const [t] = useTranslation();
    const field = useField({ form, name: 'carbonioFeatureFilesAppEnabled' });
    const filesEnabledField = useField({ form, name: 'carbonioFeatureFilesEnabled' });

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
            {t('label.files', 'Files')}
          </ds-text>
          <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
            <form.AppField name="carbonioFeatureFilesEnabled">
              {(fieldApi) => (
                <fieldApi.FeatureSwitchField
                  label={t('label.web_feature', 'Web Feature')}
                  disabled={readonlyCOS}
                />
              )}
            </form.AppField>
          </Row>
          <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
            <Switch
              value={field.state.value === 'TRUE'}
              onClick={() => field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')}
              label={t('label.mobile_app', 'Mobile App')}
              iconColor="primary"
              disabled={filesEnabledField.state.value !== 'TRUE' || readonlyCOS}
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
            <form.AppField name="carbonioFeatureTasksEnabled">
              {(fieldApi) => (
                <fieldApi.FeatureSwitchField
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
