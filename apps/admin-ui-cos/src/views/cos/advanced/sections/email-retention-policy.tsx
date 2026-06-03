/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { TimeItems } from '../../../../../types/general';
import { withForm } from '../../../../form/form-hook';
import type { CosAdvancedFormValues } from '../types';

export default withForm({
  defaultValues: {} as CosAdvancedFormValues,
  props: { readonlyCOS: false as boolean, timeItems: [] as unknown as TimeItems },
  render: function Render({ form, readonlyCOS, timeItems }) {
    const [t] = useTranslation();
    const labels = {
      email: {
        retentionPolicy: t('cos.email_retention_policy', 'Email Retention Policy'),
        messageLifetime: t('cos.email_message_lifetime', 'E-mail message lifetime'),
      },
      trashedMessageLifetime: t('cos.trashed_message_lifetime', 'Trashed message lifetime'),
      spamMessageLifetime: t('cos.spam_message_lifetime', 'Spam message lifetime'),
    };
    return (
      <Row
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ all: 'large' }}
        width="100%"
      >
        <ds-text as="strong" weight="bold">
          {labels.email.retentionPolicy}
        </ds-text>
        <Row mainAlignment="flex-start" width="100%">
          <Container
            height="fit"
            crossAlignment="flex-start"
            background={'gray6'}
            padding={{ top: 'large' }}
          >
            <form.AppField name="zimbraMailMessageLifetime">
              {(field) => (
                <field.TimeFieldGroup
                  label={labels.email.messageLifetime}
                  readonlyCOS={readonlyCOS}
                  timeItems={timeItems}
                />
              )}
            </form.AppField>
          </Container>
        </Row>
        <Row mainAlignment="flex-start" width="100%">
          <Container
            height="fit"
            crossAlignment="flex-start"
            background={'gray6'}
            padding={{ top: 'large' }}
          >
            <form.AppField name="zimbraMailTrashLifetime">
              {(field) => (
                <field.TimeFieldGroup
                  label={labels.trashedMessageLifetime}
                  readonlyCOS={readonlyCOS}
                  timeItems={timeItems}
                />
              )}
            </form.AppField>
          </Container>
        </Row>
        <Row mainAlignment="flex-start" width="100%">
          <Container
            height="fit"
            crossAlignment="flex-start"
            background={'gray6'}
            padding={{ top: 'large', bottom: 'large' }}
          >
            <form.AppField name="zimbraMailSpamLifetime">
              {(field) => (
                <field.TimeFieldGroup
                  label={labels.spamMessageLifetime}
                  readonlyCOS={readonlyCOS}
                  timeItems={timeItems}
                />
              )}
            </form.AppField>
          </Container>
        </Row>
        <ds-divider></ds-divider>
      </Row>
    );
  },
});
