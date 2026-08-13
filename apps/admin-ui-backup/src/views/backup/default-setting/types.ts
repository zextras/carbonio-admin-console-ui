/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';

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
  maxOperationsPerAccount: string;
  compressionLevel: string;
  threadsForItems: string;
  threadsForAccounts: string;
  flashMetadataOnSave: boolean;
  archiveMetadataEnabled: boolean;
};

 
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
