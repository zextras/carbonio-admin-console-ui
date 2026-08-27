/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { endSession } from './end-session';

type EndSessionVars = {
  sessionId: string;
  accountName: string;
  token: string;
};

export const useEndSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: EndSessionVars) => {
      const response = await endSession(vars.sessionId, vars.accountName, vars.token);
      if (!response?._jsns) {
        throw new Error('Session end failed');
      }
      return response;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.userSessions(vars.accountName),
      });
    },
  });
};
