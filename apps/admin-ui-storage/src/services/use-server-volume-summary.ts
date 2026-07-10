/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { bucketVolumeQueryKeys } from './bucket-volume-query-keys';
import {
  getServerVolumeSummaryAdvanced,
  getServerVolumeSummaryCE,
} from './server-volume-summary-service';

export const useServerVolumeSummary = (
  isAdvanced: boolean,
  allServersList: Array<{ name?: string; a?: Array<{ n?: string; _content?: string }> }>,
) =>
  useQuery({
    queryKey: [...bucketVolumeQueryKeys.serverVolumeSummary(isAdvanced), allServersList.length],
    queryFn: async () => {
      if (isAdvanced) {
        return getServerVolumeSummaryAdvanced(
          allServersList as Array<{ name?: string; a?: Array<{ n?: string; _content?: string }> }>,
        );
      }
      return getServerVolumeSummaryCE(
        allServersList as Array<{ name?: string; a?: Array<{ n?: string; _content?: string }> }>,
      );
    },
    enabled: allServersList.length > 0,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
