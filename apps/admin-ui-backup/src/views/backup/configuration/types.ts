/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';

export type BackupConfigFormValues = {
  moduleEnableStartup: boolean;
  enableRealtimeScanner: boolean;
  runSmartScanStartup: boolean;
  spaceThreshold: string;
  backupDestPath: string;
  isScheduleSmartScan: boolean;
  scheduleSmartScan: string;
  scheduleAutomaticRetentionPolicy: boolean;
  retentionPolicySchedule: string;
  keepDeletedItemInBackup: string;
  keepDeletedAccountsInBackup: string;
};

export type BackupConfigFormApi = ReactFormExtendedApi<
  BackupConfigFormValues,
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
