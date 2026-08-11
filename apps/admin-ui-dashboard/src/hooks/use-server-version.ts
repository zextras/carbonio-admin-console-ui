/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { dashboardQueryKeys } from '../services/dashboard-query-keys';
import { getServerVersion } from '../services/get-server-version';

export const useServerVersion = (): {
	serverVersion: string;
	isLoading: boolean;
} => {
	const { data, isLoading } = useQuery({
		queryKey: dashboardQueryKeys.serverVersion(),
		queryFn: async () => {
			const res = await getServerVersion();
			if (res.type === 'error') {
				throw new Error(res.error);
			}
			return res.version;
		},
		staleTime: Infinity,
		gcTime: Infinity,
		retry: 1,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	return {
		serverVersion: data ?? '',
		isLoading,
	};
};
