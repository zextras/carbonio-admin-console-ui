/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';
import { Container, RouteLeavingGuard, Row, useSnackbar } from '@zextras/ui-components';
import {
  setCoreAttributes,
  useAllServers,
  useCurrentUserRights,
  useModuleLicenseInfo,
} from '@zextras/ui-shared';
import { isEmpty } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import type {
  BackupArchivingStore,
  CoreAttributeBody,
  GetServerResponse,
  SetCoreAttributesResponse,
} from '../../../../types';
import { BACKUP_REALTIME, SERVER } from '../../../constants';
import { backupQueryKeys } from '../../../services/backup-query-keys';
import { useServerConfig } from '../../../services/use-server-config';
import { checkAllowSetBackup } from '../../../utils/check-backup-rights';
import { BackupConfigHeader } from '../components/backup/backup-config-header';
import { backupConfigSchema } from './schema';
import { DataRetention } from './sections/data-retention';
import { GeneralSettings } from './sections/general-settings';
import { ServiceStatus } from './sections/service-status';
import { SmartScanConfig } from './sections/smart-scan-config';
import { VolumeManagement } from './sections/volume-management';
import type { BackupConfigFormValues } from './types';

function mapServerConfigToFormValues(data: GetServerResponse | undefined): BackupConfigFormValues {
  const attr = data?.attributes;
  return {
    moduleEnableStartup: attr?.ZxBackup_ModuleEnabledAtStartup?.value ?? false,
    enableRealtimeScanner: attr?.ZxBackup_RealTimeScanner?.value ?? false,
    runSmartScanStartup: attr?.ZxBackup_DoSmartScanOnStartup?.value ?? false,
    spaceThreshold: String(attr?.ZxBackup_SpaceThreshold?.value ?? 0),
    backupDestPath: attr?.ZxBackup_DestPath?.value ?? '',
    isScheduleSmartScan: attr?.backupSmartScanScheduler?.value?.['cron-enabled'] ?? false,
    scheduleSmartScan: attr?.backupSmartScanScheduler?.value?.['cron-pattern'] ?? '',
    scheduleAutomaticRetentionPolicy: attr?.backupPurgeScheduler?.value?.['cron-enabled'] ?? false,
    retentionPolicySchedule: attr?.backupPurgeScheduler?.value?.['cron-pattern'] ?? '',
    keepDeletedItemInBackup: String(attr?.ZxBackup_DataRetentionDays?.value ?? 0),
    keepDeletedAccountsInBackup: String(attr?.backupAccountsRetentionDays?.value ?? 0),
  };
}

function mapFormValuesToCoreAttributes(
  values: BackupConfigFormValues,
  server: string,
  includeRealtime: boolean,
): CoreAttributeBody {
  const body: CoreAttributeBody = {
    ZxBackup_ModuleEnabledAtStartup: {
      value: values.moduleEnableStartup,
      objectName: server,
      configType: SERVER,
    },
    ZxBackup_DoSmartScanOnStartup: {
      value: values.runSmartScanStartup,
      objectName: server,
      configType: SERVER,
    },
    ZxBackup_SpaceThreshold: {
      value: Number(values.spaceThreshold),
      objectName: server,
      configType: SERVER,
    },
    backupSmartScanScheduler: {
      value: {
        'cron-pattern': values.scheduleSmartScan,
        'cron-enabled': values.isScheduleSmartScan,
      },
      objectName: server,
      configType: SERVER,
    },
    backupPurgeScheduler: {
      value: {
        'cron-pattern': values.retentionPolicySchedule,
        'cron-enabled': values.scheduleAutomaticRetentionPolicy,
      },
      objectName: server,
      configType: SERVER,
    },
    ZxBackup_DestPath: { value: values.backupDestPath, objectName: server, configType: SERVER },
    ZxBackup_DataRetentionDays: {
      value: Number(values.keepDeletedItemInBackup),
      objectName: server,
      configType: SERVER,
    },
    backupAccountsRetentionDays: {
      value: Number(values.keepDeletedAccountsInBackup),
      objectName: server,
      configType: SERVER,
    },
  };
  if (includeRealtime) {
    body.ZxBackup_RealTimeScanner = {
      value: values.enableRealtimeScanner,
      objectName: server,
      configType: SERVER,
    };
  }
  return body;
}

function BackupConfigurationContent({
  serverConfig,
  serverName,
  serverId,
  isRealtimeLicensed,
}: {
  readonly serverConfig: GetServerResponse;
  readonly serverName: string;
  readonly serverId: string;
  readonly isRealtimeLicensed: boolean;
}) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const { data: rights } = useCurrentUserRights();
  const allowSetBackup = checkAllowSetBackup(rights);
  const [serviceRunning, setServiceRunning] = useState(
    serverConfig?.services?.module?.running ?? false,
  );

  const isBackupInitialized = serverConfig?.properties?.backup_initialized ?? false;
  const backupArchivingStore: BackupArchivingStore =
    serverConfig?.attributes?.backupArchivingStore?.value ?? {};
  const isBackArchivingStoreEmpty = isEmpty(backupArchivingStore);

  const isRealtimeLicensedValue = isRealtimeLicensed;

  const form = useForm({
    defaultValues: mapServerConfigToFormValues(serverConfig),
    validators: { onChange: backupConfigSchema, onSubmit: backupConfigSchema },
    onSubmit: async ({ value }) => {
      const body = mapFormValuesToCoreAttributes(value, serverName, isRealtimeLicensedValue);
      const data = await setCoreAttributes<SetCoreAttributesResponse>(body);
      if ((data?.errors && Array.isArray(data?.errors)) || data?.error) {
        const errorMessage =
          data?.errors?.[0]?.error ??
          (typeof data?.error === 'string' ? data?.error : data?.error?.message ?? '') ??
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.');
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: errorMessage,
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      } else {
        form.reset(value, { keepDefaultValues: true });
        queryClient.invalidateQueries({ queryKey: backupQueryKeys.serverConfig(serverId) });
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t(
            'label.the_last_changes_has_been_saved_successfully',
            'Changes have been saved successfully',
          ),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      }
    },
  });

  const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);

  return (
    <Container mainAlignment="flex-start" background="gray6">
      <Container
        orientation="column"
        background="gray6"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
      >
        <BackupConfigHeader
          title={`${serverName} ${t('backup.backup_configuration', 'backup configuration')}`}
          isDirty={isDirty}
          onCancel={() => form.reset()}
          onSave={() => form.handleSubmit()}
        />
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-end"
          style={{ overflow: 'auto' }}
          padding={{ all: 'large' }}
          height="calc(100vh - 9.375rem)"
        >
          <ServiceStatus
            serverName={serverName}
            serverId={serverId}
            serviceRunning={serviceRunning}
            onServiceToggle={setServiceRunning}
            allowSetBackup={allowSetBackup}
          />
          <GeneralSettings
            form={form as never}
            allowSetBackup={allowSetBackup}
            isRealtimeLicensed={isRealtimeLicensed}
            isBackupInitialized={isBackupInitialized}
            serverName={serverName}
          />
          <VolumeManagement
            form={form as never}
            allowSetBackup={allowSetBackup}
            isBackupInitialized={isBackupInitialized}
            serverName={serverName}
            backupArchivingStore={backupArchivingStore}
            isBackArchivingStoreEmpty={isBackArchivingStoreEmpty}
          />
          <SmartScanConfig
            form={form as never}
            allowSetBackup={allowSetBackup}
            isBackupInitialized={isBackupInitialized}
            serverName={serverName}
          />
          <DataRetention
            form={form as never}
            allowSetBackup={allowSetBackup}
            isBackupInitialized={isBackupInitialized}
            serverName={serverName}
          />
        </Container>
      </Container>
      <RouteLeavingGuard when={isDirty} onSave={() => form.handleSubmit()} />
    </Container>
  );
}

export const BackupConfiguration = () => {
  const { server } = useParams();
  const { data: allServers = [] } = useAllServers();
  const { moduleLicenseInfo } = useModuleLicenseInfo();

  const selectedServer = allServers.find((serverItem) => serverItem?.name === server);
  const serverId = selectedServer?.id ?? '';
  const { data: serverConfig, isPending } = useServerConfig(serverId || undefined);

  const licenseFeatures = moduleLicenseInfo?.features ?? [];
  const isRealtimeLicensed = licenseFeatures.some(
    (f: Record<string, string | number | boolean>) => f?.name === BACKUP_REALTIME && f?.enabled,
  );

  if (isPending || !serverConfig) {
    return (
      <Container mainAlignment="flex-start" background="gray6">
        <Container
          orientation="column"
          background="gray6"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
        >
          <Row mainAlignment="flex-start" width="100%">
            <Container orientation="vertical" mainAlignment="space-around" height="3.5rem">
              <Row orientation="horizontal" width="100%">
                <Row
                  padding={{ all: 'large' }}
                  mainAlignment="flex-start"
                  width="50%"
                  crossAlignment="flex-start"
                >
                  <ds-text as="h2" size="medium" weight="bold" color="gray0">
                    {server} backup configuration
                  </ds-text>
                </Row>
              </Row>
            </Container>
            <ds-divider></ds-divider>
          </Row>
          <Container mainAlignment="center" height="calc(100vh - 9.375rem)">
            <ds-spinner></ds-spinner>
          </Container>
        </Container>
      </Container>
    );
  }

  return (
    <BackupConfigurationContent
      serverConfig={serverConfig}
      serverName={server ?? ''}
      serverId={serverId}
      isRealtimeLicensed={isRealtimeLicensed}
    />
  );
};
