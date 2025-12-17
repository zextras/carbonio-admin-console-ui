/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { soapFetch } from '../network/fetch';

type DomainInfoOptions = Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'> & {
	enabled?: boolean;
	domainId?: string;
	type?: string;
};

// Query function for domain information
const queryFn = async (domainId: string, type: string = 'name'): Promise<any> => {
	const response = await soapFetch('GetDomain', {
		_jsns: 'urn:zimbraAdmin',
		domain: {
			by: type,
			_content: domainId
		}
	});

	return (response as any)?.domain?.[0];
};

export const useDomainInformation = (domainId?: string, options: DomainInfoOptions = {}) => {
	const { enabled = true, type = 'name', ...queryOptions } = options;

	return useQuery({
		queryKey: ['domain-information', domainId, type],
		queryFn: () => queryFn(domainId || '', type),
		enabled: enabled && Boolean(domainId),
		staleTime: 10 * 60 * 1000, // 10 minutes - domain info changes moderately
		gcTime: 20 * 60 * 1000, // 20 minutes - keep in cache for reasonable time
		retry: 2,
		retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
		...queryOptions
	});
};
