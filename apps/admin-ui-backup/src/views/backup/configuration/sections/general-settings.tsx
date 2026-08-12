/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, ListRow, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import { useSmartScan } from '../../../../services/use-smart-scan';
import type { BackupConfigFormApi } from '../types';

type GeneralSettingsProps = {
  form: BackupConfigFormApi;
  allowSetBackup: boolean;
  isRealtimeLicensed: boolean;
  isBackupInitialized: boolean;
  serverName: string;
};

export const GeneralSettings = ({
  form,
  allowSetBackup,
  isRealtimeLicensed,
  isBackupInitialized,
  serverName,
}: GeneralSettingsProps) => {
  const [t] = useTranslation();
  const smartScanMutation = useSmartScan();
  const [initializeLabel, setInitializeLabel] = useState(
    t('backup.initialize_backup', 'Initialize Backup'),
  );
  const [showIcon, setShowIcon] = useState(true);

  const handleInitialize = () => {
    setShowIcon(false);
    setInitializeLabel(
      t(
        'backup.initialising_backup_check_your_notifications_for_updates',
        'INITIALISING BACKUP... CHECK YOUR NOTIFICATIONS FOR UPDATES',
      ),
    );
    setTimeout(() => {
      setInitializeLabel(t('backup.initialize_backup', 'Initialize Backup'));
      setShowIcon(true);
    }, 10000);
    smartScanMutation.mutate(serverName);
  };

  return (
    <>
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'extralarge' }}
        height="fit"
      >
        <ds-text as="h3" size="medium" weight="bold">
          {t('backup.general', 'General')}
        </ds-text>
      </Container>
      <ListRow>
        <Container
          padding={{ top: 'large' }}
          mainAlignment="flex-start"
          crossAlignment="flex-start"
        >
          <form.Field name="moduleEnableStartup">
            {(field) => (
              <Switch
                label={t('backup.backup_is_enabled_at_startup', 'Backup is enabled at startup')}
                value={field.state.value}
                onClick={() => field.handleChange(!field.state.value)}
                iconColor="primary"
                disabled={!allowSetBackup}
              />
            )}
          </form.Field>
        </Container>
        {isRealtimeLicensed && (
          <Container padding={{ top: 'large' }}>
            <form.Field name="enableRealtimeScanner">
              {(field) => (
                <Switch
                  label={t('backup.enable_realtime_scanner', 'Enable RealTime Scanner')}
                  value={field.state.value}
                  onClick={() => field.handleChange(!field.state.value)}
                  iconColor="primary"
                  disabled={!allowSetBackup}
                />
              )}
            </form.Field>
          </Container>
        )}
        <Container padding={{ top: 'large' }}>
          <form.Field name="runSmartScanStartup">
            {(field) => (
              <Switch
                label={t('backup.run_smartscan_at_startup', 'Run the Smartscan at startup')}
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
        <Container padding={{ top: 'large' }} style={{ display: 'block' }}>
          <Button
            type="outlined"
            label={initializeLabel}
            color="primary"
            {...(showIcon && { icon: 'PowerOutline' })}
            iconPlacement="right"
            width="fill"
            style={{ width: '100%' }}
            disabled={isBackupInitialized || !allowSetBackup}
            onClick={handleInitialize}
            size="large"
          />
        </Container>
      </ListRow>
    </>
  );
};
