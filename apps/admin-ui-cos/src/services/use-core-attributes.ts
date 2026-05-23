
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { cosQueryKeys } from './cos-query-keys';
import { type CoreAttributeRequest, getCoreAttributes } from './get-core-attributes';

export const useCoreAttributes = (body: Array<CoreAttributeRequest>) => {
  return useQuery({
    queryKey: cosQueryKeys.coreAttributes(body),
    queryFn: () => getCoreAttributes(body),
    enabled: body.length > 0,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
