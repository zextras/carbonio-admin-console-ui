
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { COS } from '../constants';
import { cosQueryKeys } from './cos-query-keys';
import { getFileQuotaById } from './get-file-quota';

export const useFileQuota = (cosId: string | undefined, enabled: boolean) => {
  return useQuery({
    queryKey: cosQueryKeys.fileQuota(cosId ?? ''),
    queryFn: () => getFileQuotaById(cosId!, COS),
    enabled: !!cosId && enabled,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
