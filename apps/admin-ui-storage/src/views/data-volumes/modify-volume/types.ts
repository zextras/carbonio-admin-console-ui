/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';

export type ModifyVolumeFormValues = {
  name: string;
  rootpath: string;
  compressBlobs: boolean;
  isCurrent: boolean;
  compressionThreshold: string;
  volumePrefix: string;
  bucketConfigurationId: string;
  useInfrequentAccess: boolean;
  useIntelligentTiering: boolean;
  infrequentAccessThreshold: string;
};

export type ModifyVolumeFormApi = ReactFormExtendedApi<
  ModifyVolumeFormValues,
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
