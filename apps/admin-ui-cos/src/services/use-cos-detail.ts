/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getCosGeneralInformation } from '@zextras/ui-shared';

import { cosQueryKeys } from './cos-query-keys';

export const useCosDetail = (cosId: string | undefined) => {
  return useQuery({
    queryKey: cosQueryKeys.detail(cosId ?? ''),
    queryFn: () => getCosGeneralInformation(cosId!),
    enabled: !!cosId,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
