/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { ListBucketsContent, SoapResponseBody } from '../../types';
import { ZIMBRA_ADMIN_URN } from '../constants';

export const listBuckets = async (server: string): Promise<ListBucketsContent> => {
  const res = await postSoapFetchRequest<Record<string, unknown>, SoapResponseBody>(
    '/service/admin/soap/zextras',
    {
      _jsns: ZIMBRA_ADMIN_URN,
      module: 'ZxCore',
      action: 'listBuckets',
      type: 'all',
      targetServer: server,
      showSecrets: true,
    },
    'zextras',
  );
  return JSON.parse(res.Body.response.content);
};
