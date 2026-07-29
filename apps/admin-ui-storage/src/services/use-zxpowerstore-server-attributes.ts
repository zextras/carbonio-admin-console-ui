/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { getZxPowerStoreServerAttributes, type PowerstoreAttributes } from './hsm-service';
import { s3ConnectorVolumeQueryKeys } from './s3-connector-volume-query-keys';

export const useZxPowerStoreServerAttributes = (server: string) =>
  useQuery({
    queryKey: s3ConnectorVolumeQueryKeys.powerstoreAttrs(server),
    queryFn: async (): Promise<PowerstoreAttributes> => getZxPowerStoreServerAttributes(server),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
