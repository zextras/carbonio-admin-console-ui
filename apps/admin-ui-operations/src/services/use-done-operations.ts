/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';
import { useMailstoreServers } from '@zextras/ui-shared';
import { find, map } from 'lodash-es';

import { type Operation } from '../types/operations';
import { getAllDoneOperations } from './get-all-done-operation';
import { operationQueryKeys } from './operation-query-keys';

export const useDoneOperations = () => {
	const { data: allServersList = [] } = useMailstoreServers();

	return useQuery({
		queryKey: operationQueryKeys.doneOperations(),
		queryFn: async (): Promise<Array<Operation>> => {
			const response = await getAllDoneOperations();
			const res = JSON.parse(response?.Body?.response?.content);
			if (res?.ok) {
				return (res?.response?.operationList ?? []) as Array<Operation>;
			}
			return [];
		},
		select: (operations: Array<Operation>): Array<Operation> =>
			map(operations, (item) => {
				const matchingServer = find(allServersList, { id: item.serverId });
				if (matchingServer) {
					return { ...item, serverName: matchingServer.name };
				}
				return item;
			}),
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
};
