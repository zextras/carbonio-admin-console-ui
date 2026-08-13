/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import {
  Container,
  Input,
  ListRow,
  Padding,
  RouteLeavingGuard,
  Row,
  Switch,
} from '@zextras/ui-components';
import {
  useCurrentUserRights,
  useGlobalSettings,
  useModuleLicenseInfo,
} from '@zextras/ui-shared';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { GlobalConfig } from '../../../../types';
import { BACKUP_BASIC, BACKUP_REALTIME } from '../../../constants';
import { useModifyBackupConfig } from '../../../services/use-modify-backup-config';
import { checkAllowSetBackup } from '../../../utils/check-backup-rights';
import { BackupConfigHeader } from '../components/backup/backup-config-header';
import { defaultSettingsSchema } from './schema';
import {
  getDirtyPayload,
  mapGlobalConfigToFormValues,
} from './utils';

function BackupServerConfigForm({ globalConfig }: { readonly globalConfig: GlobalConfig }) {
  const [t] = useTranslation();
  const modifyMutation = useModifyBackupConfig();
  const { data: rights } = useCurrentUserRights();
  const allowSetBackup = checkAllowSetBackup(rights);

  const { moduleLicenseInfo } = useModuleLicenseInfo();
  const licenseFeatures = moduleLicenseInfo?.features ?? [];
  const isBackupModuleLicensed = licenseFeatures.some(
    (f: Record<string, string | number | boolean>) => f?.name === BACKUP_BASIC && f?.enabled,
  );
  const isBackupRealTimeFeatureLicensed = licenseFeatures.some(
    (f: Record<string, string | number | boolean>) => f?.name === BACKUP_REALTIME && f?.enabled,
  );

  const form = useForm({
    defaultValues: mapGlobalConfigToFormValues(globalConfig),
    validators: { onChange: defaultSettingsSchema, onSubmit: defaultSettingsSchema },
    onSubmit: async ({ value }) => {
      modifyMutation.mutate(
        getDirtyPayload(value, mapGlobalConfigToFormValues(globalConfig)) as never,
        {
          onSuccess: () => form.reset(value, { keepDefaultValues: true }),
        },
      );
    },
  });

  const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);

  if (!isBackupModuleLicensed) {
    return <RouteLeavingGuard when={false} onSave={() => {}} />;
  }

  return (
    <>
      <Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
        <BackupConfigHeader
          title={t('label.server_config', 'Server Config')}
          isDirty={isDirty}
          onCancel={() => form.reset()}
          onSave={() => form.handleSubmit()}
          t={t}
        />
        <Row orientation="horizontal" width="100%" background="gray6">
          <ds-divider></ds-divider>
        </Row>
        <Container
          orientation="column"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
          style={{ overflow: 'auto' }}
          width="100%"
          height="calc(100vh - 200px)"
          padding={{ all: 'large' }}
        >
          <Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }} />
          {isBackupRealTimeFeatureLicensed && (
            <ListRow>
              <form.Field name="enableRealtimeScanner">
                {(field) => (
                  <Switch
                    label={t('backup.enable_realtime_scanner', 'Enable Realtime Scanner')}
                    value={field.state.value}
                    onClick={() => field.handleChange(!field.state.value)}
                    iconColor="primary"
                    disabled={!allowSetBackup}
                  />
                )}
              </form.Field>
            </ListRow>
          )}
          <ListRow>
            <form.Field name="moduleEnabledAtStartup">
              {(field) => (
                <Switch
                  value={field.state.value}
                  label={t(
                    'backup.backup_is_enable_at_the_startup',
                    'Backup is enabled at the startup',
                  )}
                  onClick={() => field.handleChange(!field.state.value)}
                  iconColor="primary"
                  disabled={!allowSetBackup}
                />
              )}
            </form.Field>
          </ListRow>
          <ListRow>
            <form.Field name="runSmartScanOnStartup">
              {(field) => (
                <Switch
                  value={field.state.value}
                  label={t(
                    'backup.run_the_smart_scan_at_the_startup',
                    'Run the Smartscan at the startup',
                  )}
                  onClick={() => field.handleChange(!field.state.value)}
                  iconColor="primary"
                  disabled={!allowSetBackup}
                />
              )}
            </form.Field>
          </ListRow>
          <ListRow>
            <Container padding={{ top: 'large', bottom: 'large' }}>
              <ds-divider></ds-divider>
            </Container>
          </ListRow>
          <ListRow>
            <Container padding={{ bottom: 'large' }}>
              <form.Field name="backupDestPath">
                {(field) => (
                  <Input
                    label={t('backup.backup_path', 'Backup Path')}
                    isRequired
                    value={field.state.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      field.handleChange(e.target.value)
                    }
                    backgroundColor="gray5"
                    disabled={!allowSetBackup}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
          <ListRow>
            <Container padding={{ bottom: 'large' }}>
              <form.Field name="spaceThreshold">
                {(field) => (
                  <Input
                    isRequired
                    label={`${t('backup.minimum_space_threshold', 'Minimum Space Threshold')} (${t(
                      'label.mb',
                      'MB',
                    )})`}
                    value={field.state.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      field.handleChange(e.target.value)
                    }
                    backgroundColor="gray5"
                    disabled={!allowSetBackup}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
          <ListRow>
            <Container padding={{ bottom: 'medium' }}>
              <form.Field name="backupLocalMetadataThreshold">
                {(field) => (
                  <Input
                    isRequired
                    label={`${t('backup.local_metadata_threshold', 'Local Metadata Threshold')} (${t(
                      'label.mb',
                      'MB',
                    )})`}
                    value={field.state.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      field.handleChange(e.target.value)
                    }
                    backgroundColor="gray5"
                    disabled={!allowSetBackup}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
          <ListRow>
            <Container padding={{ top: 'small', bottom: 'large' }}>
              <ds-divider></ds-divider>
            </Container>
          </ListRow>
          <ListRow>
            <Padding bottom="large">
              <form.Field name="smartScanScheduleEnabled">
                {(field) => (
                  <Switch
                    value={field.state.value}
                    onClick={() => field.handleChange(!field.state.value)}
                    label={t('backup.schedule_smart_scan', 'Schedule Smartscan')}
                    iconColor="primary"
                    disabled={!allowSetBackup}
                  />
                )}
              </form.Field>
            </Padding>
          </ListRow>
          <ListRow>
            <Container padding={{ bottom: 'medium' }}>
              <form.Field name="smartScanSchedulePattern">
                {(field) => (
                  <Input
                    isRequired
                    label={t('backup.schedule', 'Schedule')}
                    value={field.state.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      field.handleChange(e.target.value)
                    }
                    backgroundColor="gray5"
                    disabled={!allowSetBackup}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
          <ListRow>
            <Container padding={{ top: 'small', bottom: 'extralarge' }}>
              <ds-divider></ds-divider>
            </Container>
          </ListRow>
          <ListRow>
            <Padding bottom="large">
              <form.Field name="purgeScheduleEnabled">
                {(field) => (
                  <Switch
                    value={field.state.value}
                    onClick={() => field.handleChange(!field.state.value)}
                    label={t('backup.config.scheduleBackupPurge', 'Schedule Backup Purge')}
                    iconColor="primary"
                    disabled={!allowSetBackup}
                  />
                )}
              </form.Field>
            </Padding>
          </ListRow>
          <ListRow>
            <Container padding={{ bottom: 'large' }}>
              <form.Field name="purgeSchedulePattern">
                {(field) => (
                  <Input
                    isRequired
                    label={t('backup.schedule', 'Schedule')}
                    value={field.state.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      field.handleChange(e.target.value)
                    }
                    backgroundColor="gray5"
                    disabled={!allowSetBackup}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
          <ListRow>
            <Container padding={{ top: 'small', bottom: 'extralarge' }}>
              <ds-divider></ds-divider>
            </Container>
          </ListRow>
          <ListRow>
            <Container padding={{ bottom: 'small' }}>
              <form.Field name="keepDeletedItemsDays">
                {(field) => (
                  <Input
                    isRequired
                    label={t('backup.keep_delted_items_backup', 'Keep deleted items in the backup')}
                    value={field.state.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      field.handleChange(e.target.value)
                    }
                    backgroundColor="gray5"
                    disabled={!allowSetBackup}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
          <ListRow>
            <Padding bottom="large">
              <ds-text as="span" size="extrasmall" weight="regular" color="secondary">
                {t(
                  'backup.set_backup_forever_msg',
                  'If you set 0, your data will be kept in backup forever',
                )}
              </ds-text>
            </Padding>
          </ListRow>
          <ListRow>
            <Container padding={{ bottom: 'small' }}>
              <form.Field name="keepDeletedAccountsDays">
                {(field) => (
                  <Input
                    isRequired
                    label={t(
                      'backup.keep_delete_accounts_in_backup',
                      'Keep deleted accounts in the backup',
                    )}
                    value={field.state.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      field.handleChange(e.target.value)
                    }
                    backgroundColor="gray5"
                    disabled={!allowSetBackup}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
          <ListRow>
            <Padding bottom="large">
              <ds-text as="span" size="extrasmall" weight="regular" color="secondary">
                {t(
                  'backup.set_backup_forever_msg',
                  'If you set 0, your data will be kept in backup forever',
                )}
              </ds-text>
            </Padding>
          </ListRow>
        </Container>
      </Container>
      <RouteLeavingGuard when={isDirty} onSave={() => form.handleSubmit()} />
    </>
  );
}

export const BackupServerConfig = () => {
  const { data: globalConfig, isPending } = useGlobalSettings();

  if (isPending || !globalConfig) {
    return (
      <Container padding={{ all: 'large' }} mainAlignment="center" background="gray6">
        <ds-spinner />
      </Container>
    );
  }

  return <BackupServerConfigForm globalConfig={globalConfig} />;
};
