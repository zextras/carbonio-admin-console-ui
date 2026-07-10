/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { bucketVolumeQueryKeys } from './bucket-volume-query-keys';
import { getZxPowerStoreServerAttributes, type PowerstoreAttributes } from './hsm-service';

export const useZxPowerStoreServerAttributes = (server: string) =>
  useQuery({
    queryKey: bucketVolumeQueryKeys.powerstoreAttrs(server),
    queryFn: async (): Promise<PowerstoreAttributes> => getZxPowerStoreServerAttributes(server),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
