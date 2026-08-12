/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod';

function isNonNegativeInteger(value: string): boolean {
  return value === '' || /^\d+$/.test(value);
}

const optionalNonNegativeInt = z
  .string()
  .refine(isNonNegativeInteger, { message: 'backup.validation.threshold_invalid' });

export const defaultSettingsSchema = z.object({
  moduleEnabledAtStartup: z.boolean(),
  enableRealtimeScanner: z.boolean(),
  runSmartScanOnStartup: z.boolean(),
  backupDestPath: z.string(),
  spaceThreshold: optionalNonNegativeInt,
  backupLocalMetadataThreshold: optionalNonNegativeInt,
  smartScanScheduleEnabled: z.boolean(),
  smartScanSchedulePattern: z.string(),
  purgeScheduleEnabled: z.boolean(),
  purgeSchedulePattern: z.string(),
  keepDeletedItemsDays: optionalNonNegativeInt,
  keepDeletedAccountsDays: optionalNonNegativeInt,
  latencyHighThreshold: optionalNonNegativeInt,
  latencyLowThreshold: optionalNonNegativeInt,
  ldapDumpEnabled: z.boolean(),
  storeServerConfiguration: z.boolean(),
  purgeOldConfigurations: z.boolean(),
  saveIndex: z.boolean(),
  maxMetadataSize: optionalNonNegativeInt,
  maxWaitingTime: optionalNonNegativeInt,
  maxOperationsPerAccount: optionalNonNegativeInt,
  compressionLevel: z.string(),
  threadsForItems: optionalNonNegativeInt,
  threadsForAccounts: optionalNonNegativeInt,
  flashMetadataOnSave: z.boolean(),
  archiveMetadataEnabled: z.boolean(),
});
