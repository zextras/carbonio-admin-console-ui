/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { backupQueryKeys } from './backup-query-keys';
import { getServerConfig } from './get-server-config';

export const useServerConfig = (serverId: string | undefined) =>
  useQuery({
    queryKey: backupQueryKeys.serverConfig(serverId),
    queryFn: () => getServerConfig(serverId!),
    enabled: !!serverId,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
