/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  buildGetMsgBatch,
  normalizeMessage,
} from '../views/domain/global/global-quarantine/quarantine-message-normalizer';
import type { IncompleteMessage } from '../views/domain/global/global-quarantine/quarantine-types';
import { batchService } from './batch-service';
import { domainQueryKeys } from './domain-query-keys';
import { getQuarantineMessages } from './get-quarantine-messages-service';

export const useQuarantineMessages = (accountId: string | undefined) =>
  useQuery({
    queryKey: domainQueryKeys.quarantineMessages(),
    queryFn: async (): Promise<Array<IncompleteMessage>> => {
      const response = await getQuarantineMessages(accountId!);
      const searchResults = response?.Body?.SearchResponse?.m ?? [];
      const msgBatchData = await batchService({
        GetMsgRequest: buildGetMsgBatch(searchResults),
        _jsns: 'urn:zimbra',
      });
      return (msgBatchData?.GetMsgResponse ?? [])
        .map((item: unknown) =>
          normalizeMessage(
            (item as { m?: Array<Parameters<typeof normalizeMessage>[0]> })?.m?.[0] as Parameters<
              typeof normalizeMessage
            >[0],
          ),
        )
        .filter((m: IncompleteMessage | undefined): m is IncompleteMessage => !!m);
    },
    enabled: !!accountId,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
