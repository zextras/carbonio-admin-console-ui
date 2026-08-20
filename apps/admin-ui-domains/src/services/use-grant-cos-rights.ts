/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';

import { grantCosRights, revokeCosRights } from './grant-cos-rights';

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
