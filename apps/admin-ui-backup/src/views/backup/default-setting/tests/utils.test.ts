/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { GlobalConfig } from '../../../../../types';
import { getDirtyPayload, mapFormValuesToModifyData, mapGlobalConfigToFormValues } from '../utils';

describe('mapGlobalConfigToFormValues', () => {
  it('maps all fields from a fully populated GlobalConfig', () => {
    const globalConfig: GlobalConfig = {
      ZxBackup_ModuleEnabledAtStartup: true,
      ZxBackup_RealTimeScanner: true,
      ZxBackup_DoSmartScanOnStartup: true,
      ZxBackup_DestPath: '/opt/backup',
      ZxBackup_SpaceThreshold: '90',
      backupLocalMetadataThreshold: '1024',
      backupSmartScanScheduler: { 'cron-enabled': true, 'cron-pattern': '0 2 * * *' },
      backupPurgeScheduler: { 'cron-enabled': false, 'cron-pattern': '0 3 * * 0' },
      ZxBackup_DataRetentionDays: '30',
      backupAccountsRetentionDays: '60',
      backupLatencyHighThreshold: '5000',
      backupLatencyLowThreshold: '1000',
      ldapDumpEnabled: true,
      ZxBackup_BackupCustomizations: true,
      ZxBackup_PurgeCustomizations: false,
      backupSaveIndex: true,
      ZxBackup_MaxMetadataSize: '50',
      ZxBackup_MaxOperationPerAccount: '10',
      backupCompressionLevel: '6',
      backupNumberThreadsForAccounts: '8',
      backupOnTheFlyMetadata: true,
      scheduledMetadataArchivingEnabled: false,
    };

    const result = mapGlobalConfigToFormValues(globalConfig);

    expect(result).toEqual({
      moduleEnabledAtStartup: true,
      enableRealtimeScanner: true,
      runSmartScanOnStartup: true,
      backupDestPath: '/opt/backup',
      spaceThreshold: '90',
      backupLocalMetadataThreshold: '1024',
      smartScanScheduleEnabled: true,
      smartScanSchedulePattern: '0 2 * * *',
      purgeScheduleEnabled: false,
      purgeSchedulePattern: '0 3 * * 0',
      keepDeletedItemsDays: '30',
      keepDeletedAccountsDays: '60',
      latencyHighThreshold: '5000',
      latencyLowThreshold: '1000',
      ldapDumpEnabled: true,
      storeServerConfiguration: true,
      purgeOldConfigurations: false,
      saveIndex: true,
      maxMetadataSize: '50',
      maxOperationsPerAccount: '10',
      compressionLevel: '6',
      threadsForItems: '8',
      threadsForAccounts: '8',
      flashMetadataOnSave: true,
      archiveMetadataEnabled: false,
    });
  });

  it('handles undefined/null fields with safe defaults (empty strings, false)', () => {
    const globalConfig: GlobalConfig = {};

    const result = mapGlobalConfigToFormValues(globalConfig);

    expect(result).toEqual({
      moduleEnabledAtStartup: false,
      enableRealtimeScanner: false,
      runSmartScanOnStartup: false,
      backupDestPath: '',
      spaceThreshold: '',
      backupLocalMetadataThreshold: '',
      smartScanScheduleEnabled: false,
      smartScanSchedulePattern: '',
      purgeScheduleEnabled: false,
      purgeSchedulePattern: '',
      keepDeletedItemsDays: '',
      keepDeletedAccountsDays: '',
      latencyHighThreshold: '',
      latencyLowThreshold: '',
      ldapDumpEnabled: false,
      storeServerConfiguration: false,
      purgeOldConfigurations: false,
      saveIndex: false,
      maxMetadataSize: '',
      maxOperationsPerAccount: '',
      compressionLevel: '',
      threadsForItems: '',
      threadsForAccounts: '',
      flashMetadataOnSave: false,
      archiveMetadataEnabled: false,
    });
  });

  it('handles missing cron scheduler objects', () => {
    const globalConfig: GlobalConfig = {
      ZxBackup_ModuleEnabledAtStartup: true,
    };

    const result = mapGlobalConfigToFormValues(globalConfig);

    expect(result.smartScanScheduleEnabled).toBe(false);
    expect(result.smartScanSchedulePattern).toBe('');
    expect(result.purgeScheduleEnabled).toBe(false);
    expect(result.purgeSchedulePattern).toBe('');
  });
});

describe('mapFormValuesToModifyData', () => {
  it('maps all form values to the SOAP modify payload shape', () => {
    const formValues = {
      moduleEnabledAtStartup: true,
      enableRealtimeScanner: false,
      runSmartScanOnStartup: true,
      backupDestPath: '/var/backup',
      spaceThreshold: '80',
      backupLocalMetadataThreshold: '2048',
      smartScanScheduleEnabled: true,
      smartScanSchedulePattern: '30 1 * * *',
      purgeScheduleEnabled: false,
      purgeSchedulePattern: '0 4 * * 6',
      keepDeletedItemsDays: '14',
      keepDeletedAccountsDays: '90',
      latencyHighThreshold: '3000',
      latencyLowThreshold: '500',
      ldapDumpEnabled: false,
      storeServerConfiguration: true,
      purgeOldConfigurations: true,
      saveIndex: false,
      maxMetadataSize: '100',
      maxOperationsPerAccount: '5',
      compressionLevel: '3',
      threadsForItems: '4',
      threadsForAccounts: '4',
      flashMetadataOnSave: false,
      archiveMetadataEnabled: true,
    };

    const result = mapFormValuesToModifyData(formValues);

    expect(result).toEqual({
      ZxBackup_ModuleEnabledAtStartup: true,
      ZxBackup_RealTimeScanner: false,
      ZxBackup_DoSmartScanOnStartup: true,
      ZxBackup_DestPath: '/var/backup',
      ZxBackup_SpaceThreshold: '80',
      backupLocalMetadataThreshold: '2048',
      backupSmartScanScheduler: { 'cron-enabled': true, 'cron-pattern': '30 1 * * *' },
      backupPurgeScheduler: { 'cron-enabled': false, 'cron-pattern': '0 4 * * 6' },
      ZxBackup_DataRetentionDays: '14',
      backupAccountsRetentionDays: '90',
      backupLatencyHighThreshold: '3000',
      backupLatencyLowThreshold: '500',
      ldapDumpEnabled: false,
      ZxBackup_BackupCustomizations: true,
      ZxBackup_PurgeCustomizations: true,
      backupSaveIndex: false,
      ZxBackup_MaxMetadataSize: '100',
      ZxBackup_MaxOperationPerAccount: '5',
      backupCompressionLevel: '3',
      backupNumberThreadsForAccounts: '4',
      backupOnTheFlyMetadata: false,
      scheduledMetadataArchivingEnabled: true,
    });
  });

  it('round-trip mapping (globalConfig -> form -> modifyData)', () => {
    const globalConfig: GlobalConfig = {
      ZxBackup_ModuleEnabledAtStartup: false,
      ZxBackup_RealTimeScanner: true,
      ZxBackup_DoSmartScanOnStartup: false,
      ZxBackup_DestPath: '/mnt/backups',
      ZxBackup_SpaceThreshold: '75',
      backupLocalMetadataThreshold: '512',
      backupSmartScanScheduler: { 'cron-enabled': true, 'cron-pattern': '0 5 * * *' },
      backupPurgeScheduler: { 'cron-enabled': true, 'cron-pattern': '0 6 * * 1' },
      ZxBackup_DataRetentionDays: '45',
      backupAccountsRetentionDays: '120',
      backupLatencyHighThreshold: '7000',
      backupLatencyLowThreshold: '2000',
      ldapDumpEnabled: true,
      ZxBackup_BackupCustomizations: false,
      ZxBackup_PurgeCustomizations: true,
      backupSaveIndex: true,
      ZxBackup_MaxMetadataSize: '75',
      ZxBackup_MaxOperationPerAccount: '20',
      backupCompressionLevel: '9',
      backupNumberThreadsForAccounts: '16',
      backupOnTheFlyMetadata: true,
      scheduledMetadataArchivingEnabled: true,
    };

    const formValues = mapGlobalConfigToFormValues(globalConfig);
    const modifyData = mapFormValuesToModifyData(formValues);

    expect(modifyData).toEqual({
      ZxBackup_ModuleEnabledAtStartup: false,
      ZxBackup_RealTimeScanner: true,
      ZxBackup_DoSmartScanOnStartup: false,
      ZxBackup_DestPath: '/mnt/backups',
      ZxBackup_SpaceThreshold: '75',
      backupLocalMetadataThreshold: '512',
      backupSmartScanScheduler: { 'cron-enabled': true, 'cron-pattern': '0 5 * * *' },
      backupPurgeScheduler: { 'cron-enabled': true, 'cron-pattern': '0 6 * * 1' },
      ZxBackup_DataRetentionDays: '45',
      backupAccountsRetentionDays: '120',
      backupLatencyHighThreshold: '7000',
      backupLatencyLowThreshold: '2000',
      ldapDumpEnabled: true,
      ZxBackup_BackupCustomizations: false,
      ZxBackup_PurgeCustomizations: true,
      backupSaveIndex: true,
      ZxBackup_MaxMetadataSize: '75',
      ZxBackup_MaxOperationPerAccount: '20',
      backupCompressionLevel: '9',
      backupNumberThreadsForAccounts: '16',
      backupOnTheFlyMetadata: true,
      scheduledMetadataArchivingEnabled: true,
    });
  });
});

describe('getDirtyPayload', () => {
  it('returns only changed fields when values differ from defaults', () => {
    const defaultValues = {
      moduleEnabledAtStartup: false,
      enableRealtimeScanner: false,
      runSmartScanOnStartup: false,
      backupDestPath: '',
      spaceThreshold: '',
      backupLocalMetadataThreshold: '',
      smartScanScheduleEnabled: false,
      smartScanSchedulePattern: '',
      purgeScheduleEnabled: false,
      purgeSchedulePattern: '',
      keepDeletedItemsDays: '',
      keepDeletedAccountsDays: '',
      latencyHighThreshold: '',
      latencyLowThreshold: '',
      ldapDumpEnabled: false,
      storeServerConfiguration: false,
      purgeOldConfigurations: false,
      saveIndex: false,
      maxMetadataSize: '',
      maxOperationsPerAccount: '',
      compressionLevel: '',
      threadsForItems: '',
      threadsForAccounts: '',
      flashMetadataOnSave: false,
      archiveMetadataEnabled: false,
    };

    const values = {
      ...defaultValues,
      backupDestPath: '/new/path',
      enableRealtimeScanner: true,
    };

    const result = getDirtyPayload(values, defaultValues);

    expect(result).toEqual({
      ZxBackup_DestPath: '/new/path',
      ZxBackup_RealTimeScanner: true,
    });
    expect(Object.keys(result)).toHaveLength(2);
  });

  it('returns empty object when values equal defaults', () => {
    const defaultValues = {
      moduleEnabledAtStartup: true,
      enableRealtimeScanner: true,
      runSmartScanOnStartup: false,
      backupDestPath: '/default',
      spaceThreshold: '50',
      backupLocalMetadataThreshold: '256',
      smartScanScheduleEnabled: true,
      smartScanSchedulePattern: '0 0 * * *',
      purgeScheduleEnabled: false,
      purgeSchedulePattern: '',
      keepDeletedItemsDays: '7',
      keepDeletedAccountsDays: '30',
      latencyHighThreshold: '1000',
      latencyLowThreshold: '200',
      ldapDumpEnabled: false,
      storeServerConfiguration: true,
      purgeOldConfigurations: false,
      saveIndex: false,
      maxMetadataSize: '25',
      maxOperationsPerAccount: '3',
      compressionLevel: '5',
      threadsForItems: '2',
      threadsForAccounts: '2',
      flashMetadataOnSave: true,
      archiveMetadataEnabled: false,
    };

    const result = getDirtyPayload(defaultValues, defaultValues);

    expect(result).toEqual({});
  });

  it('handles nested object changes (scheduler fields)', () => {
    const defaultValues = {
      moduleEnabledAtStartup: false,
      enableRealtimeScanner: false,
      runSmartScanOnStartup: false,
      backupDestPath: '',
      spaceThreshold: '',
      backupLocalMetadataThreshold: '',
      smartScanScheduleEnabled: false,
      smartScanSchedulePattern: '0 0 * * *',
      purgeScheduleEnabled: false,
      purgeSchedulePattern: '',
      keepDeletedItemsDays: '',
      keepDeletedAccountsDays: '',
      latencyHighThreshold: '',
      latencyLowThreshold: '',
      ldapDumpEnabled: false,
      storeServerConfiguration: false,
      purgeOldConfigurations: false,
      saveIndex: false,
      maxMetadataSize: '',
      maxOperationsPerAccount: '',
      compressionLevel: '',
      threadsForItems: '',
      threadsForAccounts: '',
      flashMetadataOnSave: false,
      archiveMetadataEnabled: false,
    };

    const values = {
      ...defaultValues,
      smartScanScheduleEnabled: true,
      smartScanSchedulePattern: '30 1 * * *',
    };

    const result = getDirtyPayload(values, defaultValues);

    expect(result).toEqual({
      backupSmartScanScheduler: { 'cron-enabled': true, 'cron-pattern': '30 1 * * *' },
    });
    expect(Object.keys(result)).toHaveLength(1);
  });
});
