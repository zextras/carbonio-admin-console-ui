/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { useIsWorkspaceEdition } from '../../../../services/use-is-workspace-edition';
import { FeatureSwitchField } from '../../fields/feature-switch-field';
import type { CosFeaturesFormApi } from '../../types';

type FilesTasksSectionProps = {
  form: CosFeaturesFormApi;
  readonlyCOS: boolean;
};

export const FilesTasksSection = ({ form, readonlyCOS }: FilesTasksSectionProps) => {
  const [t] = useTranslation();
  const { cosId } = useParams();
  const isWorspaceEdition = useIsWorkspaceEdition(cosId);

  return (
    <Row
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
      width="100%"
    >
      {isWorspaceEdition && (
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
              label={t('label.allow_access_to_files', 'Allow access to Files')}
              disabled={readonlyCOS}
            />
          </Row>
        </Container>
      )}
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
            label={t('label.allow_access_to_tasks', 'Allow access to Tasks')}
            disabled={readonlyCOS}
          />
        </Row>
      </Container>
    </Row>
  );
};
