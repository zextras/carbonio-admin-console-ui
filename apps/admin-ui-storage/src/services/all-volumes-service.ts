/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { Volume } from '../../types';
import { ZIMBRA_ADMIN_URN } from '../constants';
import { fetchSoap } from './bucket-service';

export type VolumeBuckets = {
  primaries: Array<Volume>;
  indexes: Array<Volume>;
  secondaries: Array<Volume>;
};

function normalizeAdvancedVolume(volume: Volume): Volume {
  return {
    ...volume,
    bucketConfigurationId: volume.bucketConfigurationId ?? volume.uuid,
    compressBlobs: volume.compressBlobs ?? String(volume.compressed ?? false),
    compressionThreshold: volume.compressionThreshold ?? String(volume.threshold ?? ''),
    rootpath: volume.rootpath ?? volume.path,
  };
}

function normalizeAdvancedVolumeList(volumes: Array<Volume> | undefined): Array<Volume> {
  return volumes?.map(normalizeAdvancedVolume) ?? [];
}

export const getAllVolumesForServer = async (
  server: string,
  selectedServerId: string,
  isAdvanced: boolean,
): Promise<VolumeBuckets> => {
  if (isAdvanced) {
    const res = await fetchSoap('zextras', {
      _jsns: ZIMBRA_ADMIN_URN,
      module: 'ZxPowerstore',
      action: 'getAllVolumes',
      targetServers: server,
    });

    const result = JSON.parse(res?.Body?.response?.content ?? '{}');
    const getAllVolResponse = Object.keys(result?.response ?? {}).map(
      (key) => result?.response[key],
    )[0];

    if (getAllVolResponse?.ok) {
      return {
        primaries: normalizeAdvancedVolumeList(getAllVolResponse?.response?.primaries),
        secondaries: normalizeAdvancedVolumeList(getAllVolResponse?.response?.secondaries),
        indexes: normalizeAdvancedVolumeList(getAllVolResponse?.response?.indexes),
      };
    }

    throw new Error('Failed to fetch volumes');
  }

  const response = (await soapFetch(
    'GetAllVolumes',
    { _jsns: ZIMBRA_ADMIN_URN },
    { targetServer: selectedServerId },
  )) as { volume?: Array<Volume> };

  const allVolumes = response?.volume ?? [];

  return {
    primaries: allVolumes.filter((item: Volume) => item?.type === 1),
    secondaries: allVolumes.filter((item: Volume) => item?.type === 2),
    indexes: allVolumes.filter((item: Volume) => item?.type === 10),
  };
};
