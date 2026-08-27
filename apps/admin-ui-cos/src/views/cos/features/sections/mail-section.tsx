/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { FeatureSwitchField } from '../../fields/feature-switch-field';
import type { CosFeaturesFormApi } from '../../types';

type MailSectionProps = {
  form: CosFeaturesFormApi;
  readonlyCOS: boolean;
};

export const MailSection = ({ form, readonlyCOS }: MailSectionProps) => {
  const [t] = useTranslation();

  return (
    <Container
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      orientation="vertical"
      padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
      width="100%"
    >
      <Row width="100%" mainAlignment="flex-start">
        <ds-text as="strong" weight="bold">
          {t('label.mail', 'Mail')}
        </ds-text>
      </Row>
      <Row
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        width="100%"
        padding={{ top: 'large' }}
      >
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          width="50%"
          orientation="vertical"
          padding={{ bottom: 'large' }}
        >
          <Row width="100%" mainAlignment="flex-start">
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
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          width="50%"
          orientation="vertical"
          padding={{ bottom: 'large' }}
        >
          <Row width="100%" mainAlignment="flex-start">
            <FeatureSwitchField
              form={form}
              name="zimbraFeatureImportFolderEnabled"
              label={t(
                'label.allow_user_to_import_external_mailbox',
                'Allow user to import external mailbox',
              )}
              disabled={readonlyCOS}
            />
          </Row>
          <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
            <FeatureSwitchField
              form={form}
              name="zimbraFeatureExportFolderEnabled"
              label={t(
                'label.allow_user_to_export_their_mailbox',
                'Allow user to export their mailbox',
              )}
              disabled={readonlyCOS}
            />
          </Row>
        </Container>
      </Row>
    </Container>
  );
};
