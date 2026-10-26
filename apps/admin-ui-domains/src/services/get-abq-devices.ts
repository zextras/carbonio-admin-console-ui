/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import { ZIMBRA_ADMIN_URN, ZX_MOBILE } from '../constants';

export const getAbqDevices = async (): Promise<unknown> =>
  postSoapFetchRequest(
    '/service/admin/soap/zextras',
    {
      _jsns: ZIMBRA_ADMIN_URN,
      module: ZX_MOBILE,
      action: 'abqListDevices',
    },
    'zextras',
  );
