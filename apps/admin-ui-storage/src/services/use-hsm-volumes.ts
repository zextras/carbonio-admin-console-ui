/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import type { Volume } from '../../types';
import { getAllVolumesForHsm } from './hsm-service';
import { s3ConnectorVolumeQueryKeys } from './s3-connector-volume-query-keys';

export const useHsmVolumes = (serverId: string, enabled: boolean) =>
  useQuery({
    queryKey: s3ConnectorVolumeQueryKeys.hsmVolumes(serverId),
    queryFn: async (): Promise<Array<Volume>> => getAllVolumesForHsm(serverId),
    enabled,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
