/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { GetSessionsRequest, GetSessionsResponse } from '../../types';

export const getSessions = async (
  type: string,
  accountName: string,
  offset?: number,
): Promise<GetSessionsResponse> =>
  soapFetch<GetSessionsRequest, GetSessionsResponse>(
    `GetSessions`,
    {
      _jsns: 'urn:zimbraAdmin',
      type,
      offset: offset || 0,
      sortBy: 'nameAsc',
      refresh: 1,
    },
    {
      otherAccount: accountName,
    },
  );
