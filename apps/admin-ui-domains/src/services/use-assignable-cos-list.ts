/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueries } from '@tanstack/react-query';
import { useUserAccount, useUserSettings } from '@zextras/ui-shared';

import { TRUE } from '../constants';
import { ASSIGN_COS_RIGHT, checkAssignCosRight } from './check-assign-cos-right';
import { domainQueryKeys } from './domain-query-keys';

type CosEntry = { id: string; name: string };

/**
 * COSes the current admin can assign to an account: every COS for a global admin, only the ones
 * with the `assignCos` right for a delegated admin. Returns `undefined` while it is resolving.
 */
export const useAssignableCosList = (
  cosList: Array<CosEntry> | undefined,
): Array<CosEntry> | undefined => {
  const currentUser = useUserAccount();
  const userSetting = useUserSettings();
  const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;
  const userName = currentUser?.name ?? '';

  const rights = useQueries({
    queries: (cosList ?? []).map((cos) => ({
      queryKey: domainQueryKeys.checkRight(cos.id, userName, ASSIGN_COS_RIGHT),
      queryFn: () => checkAssignCosRight(cos.id, userName),
      enabled: !isGlobalAdmin && !!userName,
      staleTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    })),
  });

  if (!cosList) {
    return undefined;
  }
  if (isGlobalAdmin) {
    return cosList;
  }
  if (rights.some((right) => right.isPending)) {
    return undefined;
  }
  return cosList.filter((_, index) => rights[index]?.data === true);
};
