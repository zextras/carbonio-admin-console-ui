/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { isArray } from 'lodash';

type AdvancedVersionInfo = {
	domain: string;
	minApiVersion: string;
	maxApiVersion: string;
	version: string;
};

type AdvancedSupportedOptions = Omit<UseQueryOptions<boolean>, 'queryKey' | 'queryFn'> & {
	enabled?: boolean;
};

type AdvancedOptions = Omit<
	UseQueryOptions<AdvancedVersionInfo | null>,
	'queryKey' | 'queryFn'
> & {
	enabled?: boolean;
};

// Query function to check if advanced features are supported
const queryFnIsAdvanced = async (): Promise<boolean> => {
	const response = await fetch('/services/catalog/services');
	if (response.ok) {
		const data = await response.json();
		if ('items' in data && isArray<string>(data.items)) {
			const installedServices = data.items as Array<string>;
			return installedServices.includes('carbonio-advanced');
		}
	}
	return false;
};

// Query function to get version info (only if advanced is supported)
const queryFnVersionInfo = async (): Promise<AdvancedVersionInfo | null> => {
	const response = await fetch('/zx/auth/supported');
	if (response.ok) {
		const data = await response.json();
		if (data?.domain) {
			return {
				domain: data.domain,
				minApiVersion: data.minApiVersion,
				maxApiVersion: data.maxApiVersion,
				version: data.version
			};
		}
	}
	return null;
};

/**
 * React Query hook to check if advanced features are supported
 * @returns Query result with boolean indicating if advanced features are available
 */
export const useIsAdvancedSupported = (options: AdvancedSupportedOptions = {}) => {
	const { enabled = true, ...queryOptions } = options;

	return useQuery({
		queryKey: ['advanced-supported'],
		queryFn: queryFnIsAdvanced,
		enabled,
		staleTime: Infinity, // Advanced support doesn't change during session
		...queryOptions
	});
};

/**
 * React Query hook to get advanced version information
 * @returns Query result with version info or null
 */
export const useAdvancedVersionInfo = (options: AdvancedOptions = {}) => {
	const { enabled = true, ...queryOptions } = options;

	return useQuery({
		queryKey: ['advanced-version-info'],
		queryFn: queryFnVersionInfo,
		enabled,
		staleTime: Infinity, // Version info doesn't change during session
		...queryOptions
	});
};

/**
 * Combined hook that returns both advanced support status and version info
 * @returns Object with isAdvanced boolean and version info
 */
export const useAdvanced = (optionsInput: { enabled?: boolean } = {}) => {
	const { enabled = true } = optionsInput;
	const { data: isAdvanced = false, ...advancedQuery } = useIsAdvancedSupported({ enabled });
	const { data: versionInfo, ...versionQuery } = useAdvancedVersionInfo({
		enabled: Boolean(isAdvanced && enabled)
	});

	return {
		isAdvanced,
		versionInfo,
		isLoading: advancedQuery.isLoading || versionQuery.isLoading,
		isError: advancedQuery.isError || versionQuery.isError,
		error: advancedQuery.error || versionQuery.error
	};
};
