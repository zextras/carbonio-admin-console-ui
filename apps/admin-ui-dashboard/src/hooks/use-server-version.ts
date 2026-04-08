/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

declare const BASE_PATH: string;

const serverVersionQueryKeys = {
  all: ['server-version'],
};

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
    queryKey: serverVersionQueryKeys.all,
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
