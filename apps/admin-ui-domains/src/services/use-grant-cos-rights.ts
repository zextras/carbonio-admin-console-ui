/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { grantAllCosRights, grantCosRights, revokeCosRights } from './grant-cos-rights';

type CosRightsVariables = {
  cosId: string;
  domainName: string;
};

export function useGrantCosRights() {
  return useMutation({
    mutationFn: ({ cosId, domainName }: CosRightsVariables) => grantCosRights(cosId, domainName),
  });
}

export function useRevokeCosRights() {
  return useMutation({
    mutationFn: ({ cosId, domainName }: CosRightsVariables) => revokeCosRights(cosId, domainName),
  });
}

export type GrantAllCosRightsVariables = {
  domainName: string;
  cosIds: Array<string>;
};

export const useGrantAllCosRights = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ domainName, cosIds }: GrantAllCosRightsVariables) =>
      grantAllCosRights(domainName, cosIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...domainQueryKeys.all, 'initialized-domains'],
      });
    },
  });
};
