/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { getAllVolumesForServer, type VolumeBuckets } from './all-volumes-service';
import { s3ConnectorVolumeQueryKeys } from './s3-connector-volume-query-keys';

export const useAllVolumes = (
  server: string,
  selectedServerId: string,
  isAdvanced: boolean,
) =>
  useQuery({
    queryKey: s3ConnectorVolumeQueryKeys.allVolumes(selectedServerId),
    queryFn: async (): Promise<VolumeBuckets> =>
      getAllVolumesForServer(server, selectedServerId, isAdvanced),
    enabled: !!selectedServerId,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
