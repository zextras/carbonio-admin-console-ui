/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { getMailqueueInformation } from './get-mail-queue-info';
import { mtaQueryKeys } from './mta-query-keys';

export function useMailQueueInfo(serverName: string | undefined, enabled = true) {
  return useQuery({
    queryKey: mtaQueryKeys.mailQueueInfo(serverName ?? ''),
    queryFn: () => getMailqueueInformation(serverName!),
    enabled: Boolean(serverName) && enabled,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
