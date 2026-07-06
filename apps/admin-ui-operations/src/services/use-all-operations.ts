/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';
import { useAllServers } from '@zextras/ui-shared';

import { type Operation } from '../types/operations';
import { getAllOperations } from './get-all-operations';
import { operationQueryKeys } from './operation-query-keys';

type UseAllOperationsOptions = {
	select?: (data: Array<Operation>) => Array<Operation>;
};

export const useAllOperations = (options?: UseAllOperationsOptions) => {
	const { data: serverList = [] } = useAllServers();
	const serverName = serverList[0]?.name;

	return useQuery({
		queryKey: operationQueryKeys.allOperations(),
		queryFn: async (): Promise<Array<Operation>> => {
			const response = await getAllOperations();
			const res = JSON.parse(response?.Body?.response?.content);
			if (res?.response?.[`${serverName}`]?.ok) {
				return (res?.response?.[`${serverName}`]?.response?.operationList ??
					[]) as Array<Operation>;
			}
			return [];
		},
		enabled: !!serverName,
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
		select: options?.select,
	});
};
