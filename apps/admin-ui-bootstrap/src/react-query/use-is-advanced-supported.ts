/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { isArray } from 'lodash';

type AdvancedSupportedSuccess = {
	supported: boolean;
};

type AdvancedSupportedError = {
	errorMessage: string;
};

type AdvancedSupportedResult = AdvancedSupportedSuccess | AdvancedSupportedError;

type AdvancedSupportedOptions = Omit<
	UseQueryOptions<AdvancedSupportedResult | undefined>,
	'queryKey' | 'queryFn'
> & {
	enabled?: boolean;
};

export const queryFnIsAdvancedSupported = async () => {
	try {
		const response = await fetch('/services/catalog/services');
		if (response.ok) {
			const data = await response.json();
			if ('items' in data && isArray<string>(data.items)) {
				const installedServices = data.items as Array<string>;
				const isAdvanced =
					installedServices.filter((service) => service === 'carbonio-advanced').length > 0;
				return { supported: isAdvanced };
			}
		}
		return { supported: false };
	} catch (error) {
		// If the API is unreachable, treat as advanced not supported
		console.error('Failed to check advanced support: ', error);
		return { errorMessage: 'Failed to check advanced support: ' };
	}
};

// React Query hook to check if carbonio advanced is installed
const useAdvancedSupportedQuery = (options: AdvancedSupportedOptions = {}) => {
	const { enabled = true, ...queryOptions } = options;

	const { data } = useQuery({
		queryKey: ['advanced-supported'],
		queryFn: queryFnIsAdvancedSupported,
		enabled,
		retry: 3,
		staleTime: Infinity,
		...queryOptions
	});
	return data;
};

export const useIsAdvanced = () => {
	const data = useAdvancedSupportedQuery();
	return data && 'supported' in data ? !!data.supported : false;
};
