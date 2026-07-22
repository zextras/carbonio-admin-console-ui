/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';
import { soapFetch } from '@zextras/ui-shared';

import type { Volume } from '../../types';
import { ZIMBRA_ADMIN_URN } from '../constants';
import { s3ConnectorVolumeQueryKeys } from './s3-connector-volume-query-keys';

type GetVolumeRequest = {
  _jsns: string;
  module: string;
  id: string;
};

type GetVolumeResponse = {
  volume: Array<Volume>;
  _jsns: string;
};

export const useGetVolume = (
  volumeId: string,
  selectedServerId: string,
  enabled: boolean,
) =>
  useQuery({
    queryKey: s3ConnectorVolumeQueryKeys.getVolume(volumeId, selectedServerId),
    queryFn: async (): Promise<GetVolumeResponse> =>
      soapFetch<GetVolumeRequest, GetVolumeResponse>(
        'GetVolume',
        {
          _jsns: ZIMBRA_ADMIN_URN,
          module: 'ZxPowerstore',
          id: volumeId,
        },
        {
          targetServer: selectedServerId,
        },
      ),
    enabled,
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
