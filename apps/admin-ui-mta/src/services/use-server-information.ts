/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { getServerInformationByName } from './get-server-information';
import { mtaQueryKeys } from './mta-query-keys';

export function useServerInformation(serverName: string | undefined, applyConfig = true) {
  return useQuery({
    queryKey: mtaQueryKeys.server(serverName ?? '', applyConfig),
    queryFn: () => getServerInformationByName(serverName!, applyConfig),
    enabled: Boolean(serverName),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
