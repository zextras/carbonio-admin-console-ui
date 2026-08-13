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
  RouteLeavingGuard,
  Row,
  Select,
  Switch,
} from '@zextras/ui-components';
import { useCurrentUserRights, useGlobalSettings } from '@zextras/ui-shared';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { GlobalConfig } from '../../../../types';
import { useModifyBackupConfig } from '../../../services/use-modify-backup-config';
import { checkAllowSetBackup } from '../../../utils/check-backup-rights';
import { BackupConfigHeader } from '../components/backup/backup-config-header';
import { defaultSettingsSchema } from './schema';
import { getDirtyPayload, mapGlobalConfigToFormValues } from './utils';

const COMPRESS_LEVEL_ITEMS = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
];

function BackupAdvancedForm({ globalConfig }: { readonly globalConfig: GlobalConfig }) {
  const [t] = useTranslation();
  const modifyMutation = useModifyBackupConfig();
  const { data: rights } = useCurrentUserRights();
  const allowSetBackup = checkAllowSetBackup(rights);

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

  return (
    <>
      <Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
        <Container
          orientation="column"
          background="gray6"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
        >
          <Row mainAlignment="flex-start" width="100%">
            <Container orientation="vertical" mainAlignment="space-around" height="56px">
              <BackupConfigHeader
                title={t('label.advanced', 'Advanced')}
                isDirty={isDirty}
                onCancel={() => form.reset()}
                onSave={() => form.handleSubmit()}
                t={t}
              />
            </Container>
            <ds-divider></ds-divider>
          </Row>
          <Container
            orientation="column"
            crossAlignment="flex-start"
            mainAlignment="flex-start"
            style={{ overflow: 'auto' }}
            width="100%"
            height="calc(100vh - 200px)"
            padding={{ top: 'small' }}
          >
            <Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
              <Container
                height="fit"
                crossAlignment="flex-start"
                background="gray6"
                padding={{ left: 'small', right: 'small' }}
              >
                <ListRow>
                  <Container padding={{ all: 'small' }}>
                    <form.Field name="latencyHighThreshold">
                      {(field) => (
                        <Input
                          isRequired
                          label={`${t('backup.latency_high_threshold', 'Latency High Threshold')} (${t(
                            'backup.kb',
                            'KB',
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
                  <Container padding={{ all: 'small' }}>
                    <form.Field name="latencyLowThreshold">
                      {(field) => (
                        <Input
                          isRequired
                          label={`${t('backup.latency_low_threshold', 'Latency Low Threshold')} (${t(
                            'backup.kb',
                            'KB',
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
                  <Container
                    orientation="horizontal"
                    mainAlignment="space-between"
                    crossAlignment="flex-start"
                    padding={{ all: 'small' }}
                  >
                    <form.Field name="ldapDumpEnabled">
                      {(field) => (
                        <Switch
                          value={field.state.value}
                          onClick={() => field.handleChange(!field.state.value)}
                          label={t('backup.ldap_dump', 'LDAP Dump')}
                          iconColor="primary"
                          disabled={!allowSetBackup}
                        />
                      )}
                    </form.Field>
                  </Container>
                </ListRow>
                <ListRow>
                  <Container
                    orientation="horizontal"
                    mainAlignment="space-between"
                    crossAlignment="flex-start"
                    padding={{ all: 'small' }}
                  >
                    <form.Field name="storeServerConfiguration">
                      {(field) => (
                        <Switch
                          value={field.state.value}
                          onClick={() => field.handleChange(!field.state.value)}
                          label={t(
                            'backup.store_server_configurations_in_the_backup',
                            'Store Server Configuration in the backup',
                          )}
                          iconColor="primary"
                          disabled={!allowSetBackup}
                        />
                      )}
                    </form.Field>
                  </Container>
                </ListRow>
                <ListRow>
                  <Container
                    orientation="horizontal"
                    mainAlignment="space-between"
                    crossAlignment="flex-start"
                    padding={{ all: 'small' }}
                  >
                    <form.Field name="purgeOldConfigurations">
                      {(field) => (
                        <Switch
                          value={field.state.value}
                          onClick={() => field.handleChange(!field.state.value)}
                          label={t('backup.purge_old_configurations', 'Purge Old Configurations')}
                          iconColor="primary"
                          disabled={!allowSetBackup}
                        />
                      )}
                    </form.Field>
                  </Container>
                </ListRow>
                <ListRow>
                  <Container
                    orientation="horizontal"
                    mainAlignment="space-between"
                    crossAlignment="flex-start"
                    padding={{ all: 'small' }}
                  >
                    <form.Field name="saveIndex">
                      {(field) => (
                        <Switch
                          value={field.state.value}
                          onClick={() => field.handleChange(!field.state.value)}
                          label={t('backup.save_index', 'Save Index')}
                          iconColor="primary"
                          disabled={!allowSetBackup}
                        />
                      )}
                    </form.Field>
                  </Container>
                </ListRow>
                <ListRow>
                  <Container padding={{ all: 'small' }}>
                    <form.Field name="maxMetadataSize">
                      {(field) => (
                        <Input
                          isRequired
                          label={t('backup.metatdata_size', 'Metadata Size')}
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
                  <Container padding={{ all: 'small' }}>
                    <form.Field name="maxOperationsPerAccount">
                      {(field) => (
                        <Input
                          isRequired
                          label={t('backup.max_operations_account', 'Max Operations / Account')}
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
                  <Container padding={{ all: 'small' }}>
                    <form.Field name="compressionLevel">
                      {(field) => (
                        <Select
                          items={COMPRESS_LEVEL_ITEMS}
                          background="gray5"
                          label={t('backup.compression_level', 'Compression Level')}
                          defaultSelection={COMPRESS_LEVEL_ITEMS.find(
                            (item) => item.value === String(globalConfig.backupCompressionLevel ?? ''),
                          )}
                          onChange={(v) => field.handleChange(v ?? '')}
                          showCheckbox={false}
                          disabled={!allowSetBackup}
                        />
                      )}
                    </form.Field>
                  </Container>
                </ListRow>
                <ListRow>
                  <Container padding={{ all: 'small' }}>
                    <form.Field name="threadsForItems">
                      {(field) => (
                        <Input
                          isRequired
                          label={t('backup.threads_for_items', 'Threads For Items')}
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
                  <Container padding={{ all: 'small' }}>
                    <form.Field name="threadsForAccounts">
                      {(field) => (
                        <Input
                          isRequired
                          label={t('backup.threads_for_account', 'Threads For Account')}
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
                  <Container
                    orientation="horizontal"
                    mainAlignment="space-between"
                    crossAlignment="flex-start"
                    padding={{ all: 'small' }}
                  >
                    <form.Field name="flashMetadataOnSave">
                      {(field) => (
                        <Switch
                          value={field.state.value}
                          onClick={() => field.handleChange(!field.state.value)}
                          label={t(
                            'backup.flash_metadata_in_the_disk_at_every_save',
                            'Flash metadata in the disk at every save',
                          )}
                          iconColor="primary"
                          disabled={!allowSetBackup}
                        />
                      )}
                    </form.Field>
                  </Container>
                </ListRow>
                <ListRow>
                  <Container
                    orientation="horizontal"
                    mainAlignment="space-between"
                    crossAlignment="flex-start"
                    padding={{ all: 'small' }}
                  >
                    <form.Field name="archiveMetadataEnabled">
                      {(field) => (
                        <Switch
                          value={field.state.value}
                          onClick={() => field.handleChange(!field.state.value)}
                          label={t(
                            'backup.archive_user_metadata_folder_in_the_remote_backup',
                            'Archive user metadata folder in the remote backup',
                          )}
                          iconColor="primary"
                          disabled={!allowSetBackup}
                        />
                      )}
                    </form.Field>
                  </Container>
                </ListRow>
              </Container>
            </Row>
          </Container>
        </Container>
      </Container>
      <RouteLeavingGuard when={isDirty} onSave={() => form.handleSubmit()} />
    </>
  );
}

export const BackupAdvanced = () => {
  const { data: globalConfig, isPending } = useGlobalSettings();

  if (isPending || !globalConfig) {
    return (
      <Container padding={{ all: 'large' }} mainAlignment="center" background="gray6">
        <ds-spinner />
      </Container>
    );
  }

  return <BackupAdvancedForm globalConfig={globalConfig} />;
};
