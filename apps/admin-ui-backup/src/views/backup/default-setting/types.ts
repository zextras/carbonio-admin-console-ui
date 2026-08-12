/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';

import type { GlobalConfig } from '../../../../types';

export type DefaultSettingsFormValues = {
  moduleEnabledAtStartup: boolean;
  enableRealtimeScanner: boolean;
  runSmartScanOnStartup: boolean;
  backupDestPath: string;
  spaceThreshold: string;
  backupLocalMetadataThreshold: string;
  smartScanScheduleEnabled: boolean;
  smartScanSchedulePattern: string;
  purgeScheduleEnabled: boolean;
  purgeSchedulePattern: string;
  keepDeletedItemsDays: string;
  keepDeletedAccountsDays: string;
  latencyHighThreshold: string;
  latencyLowThreshold: string;
  ldapDumpEnabled: boolean;
  storeServerConfiguration: boolean;
  purgeOldConfigurations: boolean;
  saveIndex: boolean;
  maxMetadataSize: string;
  maxWaitingTime: string;
  maxOperationsPerAccount: string;
  compressionLevel: string;
  threadsForItems: string;
  threadsForAccounts: string;
  flashMetadataOnSave: boolean;
  archiveMetadataEnabled: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DefaultSettingsFormApi = ReactFormExtendedApi<
  DefaultSettingsFormValues,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;

export function mapGlobalConfigToFormValues(globalConfig: GlobalConfig): DefaultSettingsFormValues {
  return {
    moduleEnabledAtStartup: Boolean(globalConfig.ZxBackup_ModuleEnabledAtStartup),
    enableRealtimeScanner: Boolean(globalConfig.ZxBackup_RealTimeScanner),
    runSmartScanOnStartup: Boolean(globalConfig.ZxBackup_DoSmartScanOnStartup),
    backupDestPath: String(globalConfig.ZxBackup_DestPath ?? ''),
    spaceThreshold: String(globalConfig.ZxBackup_SpaceThreshold ?? ''),
    backupLocalMetadataThreshold: String(globalConfig.backupLocalMetadataThreshold ?? ''),
    smartScanScheduleEnabled: Boolean(
      (globalConfig.backupSmartScanScheduler as { 'cron-enabled'?: boolean })?.['cron-enabled'],
    ),
    smartScanSchedulePattern: String(
      (globalConfig.backupSmartScanScheduler as { 'cron-pattern'?: string })?.['cron-pattern'] ?? '',
    ),
    purgeScheduleEnabled: Boolean(
      (globalConfig.backupPurgeScheduler as { 'cron-enabled'?: boolean })?.['cron-enabled'],
    ),
    purgeSchedulePattern: String(
      (globalConfig.backupPurgeScheduler as { 'cron-pattern'?: string })?.['cron-pattern'] ?? '',
    ),
    keepDeletedItemsDays: String(globalConfig.ZxBackup_DataRetentionDays ?? ''),
    keepDeletedAccountsDays: String(globalConfig.backupAccountsRetentionDays ?? ''),
    latencyHighThreshold: String(globalConfig.backupLatencyHighThreshold ?? ''),
    latencyLowThreshold: String(globalConfig.backupLatencyLowThreshold ?? ''),
    ldapDumpEnabled: Boolean(globalConfig.ldapDumpEnabled),
    storeServerConfiguration: Boolean(globalConfig.ZxBackup_BackupCustomizations),
    purgeOldConfigurations: Boolean(globalConfig.ZxBackup_PurgeCustomizations),
    saveIndex: Boolean(globalConfig.backupSaveIndex),
    maxMetadataSize: String(globalConfig.ZxBackup_MaxMetadataSize ?? ''),
    maxWaitingTime: String(globalConfig.ZxBackup_MaxWaitingTime ?? ''),
    maxOperationsPerAccount: String(globalConfig.ZxBackup_MaxOperationPerAccount ?? ''),
    compressionLevel: String(globalConfig.backupCompressionLevel ?? ''),
    threadsForItems: String(globalConfig.backupNumberThreadsForAccounts ?? ''),
    threadsForAccounts: String(globalConfig.backupNumberThreadsForAccounts ?? ''),
    flashMetadataOnSave: Boolean(globalConfig.backupOnTheFlyMetadata),
    archiveMetadataEnabled: Boolean(globalConfig.scheduledMetadataArchivingEnabled),
  };
}

export function mapFormValuesToModifyData(
  values: DefaultSettingsFormValues,
): Record<string, unknown> {
  return {
    ZxBackup_ModuleEnabledAtStartup: values.moduleEnabledAtStartup,
    ZxBackup_RealTimeScanner: values.enableRealtimeScanner,
    ZxBackup_DoSmartScanOnStartup: values.runSmartScanOnStartup,
    ZxBackup_DestPath: values.backupDestPath,
    ZxBackup_SpaceThreshold: values.spaceThreshold,
    backupLocalMetadataThreshold: values.backupLocalMetadataThreshold,
    backupSmartScanScheduler: {
      'cron-enabled': values.smartScanScheduleEnabled,
      'cron-pattern': values.smartScanSchedulePattern,
    },
    backupPurgeScheduler: {
      'cron-enabled': values.purgeScheduleEnabled,
      'cron-pattern': values.purgeSchedulePattern,
    },
    ZxBackup_DataRetentionDays: values.keepDeletedItemsDays,
    backupAccountsRetentionDays: values.keepDeletedAccountsDays,
    backupLatencyHighThreshold: values.latencyHighThreshold,
    backupLatencyLowThreshold: values.latencyLowThreshold,
    ldapDumpEnabled: values.ldapDumpEnabled,
    ZxBackup_BackupCustomizations: values.storeServerConfiguration,
    ZxBackup_PurgeCustomizations: values.purgeOldConfigurations,
    backupSaveIndex: values.saveIndex,
    ZxBackup_MaxMetadataSize: values.maxMetadataSize,
    ZxBackup_MaxWaitingTime: values.maxWaitingTime,
    ZxBackup_MaxOperationPerAccount: values.maxOperationsPerAccount,
    backupCompressionLevel: values.compressionLevel,
    backupNumberThreadsForAccounts: values.threadsForAccounts,
    backupOnTheFlyMetadata: values.flashMetadataOnSave,
    scheduledMetadataArchivingEnabled: values.archiveMetadataEnabled,
  };
}
