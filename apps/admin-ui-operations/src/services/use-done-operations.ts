/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';
import { useMailstoreServers } from '@zextras/ui-shared';
import { find, map } from 'lodash-es';

import { type DoneOperationsContent, type Operation } from '../types/operations';
import { doneOperationsContentSchema } from '../types/operations-schemas';
import { getAllDoneOperations } from './get-all-done-operation';
import { operationQueryKeys } from './operation-query-keys';

const fetchDoneOperations = async (): Promise<Array<Operation>> => {
	const response = await getAllDoneOperations();
	let parsed: DoneOperationsContent = {};
	try {
		const raw = JSON.parse(response?.Body?.response?.content ?? '{}');
		const result = doneOperationsContentSchema.safeParse(raw);
		if (result.success) {
			parsed = result.data as DoneOperationsContent;
		}
	} catch {
		parsed = {};
	}
	if (parsed?.ok) {
		return parsed?.response?.operationList ?? [];
	}
	return [];
};

export const useDoneOperations = () => {
	const { data: allServersList = [] } = useMailstoreServers();

	return useQuery({
		queryKey: operationQueryKeys.doneOperations(),
		queryFn: fetchDoneOperations,
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
