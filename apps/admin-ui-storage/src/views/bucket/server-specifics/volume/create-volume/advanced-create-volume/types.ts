/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';

export type AdvancedVolumeFormValues = {
  volumeName: string;
  volumeMain: number;
  isCurrent: boolean;
  volumeAllocation: string;
  bucketName: string;
  unusedBucketType: string;
  tieringSupported: boolean;
  bucketId: string;
  prefix: string;
  centralized: boolean;
  useInfrequentAccess: boolean;
  infrequentAccessThreshold: string;
  useIntelligentTiering: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdvancedVolumeFormApi = ReactFormExtendedApi<
  AdvancedVolumeFormValues,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;
