/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

export const resumeDevice = async (
  module: string,
  accountName: string,
  deviceId: string,
): Promise<unknown> =>
  postSoapFetchRequest(
    '/service/admin/soap/zextras',
    {
      _jsns: 'urn:zimbraAdmin',
      module,
      action: 'doResumeDeviceSync',
      accountName,
      deviceId,
    },
    'zextras',
  );
