/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Container,
  Input,
  ListRow,
  Row,
  Select,
} from '@zextras/ui-components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { TimeItems } from '../../../../types/general';
import { TimeFieldState } from './hooks/use-time-field-state';

type EmailRetentionPolicyProps = {
  mailMessageLifetime: TimeFieldState;
  mailTrashLifetime: TimeFieldState;
  mailSpamLifetime: TimeFieldState;
  readonlyCOS: boolean;
  timeItems: TimeItems;
};

const COSEmailRetentionPolicy: FC<EmailRetentionPolicyProps> = ({
  mailMessageLifetime,
  mailTrashLifetime,
  mailSpamLifetime,
  readonlyCOS,
  timeItems,
}) => {
  const [t] = useTranslation();
  const labels = {
    timeRange: t('cos.time_range', 'Time Range'),
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
          <ListRow>
            <Container width="100%" padding={{ right: 'small' }}>
              <Input
                label={labels.email.messageLifetime}
                value={mailMessageLifetime.num}
                backgroundColor={'gray5'}
                inputName="zimbraMailMessageLifetime"
                onChange={mailMessageLifetime.onNumChange}
                disabled={readonlyCOS}
              />
            </Container>
            <Container width="17%" padding={{ left: 'small', right: 'small' }}>
              <Select
                items={timeItems}
                background={'gray5'}
                label={labels.timeRange}
                selection={
                  timeItems.find((item) => item.value === mailMessageLifetime.type) ??
                  timeItems[-1]
                }
                showCheckbox={false}
                onChange={mailMessageLifetime.onTypeChange}
                disabled={readonlyCOS}
              />
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container width="100%" padding={{ right: 'small' }}>
              <Input
                label={labels.trashedMessageLifetime}
                value={mailTrashLifetime.num}
                backgroundColor={'gray5'}
                inputName="zimbraMailTrashLifetime"
                onChange={mailTrashLifetime.onNumChange}
                disabled={readonlyCOS}
              />
            </Container>
            <Container width="17%" padding={{ left: 'small', right: 'small' }}>
              <Select
                items={timeItems}
                background={'gray5'}
                label={labels.timeRange}
                selection={
                  timeItems.find((item) => item.value === mailTrashLifetime.type) ??
                  timeItems[-1]
                }
                showCheckbox={false}
                onChange={mailTrashLifetime.onTypeChange}
                disabled={readonlyCOS}
              />
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background={'gray6'}
          padding={{ top: 'large', bottom: 'large' }}
        >
          <ListRow>
            <Container width="100%" padding={{ right: 'small' }}>
              <Input
                label={labels.spamMessageLifetime}
                value={mailSpamLifetime.num}
                backgroundColor={'gray5'}
                inputName="zimbraMailSpamLifetime"
                onChange={mailSpamLifetime.onNumChange}
                disabled={readonlyCOS}
              />
            </Container>
            <Container width="17%" padding={{ left: 'small', right: 'small' }}>
              <Select
                items={timeItems}
                background={'gray5'}
                label={labels.timeRange}
                selection={
                  timeItems.find((item) => item.value === mailSpamLifetime.type) ??
                  timeItems[-1]
                }
                showCheckbox={false}
                onChange={mailSpamLifetime.onTypeChange}
                disabled={readonlyCOS}
              />
            </Container>
          </ListRow>
        </Container>
      </Row>
      <ds-divider></ds-divider>
    </Row>
  );
};

export default COSEmailRetentionPolicy;
