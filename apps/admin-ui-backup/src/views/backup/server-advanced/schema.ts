/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod';

export const SERVER_ADVANCED_VALIDATION_MESSAGES: Record<string, string> = {
  'backup.validation.threshold_invalid': 'Enter a whole number of 0 or more',
};

function isNonNegativeInteger(value: string): boolean {
  return value === '' || /^\d+$/.test(value);
}

const optionalNonNegativeInt = z
  .string()
  .refine(isNonNegativeInteger, { message: 'backup.validation.threshold_invalid' });

export const serverAdvancedSchema = z.object({
  ldapDumpEnabled: z.boolean(),
  serverConfiguration: z.boolean(),
  purgeOldConfiguration: z.boolean(),
  includeIndex: z.boolean(),
  backupLatencyHighThreshold: optionalNonNegativeInt,
  backupLatencyLowThreshold: optionalNonNegativeInt,
  backupMaxWaitTime: optionalNonNegativeInt,
  backupMaxMetaDataSize: optionalNonNegativeInt,
  backupOnTheFlyMetadata: z.boolean(),
  scheduledMetadataArchivingEnabled: z.boolean(),
  backupMaxOperationPerAccount: optionalNonNegativeInt,
  backupCompressionLevel: optionalNonNegativeInt,
  backupNumberThreadsForItems: optionalNonNegativeInt,
  backupNumberThreadsForAccounts: optionalNonNegativeInt,
});
