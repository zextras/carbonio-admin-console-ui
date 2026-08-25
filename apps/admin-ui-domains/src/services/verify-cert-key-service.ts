/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import { ZIMBRA_ADMIN_URN } from '../constants';

export type VerifyCertKeyBody = {
  ca: string;
  cert: string;
  privkey: string;
};

export type VerifyCertKeyResponse = {
  verifyResult?: boolean | string;
};

export function verifyCertKey(body: VerifyCertKeyBody): Promise<VerifyCertKeyResponse> {
  return soapFetch('VerifyCertKey', {
    _jsns: ZIMBRA_ADMIN_URN,
    ca: body.ca.replaceAll('\r', ''),
    cert: body.cert.replaceAll('\r', ''),
    privkey: body.privkey.replaceAll('\r', ''),
  });
}
