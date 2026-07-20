/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const s3ConnectorVolumeQueryKeys = {
  all: ['s3-connector-volume'] as const,
  s3Connectors: () => [...s3ConnectorVolumeQueryKeys.all, 's3-connectors'] as const,
  s3Regions: () => [...s3ConnectorVolumeQueryKeys.all, 's3-regions'] as const,
  hsmPolicies: (server: string) =>
    [...s3ConnectorVolumeQueryKeys.all, 'hsm-policies', server] as const,
  powerstoreAttrs: (server: string) =>
    [...s3ConnectorVolumeQueryKeys.all, 'powerstore-attrs', server] as const,
  hsmVolumes: (serverId: string) =>
    [...s3ConnectorVolumeQueryKeys.all, 'hsm-volumes', serverId] as const,
  serverVolumeSummary: (isAdvanced: boolean) =>
    [...s3ConnectorVolumeQueryKeys.all, 'server-volume-summary', String(isAdvanced)] as const,
  allVolumes: (serverId: string) =>
    [...s3ConnectorVolumeQueryKeys.all, 'all-volumes', serverId] as const,
  getVolume: (volumeId: string, serverId: string) =>
    [...s3ConnectorVolumeQueryKeys.all, 'get-volume', volumeId, serverId] as const,
} as const;
