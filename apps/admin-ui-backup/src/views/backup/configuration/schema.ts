/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod';

export const BACKUP_CONFIG_VALIDATION_MESSAGES: Record<string, string> = {
  'backup.validation.threshold_invalid': 'Enter a whole number of 0 or more',
  'backup.validation.schedule_required': 'Schedule is required',
};

function isNonNegativeInteger(value: string): boolean {
  return value === '' || /^\d+$/.test(value);
}

const optionalNonNegativeInt = z
  .string()
  .refine(isNonNegativeInteger, { message: 'backup.validation.threshold_invalid' });

export const backupConfigSchema = z.object({
  moduleEnableStartup: z.boolean(),
  enableRealtimeScanner: z.boolean(),
  runSmartScanStartup: z.boolean(),
  spaceThreshold: optionalNonNegativeInt,
  backupDestPath: z.string(),
  isScheduleSmartScan: z.boolean(),
  scheduleSmartScan: z.string(),
  scheduleAutomaticRetentionPolicy: z.boolean(),
  retentionPolicySchedule: z.string(),
  keepDeletedItemInBackup: optionalNonNegativeInt,
  keepDeletedAccountsInBackup: optionalNonNegativeInt,
});
