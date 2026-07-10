/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const bucketVolumeQueryKeys = {
  all: ['bucket-volume'] as const,
  s3Connectors: () => [...bucketVolumeQueryKeys.all, 's3-connectors'] as const,
  s3Regions: () => [...bucketVolumeQueryKeys.all, 's3-regions'] as const,
  hsmPolicies: (server: string) => [...bucketVolumeQueryKeys.all, 'hsm-policies', server] as const,
  powerstoreAttrs: (server: string) =>
    [...bucketVolumeQueryKeys.all, 'powerstore-attrs', server] as const,
  hsmVolumes: (serverId: string) => [...bucketVolumeQueryKeys.all, 'hsm-volumes', serverId] as const,
  serverVolumeSummary: (isAdvanced: boolean) =>
    [...bucketVolumeQueryKeys.all, 'server-volume-summary', String(isAdvanced)] as const,
  allVolumes: (serverId: string) => [...bucketVolumeQueryKeys.all, 'all-volumes', serverId] as const,
} as const;
