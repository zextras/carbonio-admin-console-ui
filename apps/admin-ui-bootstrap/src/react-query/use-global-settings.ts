/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { postSoapFetchRequest } from '../network/fetch';

export type GlobalConfig = Record<string, any>;

type GlobalConfigOptions = Omit<UseQueryOptions<GlobalConfig>, 'queryKey' | 'queryFn'> & {
	enabled?: boolean;
};

// Query function for global configuration
const queryFn = async (): Promise<GlobalConfig> => {
	const postRequest = postSoapFetchRequest('admin-ui-console');

	const response = (await postRequest('/service/admin/soap/zextras', {
		zextras: {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxConfig',
			action: 'dump_global_config'
		}
	})) as any;

	const responseData = JSON.parse(response?.Body?.response?.content);
	const globalConfig = responseData?.response;

	return globalConfig || {};
};

export const useGlobalSettings = (options: GlobalConfigOptions = {}) => {
	const { enabled = true, ...queryOptions } = options;

	return useQuery({
		queryKey: ['global-config'],
		queryFn,
		enabled,
		staleTime: 30 * 60 * 1000, // 30 minutes - global config changes rarely
		gcTime: 60 * 60 * 1000, // 1 hour - keep in cache longer
		retry: 3,
		retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
		...queryOptions
	});
};
