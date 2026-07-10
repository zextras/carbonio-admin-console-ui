/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import type { HsmPolicyFromServer } from '../../types';
import { bucketVolumeQueryKeys } from './bucket-volume-query-keys';
import { getHsmPolicyList } from './hsm-service';

export const useHsmPolicyList = (server: string) =>
  useQuery({
    queryKey: bucketVolumeQueryKeys.hsmPolicies(server),
    queryFn: async (): Promise<Array<HsmPolicyFromServer>> => getHsmPolicyList(server),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
