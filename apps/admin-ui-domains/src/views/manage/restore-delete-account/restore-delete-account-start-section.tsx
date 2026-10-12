/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, LabeledValue, ListRow, Row } from '@zextras/ui-components';
import { format } from 'date-fns';
import { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { RestoreDeleteAccountContext } from './restore-delete-account-context';

function formatRestoreDateTime(dateTime: string | null | undefined, createDate: string): string {
  if (!dateTime) return '';

  const selectedDate = dateTime > createDate ? dateTime : createDate;

  return format(new Date(selectedDate), 'd MMMM yyyy | hh:mm:ss a');
}

export const RestoreDeleteAccountStartSection: FC<any> = () => {
  const { t } = useTranslation();
  const context = useContext(RestoreDeleteAccountContext);
  const { restoreAccountDetail } = context;
  const restoreDateTimeValue = formatRestoreDateTime(
    restoreAccountDetail?.dateTime,
    restoreAccountDetail?.createDate,
  );
  return (
    <Container
      orientation="column"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      width="100%"
      padding={{ top: 'extralarge' }}
    >
      <Row mainAlignment="flex-start" width="100%">
        <Container height="fit" crossAlignment="flex-start" background="gray6">
          <Row
            orientation="horizontal"
            mainAlignment="space-between"
            crossAlignment="flex-start"
            width="fill"
            padding={{ bottom: 'large', left: 'large', right: 'large' }}
          >
            <ListRow>
              <Container padding={{ right: 'medium', bottom: 'medium' }}>
                <LabeledValue
                  
                  label={t('label.account', 'Account')}
                  value={restoreAccountDetail?.name}
                />
              </Container>
              <Container padding={{ bottom: 'medium' }}>
                <LabeledValue
                  
                  label={t('label.destination_account', 'Destination Account')}
                  value={
                    restoreAccountDetail?.copyAccount === ''
                      ? ''
                      : `${restoreAccountDetail?.copyAccount.split('@')[0]}@${
                          restoreAccountDetail?.copyDomain
                        }`
                  }
                />
              </Container>
            </ListRow>
            <ListRow>
              <Container padding={{ bottom: 'large', right: 'medium' }}>
                <LabeledValue
                  
                  label={t('label.use_last_available_status', 'Use last available status')}
                  value={
                    restoreAccountDetail?.lastAvailableStatus
                      ? t('label.yes', 'Yes')
                      : t('label.no', 'NO')
                  }
                />
              </Container>
              <Container padding={{ bottom: 'large' }}>
                <LabeledValue
                  
                  label={t('label.date_and_hour', 'Date & Hour')}
                  value={restoreDateTimeValue}
                />
              </Container>
            </ListRow>
            <ListRow>
              <Container>
                <LabeledValue
                  
                  label={t(
                    'label.apply_hsm_policy_after_the_restore',
                    'Apply HSM Policies after the restore',
                  )}
                  value={
                    restoreAccountDetail?.hsmApply ? t('label.yes', 'Yes') : t('label.no', 'NO')
                  }
                />
              </Container>
            </ListRow>
            <ListRow>
              <Container padding={{ bottom: 'large', top: 'large' }}>
                <LabeledValue
                  
                  label={t('label.mail_notifications', 'Email Notifications')}
                  value={
                    restoreAccountDetail?.notificationReceiver === ''
                      ? '-'
                      : restoreAccountDetail?.notificationReceiver
                  }
                />
              </Container>
            </ListRow>
          </Row>
        </Container>
      </Row>
    </Container>
  );
};
