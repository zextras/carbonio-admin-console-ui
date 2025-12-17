/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { soapFetch } from '../network/fetch';
import { useUserAccount } from './use-account';

// Query function for domain information
const queryFn = async (userName: string): Promise<any> => {
  const response = await soapFetch('GetDomain', {
    _jsns: 'urn:zimbraAdmin',
    domain: {
      by: 'name',
      _content: userName,
    },
  });

  return (response as any)?.domain?.[0];
};

export const useDomainInformation = () => {
  const user = useUserAccount();
  const userName = user?.name.split('@')[1];

  return useQuery({
    queryKey: ['domain-information', userName],
    queryFn: () => queryFn(userName || ''),
    enabled: Boolean(userName),
    staleTime: 10 * 60 * 1000, // 10 minutes - domain info changes moderately
    gcTime: 20 * 60 * 1000, // 20 minutes - keep in cache for reasonable time
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};
