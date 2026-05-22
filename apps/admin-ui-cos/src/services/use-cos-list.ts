/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getCosList } from './search-cos-service';

type UseCosListOptions = {
  searchQuery: string;
  limit: number;
  offset: number;
  enabled?: boolean;
};

export const useCosList = ({ searchQuery, limit, offset, enabled = true }: UseCosListOptions) => {
  return useQuery({
    queryKey: ['cos-list', searchQuery, limit, offset],
    queryFn: () => getCosList(searchQuery, limit, offset),
    enabled,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
