/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row } from '@zextras/ui-components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { TimeItems } from '../../../../../types/general';
import { TimeFieldGroup } from '../fields/time-field-group';
import { CosFormApi } from '../types';

type EmailRetentionPolicyProps = {
  form: CosFormApi;
  readonlyCOS: boolean;
  timeItems: TimeItems;
};

const COSEmailRetentionPolicy: FC<EmailRetentionPolicyProps> = ({
  form,
  readonlyCOS,
  timeItems,
}) => {
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
          <TimeFieldGroup
            form={form}
            name="zimbraMailMessageLifetime"
            label={labels.email.messageLifetime}
            readonlyCOS={readonlyCOS}
            timeItems={timeItems}
          />
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large' }}
        >
          <TimeFieldGroup
            form={form}
            name="zimbraMailTrashLifetime"
            label={labels.trashedMessageLifetime}
            readonlyCOS={readonlyCOS}
            timeItems={timeItems}
          />
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large', bottom: 'large' }}
        >
          <TimeFieldGroup
            form={form}
            name="zimbraMailSpamLifetime"
            label={labels.spamMessageLifetime}
            readonlyCOS={readonlyCOS}
            timeItems={timeItems}
          />
        </Container>
      </Row>
      <ds-divider></ds-divider>
    </Row>
  );
};

export default COSEmailRetentionPolicy;
