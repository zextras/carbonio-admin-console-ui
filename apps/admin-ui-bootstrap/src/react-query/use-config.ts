/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { SHELL_APP_ID } from '../constants';
import { getSoapFetch } from '../network/fetch';
import { Attribute } from '../store/shared/domains/types';

const soapFetch = getSoapFetch(SHELL_APP_ID);

type ConfigOptions = Omit<UseQueryOptions<Array<Attribute>>, 'queryKey' | 'queryFn'> & {
	enabled?: boolean;
};

// Query function for all config attributes
const queryFn = async (): Promise<Array<Attribute>> => {
	const response = await soapFetch('GetAllConfig', {
		_jsns: 'urn:zimbraAdmin'
	});

	const attributes = (response as any)?.a;
	return (attributes && Array.isArray(attributes) ? attributes : []) as Array<Attribute>;
};

export const useAllConfig = (options: ConfigOptions = {}) => {
	const { enabled = true, ...queryOptions } = options;

	return useQuery({
		queryKey: ['all-config'],
		queryFn,
		enabled,
		staleTime: 30 * 60 * 1000, // 30 minutes - config changes rarely
		gcTime: 60 * 60 * 1000, // 1 hour - keep in cache longer
		retry: 3,
		retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
		...queryOptions
	});
};

export const useConfigAttribute = (key: string, options: ConfigOptions = {}) => {
	const { data: allConfig, ...result } = useAllConfig(options);

	return {
		...result,
		data: allConfig?.find((attr) => attr.n === key)?._content
	};
};
