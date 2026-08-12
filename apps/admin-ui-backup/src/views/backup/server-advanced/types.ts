/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';

export type ServerAdvancedFormValues = {
  ldapDumpEnabled: boolean;
  serverConfiguration: boolean;
  purgeOldConfiguration: boolean;
  includeIndex: boolean;
  backupLatencyHighThreshold: string;
  backupLatencyLowThreshold: string;
  backupMaxWaitTime: string;
  backupMaxMetaDataSize: string;
  backupOnTheFlyMetadata: boolean;
  scheduledMetadataArchivingEnabled: boolean;
  backupMaxOperationPerAccount: string;
  backupCompressionLevel: string;
  backupNumberThreadsForItems: string;
  backupNumberThreadsForAccounts: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServerAdvancedFormApi = ReactFormExtendedApi<
  ServerAdvancedFormValues,
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
