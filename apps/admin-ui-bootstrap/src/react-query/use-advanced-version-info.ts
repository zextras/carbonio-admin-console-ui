/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { useIsAdvanced } from './use-is-advanced-supported';

type AdvancedVersionInfo = {
	domain: string;
	minApiVersion: number;
	maxApiVersion: number;
	version: string;
};

type useAdvancedVersionInfoOptions = Omit<
	UseQueryOptions<AdvancedVersionInfo | null>,
	'queryKey' | 'queryFn'
> & {
	enabled?: boolean;
};

// Query function to get version info (only if advanced is supported)
export const queryFnVersionInfo = async (): Promise<AdvancedVersionInfo | null> => {
	try {
		const response = await fetch('/zx/auth/supported');
		if (response.ok) {
			const data = await response.json();
			if (data?.domain) {
				const versionInfo = {
					domain: data.domain,
					minApiVersion: data.minApiVersion,
					maxApiVersion: data.maxApiVersion,
					version: data.version
				};

				return versionInfo;
			}
		}
	} catch {
		// Handle network errors or other fetch failures
	}
	return null;
};

// React Query hook to get advanced version information
export const useAdvancedVersionInfo = (options: useAdvancedVersionInfoOptions = {}) => {
	const isAdvanced = useIsAdvanced();
	const { enabled = isAdvanced, ...queryOptions } = options;

	return useQuery({
		queryKey: ['advanced-version-info'],
		queryFn: queryFnVersionInfo,
		enabled,
		staleTime: Infinity,
		...queryOptions
	});
};
