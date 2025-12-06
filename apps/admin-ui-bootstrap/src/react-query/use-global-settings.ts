/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';

import { postSoapFetchRequest } from '../network/fetch';

import { useAllConfig } from './use-config';

type GlobalConfig = Record<string, any>;

type GlobalConfigOptions = Omit<UseQueryOptions<GlobalConfig>, 'queryKey' | 'queryFn'> & {
	enabled?: boolean;
};

// Query function for global configuration
const queryFn = async (): Promise<GlobalConfig> => {
	const response = (await postSoapFetchRequest('/service/admin/soap/zextras', {
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

// Hook for accessing global carbonio send analytics flag
export const useGlobalCarbonioSendAnalytics = () => {
	const { data: allConfig, ...result } = useAllConfig();

	const sendAnalytics = useMemo(() => {
		if (!allConfig) return false;

		const analyticsConfig = allConfig.find(
			(items: { n: string }) => items.n === 'carbonioSendAnalytics'
		)?._content;

		return analyticsConfig === 'TRUE';
	}, [allConfig]);

	return {
		...result,
		data: sendAnalytics
	};
};

// Allows components to subscribe to specific config keys only
export const useGlobalConfigValue = <T = any>(
	key: string,
	defaultValue?: T,
	options: GlobalConfigOptions = {}
) => {
	const { data, ...result } = useGlobalSettings(options);

	return {
		...result,
		data: data?.[key] ?? defaultValue
	};
};

// Transforms global config object into an array format for easy iteration
export const useGlobalConfigList = (options: GlobalConfigOptions = {}) => {
	const { data, ...result } = useGlobalSettings(options);

	const configList = useMemo(() => {
		if (!data) return [];
		return Object.entries(data).map(([key, value]) => ({ key, value }));
	}, [data]);

	return {
		...result,
		data: configList
	};
};
