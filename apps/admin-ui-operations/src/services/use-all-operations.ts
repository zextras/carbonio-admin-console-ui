/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';
import { useAllServers } from '@zextras/ui-shared';

import { type Operation, type OperationsContent } from '../types/operations';
import { operationsContentSchema } from '../types/operations-schemas';
import { getAllOperations } from './get-all-operations';
import { operationQueryKeys } from './operation-query-keys';

type UseAllOperationsOptions = {
  select?: (data: Array<Operation>) => Array<Operation>;
};

const fetchAllOperations = async (serverName: string): Promise<Array<Operation>> => {
  const response = await getAllOperations();
  let parsed: OperationsContent = {};
  try {
    const raw = JSON.parse(response?.Body?.response?.content ?? '{}');
    const result = operationsContentSchema.safeParse(raw);
    if (result.success) {
      parsed = result.data as OperationsContent;
    }
  } catch {
    parsed = {};
  }
  if (parsed?.response?.[serverName]?.ok) {
    return parsed?.response?.[serverName]?.response?.operationList ?? [];
  }
  return [];
};

export const useAllOperations = (options?: UseAllOperationsOptions) => {
  const { data: serverList = [] } = useAllServers();
  const serverName = serverList[0]?.name;

  return useQuery({
    queryKey: operationQueryKeys.allOperations(),
    queryFn: () => fetchAllOperations(serverName ?? ''),
    enabled: !!serverName,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    select: options?.select,
  });
};
