/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { getMailQueue } from './get-mail-queue';
import { mtaQueryKeys } from './mta-query-keys';

export function useMailQueue(
  serverName: string | undefined,
  queueName = 'active',
  offset = 0,
  limit = 25,
  enabled = true,
) {
  return useQuery({
    queryKey: mtaQueryKeys.mailQueue(serverName ?? '', queueName, offset, limit),
    queryFn: () => getMailQueue(serverName!, queueName, offset, limit),
    enabled: Boolean(serverName) && enabled,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
