/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';

export type VolumeCreateFormValues = {
  id: string;
  volumeName: string;
  volumeMain: number;
  path: string;
  isCurrent: boolean;
  isCompression: boolean;
  compressionThreshold: string;
  volumeAllocation: number;
};

export type VolumeCreateFormApi = ReactFormExtendedApi<
  VolumeCreateFormValues,
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
