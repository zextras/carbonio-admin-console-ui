/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';
import { Container, RouteLeavingGuard, Row, useSnackbar } from '@zextras/ui-components';
import { setCoreAttributes, useAllServers, useCurrentUserRights } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import type {
  CoreAttributeBody,
  GetServerResponse,
  SetCoreAttributesResponse,
} from '../../../../types';
import { SERVER } from '../../../constants';
import { backupQueryKeys } from '../../../services/backup-query-keys';
import { useServerConfig } from '../../../services/use-server-config';
import { checkAllowSetBackup } from '../../../utils/check-backup-rights';
import { BackupConfigHeader } from '../components/backup/backup-config-header';
import { serverAdvancedSchema } from './schema';
import { BackupOptions } from './sections/backup-options';
import { LatencySettings } from './sections/latency-settings';
import { MetadataSettings } from './sections/metadata-settings';
import { OtherControls } from './sections/other-controls';
import type { ServerAdvancedFormValues } from './types';

function mapServerConfigToFormValues(
  data: GetServerResponse | undefined,
): ServerAdvancedFormValues {
  const attr = data?.attributes;
  return {
    ldapDumpEnabled: attr?.ldapDumpEnabled?.value ?? false,
    serverConfiguration: attr?.ZxBackup_BackupCustomizations?.value ?? false,
    purgeOldConfiguration: attr?.ZxBackup_PurgeCustomizations?.value ?? false,
    includeIndex: attr?.backupSaveIndex?.value ?? false,
    backupLatencyHighThreshold: String(attr?.backupLatencyHighThreshold?.value ?? 0),
    backupLatencyLowThreshold: String(attr?.backupLatencyLowThreshold?.value ?? 0),
    backupMaxMetaDataSize: String(attr?.ZxBackup_MaxMetadataSize?.value ?? 0),
    backupOnTheFlyMetadata: attr?.backupOnTheFlyMetadata?.value ?? false,
    scheduledMetadataArchivingEnabled: attr?.scheduledMetadataArchivingEnabled?.value ?? false,
    backupMaxOperationPerAccount: String(attr?.ZxBackup_MaxOperationPerAccount?.value ?? 0),
    backupCompressionLevel: String(attr?.backupCompressionLevel?.value ?? 0),
    backupNumberThreadsForItems: String(attr?.backupNumberThreadsForItems?.value ?? 0),
    backupNumberThreadsForAccounts: String(attr?.backupNumberThreadsForAccounts?.value ?? 0),
  };
}

function mapFormValuesToCoreAttributes(
  values: ServerAdvancedFormValues,
  server: string,
): CoreAttributeBody {
  return {
    ldapDumpEnabled: { value: values.ldapDumpEnabled, objectName: server, configType: SERVER },
    ZxBackup_BackupCustomizations: {
      value: values.serverConfiguration,
      objectName: server,
      configType: SERVER,
    },
    ZxBackup_PurgeCustomizations: {
      value: values.purgeOldConfiguration,
      objectName: server,
      configType: SERVER,
    },
    backupSaveIndex: { value: values.includeIndex, objectName: server, configType: SERVER },
    backupLatencyHighThreshold: {
      value: Number(values.backupLatencyHighThreshold),
      objectName: server,
      configType: SERVER,
    },
    backupLatencyLowThreshold: {
      value: Number(values.backupLatencyLowThreshold),
      objectName: server,
      configType: SERVER,
    },
    ZxBackup_MaxMetadataSize: {
      value: Number(values.backupMaxMetaDataSize),
      objectName: server,
      configType: SERVER,
    },
    backupOnTheFlyMetadata: {
      value: values.backupOnTheFlyMetadata,
      objectName: server,
      configType: SERVER,
    },
    scheduledMetadataArchivingEnabled: {
      value: values.scheduledMetadataArchivingEnabled,
      objectName: server,
      configType: SERVER,
    },
    ZxBackup_MaxOperationPerAccount: {
      value: Number(values.backupMaxOperationPerAccount),
      objectName: server,
      configType: SERVER,
    },
    backupCompressionLevel: {
      value: Number(values.backupCompressionLevel),
      objectName: server,
      configType: SERVER,
    },
    backupNumberThreadsForItems: {
      value: Number(values.backupNumberThreadsForItems),
      objectName: server,
      configType: SERVER,
    },
    backupNumberThreadsForAccounts: {
      value: Number(values.backupNumberThreadsForAccounts),
      objectName: server,
      configType: SERVER,
    },
  };
}

function ServerAdvancedContent({
  serverConfig,
  serverName,
  serverId,
}: {
  readonly serverConfig: GetServerResponse;
  readonly serverName: string;
  readonly serverId: string;
}) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const { data: rights } = useCurrentUserRights();
  const allowSetBackup = checkAllowSetBackup(rights);

  const form = useForm({
    defaultValues: mapServerConfigToFormValues(serverConfig),
    validators: { onChange: serverAdvancedSchema, onSubmit: serverAdvancedSchema },
    onSubmit: async ({ value }) => {
      const body = mapFormValuesToCoreAttributes(value, serverName);
      const data = await setCoreAttributes<SetCoreAttributesResponse>(body);
      if (data?.errors && Array.isArray(data?.errors)) {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label:
            data?.errors[0]?.error ??
            t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
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
          title={t('backup.advanced', 'Advanced')}
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
          <BackupOptions form={form as never} allowSetBackup={allowSetBackup} />
          <LatencySettings form={form as never} allowSetBackup={allowSetBackup} />
          <MetadataSettings form={form as never} allowSetBackup={allowSetBackup} />
          <OtherControls form={form as never} allowSetBackup={allowSetBackup} />
        </Container>
      </Container>
      <RouteLeavingGuard when={isDirty} onSave={() => form.handleSubmit()} />
    </Container>
  );
}

export const ServerAdvanced = () => {
  const { server } = useParams();
  const { data: allServers = [] } = useAllServers();

  const selectedServer = allServers.find((serverItem) => serverItem?.name === server);
  const serverId = selectedServer?.id ?? '';
  const { data: serverConfig, isPending } = useServerConfig(serverId || undefined);

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
                    Advanced
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
    <ServerAdvancedContent
      serverConfig={serverConfig}
      serverName={server ?? ''}
      serverId={serverId}
    />
  );
};
