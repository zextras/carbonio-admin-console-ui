/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { isArray } from 'lodash';

type AdvancedSupportedOptions = Omit<UseQueryOptions<boolean>, 'queryKey' | 'queryFn'> & {
	enabled?: boolean;
};

export const queryFnIsAdvancedSupported = async (): Promise<boolean> => {
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

// React Query hook to check if carbonio advanced is installed
export const useIsAdvanced = (options: AdvancedSupportedOptions = {}) => {
	const { enabled = true, ...queryOptions } = options;

	const { data } = useQuery({
		queryKey: ['advanced-supported'],
		queryFn: queryFnIsAdvancedSupported,
		enabled,
		staleTime: Infinity,
		...queryOptions
	});
	return !!data;
};
