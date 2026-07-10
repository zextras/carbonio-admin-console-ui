/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const bucketVolumeQueryKeys = {
  all: ['bucket-volume'] as const,
  s3Connectors: () => [...bucketVolumeQueryKeys.all, 's3-connectors'] as const,
  s3Regions: () => [...bucketVolumeQueryKeys.all, 's3-regions'] as const,
} as const;
