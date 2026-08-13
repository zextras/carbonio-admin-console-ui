/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isEqual } from 'lodash-es';

import type { GlobalConfig } from '../../../../types';
import type { DefaultSettingsFormValues } from './types';

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
    ZxBackup_MaxOperationPerAccount: values.maxOperationsPerAccount,
    backupCompressionLevel: values.compressionLevel,
    backupNumberThreadsForAccounts: values.threadsForAccounts,
    backupOnTheFlyMetadata: values.flashMetadataOnSave,
    scheduledMetadataArchivingEnabled: values.archiveMetadataEnabled,
  };
}

export function getDirtyPayload(
  values: DefaultSettingsFormValues,
  defaultValues: DefaultSettingsFormValues,
): Record<string, unknown> {
  const payload = mapFormValuesToModifyData(values);
  const defaultPayload = mapFormValuesToModifyData(defaultValues);

  return Object.fromEntries(
    Object.entries(payload).filter(([key, value]) => !isEqual(value, defaultPayload[key])),
  );
}
