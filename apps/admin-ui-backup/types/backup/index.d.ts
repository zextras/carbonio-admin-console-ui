/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type CronScheduler = {
  'cron-pattern': string;
  'cron-enabled': boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GlobalConfig = Record<string, any>;

export type MailstoreServer = {
  id?: string;
  name?: string;
};

export type BackupConfigurationState = {
  moduleEnableStartup: boolean;
  enableRealtimeScanner: boolean;
  runSmartScanStartup: boolean;
  spaceThreshold: number;
  isScheduleSmartScan: boolean;
  scheduleSmartScan: string;
  scheduleAutomaticRetentionPolicy: boolean;
  retentionPolicySchedule: string;
  backupDestPath: string;
  keepDeletedItemInBackup: number;
  keepDeletedAccountsInBackup: number;
};

export type ServerAdvancedState = {
  ldapDumpEnabled: boolean;
  backupLatencyLowThreshold: number;
  backupLatencyHighThreshold: number;
  backupMaxWaitTime: number;
  backupMaxMetaDataSize: number;
  backupOnTheFlyMetadata: boolean;
  scheduledMetadataArchivingEnabled: boolean;
  backupMaxOperationPerAccount: number;
  backupCompressionLevel: number;
  backupNumberThreadsForItems: number;
  backupNumberThreadsForAccounts: number;
  serverConfiguration: boolean;
  purgeOldConfiguration: boolean;
  includeIndex: boolean;
};

export type BackupArchivingStore = {
  storeType?: string;
  volumeRootPath?: string;
  bucketConfigurationId?: string;
};

export type BucketItem = {
  storeType: string;
  bucketName: string;
  uuid: string;
};

export type SelectOption = {
  label: string;
  value: string;
};

export type BackupServerType = {
  id: string;
  name: string;
  description: string;
  backupAtStartup?: string;
  rtStatus?: string;
  type?: string;
  purge?: string;
  smartScan?: string;
  availableMetadataSpace?: string;
  availableBackupSpace?: string;
  purgeTooltip?: string;
  smartScanTooltip?: string;
  availableMetadataSpaceTooltip?: string;
  availableBackupSpaceTooltip?: string;
};

export type StatusOption = {
  label: string;
  value: boolean;
};

export type SmartScanTypeOption = {
  label: string;
  value: number;
};

export type TableHeader = {
  id: string;
  label: string;
  width: string;
  bold: boolean;
};

export type CoreAttributeValue = {
  value: boolean | string | number | CronScheduler;
  objectName?: string;
  configType: string;
};

export type CoreAttributeBody = Record<string, CoreAttributeValue>;

export type ModifyBackupData = Record<string, unknown>;

export type ServerAttributeValue<T = unknown> = {
  value: T;
};

export type BackupServerAttributes = {
  ZxBackup_ModuleEnabledAtStartup?: ServerAttributeValue<boolean>;
  ZxBackup_RealTimeScanner?: ServerAttributeValue<boolean>;
  ZxBackup_DoSmartScanOnStartup?: ServerAttributeValue<boolean>;
  ZxBackup_SpaceThreshold?: ServerAttributeValue<number>;
  ZxBackup_DestPath?: ServerAttributeValue<string>;
  ZxBackup_DataRetentionDays?: ServerAttributeValue<number>;
  ZxBackup_MaxWaitingTime?: ServerAttributeValue<number>;
  ZxBackup_MaxMetadataSize?: ServerAttributeValue<number>;
  ZxBackup_MaxOperationPerAccount?: ServerAttributeValue<number>;
  ZxBackup_BackupCustomizations?: ServerAttributeValue<boolean>;
  ZxBackup_PurgeCustomizations?: ServerAttributeValue<boolean>;
  backupSmartScanScheduler?: ServerAttributeValue<CronScheduler>;
  backupPurgeScheduler?: ServerAttributeValue<CronScheduler>;
  backupAccountsRetentionDays?: ServerAttributeValue<number>;
  backupArchivingStore?: ServerAttributeValue<BackupArchivingStore>;
  ldapDumpEnabled?: ServerAttributeValue<boolean>;
  backupLatencyLowThreshold?: ServerAttributeValue<number>;
  backupLatencyHighThreshold?: ServerAttributeValue<number>;
  backupOnTheFlyMetadata?: ServerAttributeValue<boolean>;
  scheduledMetadataArchivingEnabled?: ServerAttributeValue<boolean>;
  backupCompressionLevel?: ServerAttributeValue<number>;
  backupNumberThreadsForItems?: ServerAttributeValue<number>;
  backupNumberThreadsForAccounts?: ServerAttributeValue<number>;
  backupSaveIndex?: ServerAttributeValue<boolean>;
};

export type GetServerResponse = {
  attributes?: BackupServerAttributes;
  services?: {
    module?: {
      running?: boolean;
    };
  };
  properties?: {
    backup_initialized?: boolean;
    available_space_for_metadata?: number;
    available_space_for_blobs?: number;
  };
};

export type ModifyBackupRequestPayload = Record<
  string,
  {
    value: unknown;
    configType: string;
  }
>;
