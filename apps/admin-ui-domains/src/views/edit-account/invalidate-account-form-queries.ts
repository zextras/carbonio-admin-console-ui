/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { QueryClient } from '@tanstack/react-query';

import { domainQueryKeys } from '../../services/domain-query-keys';

export function invalidateAccountFormQueries(
  queryClient: QueryClient,
  accountId: string,
): void {
  void queryClient.invalidateQueries({
    queryKey: domainQueryKeys.accountDetail(accountId),
  });
  void queryClient.invalidateQueries({
    queryKey: domainQueryKeys.accountCoreAttributes(accountId),
  });
  void queryClient.invalidateQueries({
    queryKey: domainQueryKeys.accountSpecificDetail(accountId),
  });
}
