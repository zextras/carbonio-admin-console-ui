/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, Input, LabeledValue, ListRow, Switch } from '@zextras/ui-components';
import type { ChangeEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { usePurgeBackup } from '../../../../services/use-purge-backup';
import type { BackupConfigFormApi } from '../types';

type DataRetentionProps = {
  form: BackupConfigFormApi;
  allowSetBackup: boolean;
  isBackupInitialized: boolean;
  serverName: string;
};

export const DataRetention = ({
  form,
  allowSetBackup,
  isBackupInitialized,
  serverName,
}: DataRetentionProps) => {
  const [t] = useTranslation();
  const purgeMutation = usePurgeBackup();

  return (
    <>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          orientation="horizontal"
          padding={{ top: 'large' }}
        >
          <ds-divider></ds-divider>
        </Container>
      </ListRow>
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'large' }}
        height="fit"
      >
        <ds-text as="h3" size="medium" weight="bold">
          {t('backup.data_retention_policies', 'Data Retention Policies')}
        </ds-text>
      </Container>
      <ListRow>
        <Container
          padding={{ top: 'large' }}
          mainAlignment="flex-start"
          crossAlignment="flex-start"
        >
          <form.Field name="scheduleAutomaticRetentionPolicy">
            {(field) => (
              <Switch
                label={t(
                  'backup.schedule_automatic_retention_policies',
                  'Schedule automatic retention policies',
                )}
                value={field.state.value}
                onClick={() => field.handleChange(!field.state.value)}
                iconColor="primary"
                disabled={!allowSetBackup}
              />
            )}
          </form.Field>
        </Container>
      </ListRow>
      <ListRow>
        <Container padding={{ top: 'large' }}>
          <form.Field name="retentionPolicySchedule">
            {(field) => (
              <Input
                isRequired
                label={t('backup.schedule', 'Schedule')}
                backgroundColor="gray5"
                value={field.state.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                disabled={!form.state.values.scheduleAutomaticRetentionPolicy || !allowSetBackup}
              />
            )}
          </form.Field>
        </Container>
      </ListRow>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          orientation="horizontal"
          padding={{ top: 'large', right: 'large' }}
          width="35%"
        >
          <form.Field name="keepDeletedItemInBackup">
            {(field) => (
              <Input
                isRequired
                label={t('backup.keep_deleted_item_in_backup', 'Keep deleted items in the backup')}
                value={field.state.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                disabled={!form.state.values.scheduleAutomaticRetentionPolicy || !allowSetBackup}
                // @ts-expect-error - needs a fix // DS only support string
                description={
                  <Trans
                    i18nKey="backup.back_delete_account_warning_message"
                    defaults="If you set 0, <strong>accounts</strong> will be kept in backup forever"
                  />
                }
              />
            )}
          </form.Field>
        </Container>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          orientation="horizontal"
          padding={{ top: 'large', right: 'large' }}
          width="15%"
        >
          <LabeledValue label={t('backup.range', 'Range')} value={t('label.days', 'Days')} />
        </Container>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          orientation="horizontal"
          padding={{ top: 'large', right: 'large' }}
          width="35%"
        >
          <form.Field name="keepDeletedAccountsInBackup">
            {(field) => (
              <Input
                isRequired
                label={t(
                  'backup.keep_deleted_account_in_the_backup',
                  'Keep deleted account in the backup',
                )}
                backgroundColor="gray5"
                value={field.state.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                disabled={!form.state.values.scheduleAutomaticRetentionPolicy || !allowSetBackup}
                // @ts-expect-error - needs a fix // DS only support string
                description={
                  <Trans
                    i18nKey="backup.back_delete_account_warning_message"
                    defaults="If you set 0, <strong>accounts</strong> will be kept in backup forever"
                  />
                }
              />
            )}
          </form.Field>
        </Container>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          orientation="horizontal"
          padding={{ top: 'large' }}
          width="15%"
        >
          <LabeledValue
            label={t('backup.range', 'Range')}
            backgroundColor="gray5"
            value={t('label.days', 'Days')}
          />
        </Container>
      </ListRow>
      <ListRow>
        <Container padding={{ top: 'large' }} style={{ display: 'block' }}>
          <Button
            type="outlined"
            label={t('backup.force_backup_purge_now', 'Force backup purge now')}
            color="primary"
            icon="PowerOutline"
            iconPlacement="right"
            style={{ width: '100%' }}
            width="fill"
            disabled={purgeMutation.isPending || !isBackupInitialized || !allowSetBackup}
            loading={purgeMutation.isPending}
            onClick={() => purgeMutation.mutate(serverName)}
            size="large"
          />
        </Container>
      </ListRow>
    </>
  );
};
