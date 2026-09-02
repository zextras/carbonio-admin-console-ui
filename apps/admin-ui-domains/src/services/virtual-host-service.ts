/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import { ZIMBRA_ADMIN_URN } from '../constants';

export type IssueCertResponse = Record<string, unknown>;

export function issueCert(
  domain: string | undefined,
  chainType: string,
): Promise<IssueCertResponse> {
  return soapFetch('IssueCert', {
    _jsns: ZIMBRA_ADMIN_URN,
    domain,
    chainType,
  });
}

/** @deprecated Use issueCert */
export const IssueCertiRequest = issueCert;
