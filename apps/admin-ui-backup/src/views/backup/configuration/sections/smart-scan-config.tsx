/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, Input, ListRow, Switch } from '@zextras/ui-components';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { useSmartScan } from '../../../../services/use-smart-scan';
import type { BackupConfigFormApi } from '../types';

type SmartScanConfigProps = {
  form: BackupConfigFormApi;
  allowSetBackup: boolean;
  isBackupInitialized: boolean;
  serverName: string;
};

export const SmartScanConfig = ({
  form,
  allowSetBackup,
  isBackupInitialized,
  serverName,
}: SmartScanConfigProps) => {
  const [t] = useTranslation();
  const smartScanMutation = useSmartScan();

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
          {t('backup.smart_scan_configuration', 'SmartScan Configuration')}
        </ds-text>
      </Container>
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'large' }}
        height="fit"
      >
        <form.Field name="isScheduleSmartScan">
          {(field) => (
            <Switch
              label={t('backup.schedule_smartscan', 'Schedule Smartscan')}
              value={field.state.value}
              onClick={() => field.handleChange(!field.state.value)}
              iconColor="primary"
              disabled={!allowSetBackup}
            />
          )}
        </form.Field>
      </Container>
      <ListRow>
        <Container padding={{ top: 'large' }}>
          <form.Field name="scheduleSmartScan">
            {(field) => (
              <Input
                isRequired
                label={t('backup.schedule', 'Schedule')}
                value={field.state.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                disabled={!form.state.values.isScheduleSmartScan || !allowSetBackup}
              />
            )}
          </form.Field>
        </Container>
      </ListRow>
      <ListRow>
        <Container padding={{ top: 'large' }} style={{ display: 'block' }}>
          <Button
            type="outlined"
            label={t('backup.force_start_smartscan_now', 'Force start smartscan now')}
            color="primary"
            icon="PowerOutline"
            iconPlacement="right"
            size="large"
            style={{ width: '100%' }}
            width="fill"
            disabled={!isBackupInitialized || !allowSetBackup}
            onClick={() => smartScanMutation.mutate(serverName)}
          />
        </Container>
      </ListRow>
    </>
  );
};
