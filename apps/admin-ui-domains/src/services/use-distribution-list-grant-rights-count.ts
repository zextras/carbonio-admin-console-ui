/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { GRP } from '../constants';
import { getGrant } from './get-grant';
import { buildDistributionListGrantsRequest } from './use-distribution-list-grants';

type GrantRightsResponse = {
  grant?: Array<{ right?: Array<unknown> }>;
};

export function countGrantRights(response: GrantRightsResponse | undefined): number {
  if (!Array.isArray(response?.grant)) {
    return 0;
  }
  return response.grant.reduce((total, grant) => total + (grant?.right?.length ?? 0), 0);
}

function buildGranteeRightsRequest(listId: string): Record<string, unknown> {
  return {
    grantee: {
      type: GRP,
      by: 'id',
      _content: listId,
      all: false,
    },
  };
}

type UseDistributionListGrantRightsCountOptions = {
  onCounted?: (totalRights: number) => void;
};

export const useDistributionListGrantRightsCount = ({
  onCounted,
}: UseDistributionListGrantRightsCountOptions = {}) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  return useMutation({
    mutationFn: async (listId: string) => {
      const [granteeResponse, targetResponse] = await Promise.all([
        getGrant(buildGranteeRightsRequest(listId)),
        getGrant(buildDistributionListGrantsRequest(listId)),
      ]);
      return countGrantRights(granteeResponse) + countGrantRights(targetResponse);
    },
    onSuccess: (totalRights) => {
      onCounted?.(totalRights);
    },
    onError: (error: Error) => {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label:
          error?.message ||
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
};
