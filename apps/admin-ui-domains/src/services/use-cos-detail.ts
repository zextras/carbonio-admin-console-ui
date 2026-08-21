/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQuery } from '@tanstack/react-query';
import { getCosGeneralInformation } from '@zextras/ui-shared';

import { domainQueryKeys } from './domain-query-keys';
import { flattenAccountAttrs } from './use-account-detail';

export const useCosDetail = (cosId: string | undefined) =>
  useQuery({
    queryKey: domainQueryKeys.cosDetail(cosId ?? ''),
    queryFn: async () => {
      const data = await getCosGeneralInformation(cosId!);
      const obj = flattenAccountAttrs(data?.cos?.[0]?.a);
      obj.zimbraPrefMailForwardingAddress = obj.zimbraPrefMailForwardingAddress ?? '';
      obj.zimbraPrefCalendarForwardInvitesTo = obj.zimbraPrefCalendarForwardInvitesTo ?? '';
      return obj;
    },
    enabled: !!cosId,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
