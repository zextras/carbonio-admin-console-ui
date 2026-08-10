/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { dashboardQueryKeys } from '../services/dashboard-query-keys';

declare const BASE_PATH: string;

async function fetchServerVersion(): Promise<string> {
  const response = await fetch(`${BASE_PATH}.version`);
  if (!response.ok) {
    throw new Error(`Failed to fetch version: ${response.status}`);
  }
  const version = (await response.text()).trim();
  return version;
}

export const useServerVersion = (): {
  serverVersion: string;
  isLoading: boolean;
} => {
  const { data, isLoading } = useQuery({
    queryKey: dashboardQueryKeys.serverVersion(),
    queryFn: fetchServerVersion,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    serverVersion: data ?? '',
    isLoading,
  };
};
