/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMutation } from '@tanstack/react-query';

import { getDelegateAuthRequest } from './get-delegate-auth-request';

export const useDelegateAuth = () =>
  useMutation({
    mutationFn: async (accountId: string): Promise<string | null> => {
      const data = await getDelegateAuthRequest(accountId);
      return data?.authToken?.[0]?._content ?? null;
    },
  });
