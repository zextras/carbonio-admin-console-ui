/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { batchService, type DirectoryEntry } from '@zextras/ui-shared';

import { ZIMBRA_ADMIN_URN } from '../constants';

type AccountDeleteRequest = { id: string; _jsns: string };
type DistributionListDeleteRequest = { id: { _content: string }; _jsns: string };

export type BatchDeleteDomainContentsInput = {
  accounts: Array<DirectoryEntry>;
  distributionLists: Array<DirectoryEntry>;
  calendarResources: Array<DirectoryEntry>;
};

export type BatchDeleteDomainContentsResponse = {
  Fault?: Array<{ Reason?: { Text?: string } }>;
};

export async function batchDeleteDomainContents(
  input: BatchDeleteDomainContentsInput,
): Promise<BatchDeleteDomainContentsResponse> {
  const accountDeleteBatch: Array<AccountDeleteRequest> = input.accounts.map((item) => ({
    id: item.id,
    _jsns: ZIMBRA_ADMIN_URN,
  }));
  const dlDeleteBatch: Array<DistributionListDeleteRequest> = input.distributionLists.map(
    (item) => ({
      id: { _content: item.id },
      _jsns: ZIMBRA_ADMIN_URN,
    }),
  );
  const resourceDeleteBatch: Array<AccountDeleteRequest> = input.calendarResources.map((item) => ({
    id: item.id,
    _jsns: ZIMBRA_ADMIN_URN,
  }));

  return batchService({
    DeleteDistributionListRequest: dlDeleteBatch,
    DeleteCalendarResourceRequest: resourceDeleteBatch,
    DeleteAccountRequest: accountDeleteBatch,
    _jsns: 'urn:zimbra',
  });
}
